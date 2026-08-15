import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import type { FormaPagamento, TipoPedido } from '../generated/prisma/enums.js';

/**
 * Serviços do cardápio público — sem autenticação.
 *
 * A empresa é resolvida pelo slug da URL, e todas as consultas ficam presas a
 * esse `empresaId`. Nenhum valor monetário vem do cliente: preço de produto,
 * preço de adicional e taxa de entrega são sempre lidos do banco.
 */

interface AdicionalEscolhido {
  adicionalId: string;
  quantidade: number;
}

interface ItemEntrada {
  produtoId: string;
  quantidade: number;
  observacao?: string;
  adicionais?: AdicionalEscolhido[];
}

export interface PedidoEntrada {
  cliente: string;
  telefone: string;
  tipo: TipoPedido;
  endereco?: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
  };
  formaPagamento: FormaPagamento;
  trocoPara?: number;
  observacao?: string;
  itens: ItemEntrada[];
}

/** Empresa ativa referente ao slug, ou 404. */
async function resolverEmpresa(slug: string) {
  const empresa = await prisma.empresa.findUnique({
    where: { slug },
    select: { id: true, nome: true, ativo: true, taxaEntrega: true },
  });

  if (!empresa || !empresa.ativo) throw AppError.naoEncontrado('Estabelecimento');

  return empresa;
}

/**
 * Cardápio completo numa única resposta: categorias, produtos e os grupos de
 * adicionais de cada produto. Evita o frontend disparar N requisições.
 */
export async function cardapio(slug: string) {
  const empresa = await resolverEmpresa(slug);

  const [categorias, produtos] = await Promise.all([
    prisma.categoria.findMany({
      where: { empresaId: empresa.id, ativo: true },
      select: { id: true, nome: true, icone: true, ordem: true },
      orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
    }),
    prisma.produto.findMany({
      where: { empresaId: empresa.id },
      select: {
        id: true,
        nome: true,
        descricao: true,
        ingredientes: true,
        badges: true,
        preco: true,
        imagem: true,
        disponivel: true,
        ordem: true,
        categoriaId: true,
        gruposAdicionais: {
          orderBy: { ordem: 'asc' },
          select: {
            grupo: {
              select: {
                id: true,
                nome: true,
                descricao: true,
                minSelecao: true,
                maxSelecao: true,
                permiteRepetir: true,
                ativo: true,
                opcoes: {
                  where: { disponivel: true },
                  orderBy: { ordem: 'asc' },
                  select: { id: true, nome: true, preco: true, disponivel: true },
                },
              },
            },
          },
        },
      },
      orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
    }),
  ]);

  return {
    empresa: { id: empresa.id, nome: empresa.nome, taxaEntrega: empresa.taxaEntrega },
    categorias,
    produtos: produtos.map((produto) => ({
      ...produto,
      gruposAdicionais: produto.gruposAdicionais
        .map((vinculo) => vinculo.grupo)
        .filter((grupo) => grupo.ativo && grupo.opcoes.length > 0),
    })),
  };
}

/**
 * Cria o pedido calculando todos os valores no servidor.
 * O que o cliente manda são apenas identificadores e quantidades.
 */
export async function criarPedido(slug: string, entrada: PedidoEntrada) {
  const empresa = await resolverEmpresa(slug);

  if (entrada.tipo === 'ENTREGA' && !entrada.endereco) {
    throw new AppError('Informe o endereço de entrega.', 422);
  }

  const produtos = await carregarProdutos(empresa.id, entrada.itens);
  const adicionais = await carregarAdicionais(empresa.id, entrada.itens);

  const itens = entrada.itens.map((item) => {
    const produto = produtos.get(item.produtoId)!;

    const escolhidos = (item.adicionais ?? []).map((escolha) => {
      const adicional = adicionais.get(escolha.adicionalId)!;
      return {
        adicionalId: adicional.id,
        nome: adicional.nome,
        preco: adicional.preco,
        quantidade: escolha.quantidade,
      };
    });

    const precoAdicionais = escolhidos.reduce(
      (total, adicional) => total + adicional.preco * adicional.quantidade,
      0,
    );
    const subtotal = (produto.preco + precoAdicionais) * item.quantidade;

    return {
      produtoId: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      quantidade: item.quantidade,
      observacao: item.observacao ?? null,
      subtotal,
      adicionais: escolhidos,
    };
  });

  const subtotal = itens.reduce((total, item) => total + item.subtotal, 0);
  const taxaEntrega = entrada.tipo === 'ENTREGA' ? empresa.taxaEntrega : 0;
  const valorTotal = subtotal + taxaEntrega;

  if (entrada.formaPagamento === 'DINHEIRO' && entrada.trocoPara !== undefined) {
    if (entrada.trocoPara < valorTotal) {
      throw new AppError(
        'O valor para troco precisa ser maior ou igual ao total do pedido.',
        422,
      );
    }
  }

  const endereco = entrada.endereco
    ? `${entrada.endereco.rua}, ${entrada.endereco.numero} - ${entrada.endereco.bairro} - ${entrada.endereco.cidade}`
    : null;

  // Uma transação para o pedido, seus itens e os adicionais de cada item.
  return prisma.$transaction(async (tx) => {
    const pedido = await tx.pedido.create({
      data: {
        empresaId: empresa.id,
        cliente: entrada.cliente,
        telefone: entrada.telefone,
        tipo: entrada.tipo,
        endereco,
        formaPagamento: entrada.formaPagamento,
        trocoPara: entrada.formaPagamento === 'DINHEIRO' ? (entrada.trocoPara ?? null) : null,
        observacao: entrada.observacao ?? null,
        subtotal,
        taxaEntrega,
        valorTotal,
      },
      select: { id: true },
    });

    for (const item of itens) {
      const registro = await tx.itemPedido.create({
        data: {
          pedidoId: pedido.id,
          produtoId: item.produtoId,
          nome: item.nome,
          preco: item.preco,
          quantidade: item.quantidade,
          subtotal: item.subtotal,
          observacao: item.observacao,
        },
        select: { id: true },
      });

      if (item.adicionais.length > 0) {
        await tx.itemPedidoAdicional.createMany({
          data: item.adicionais.map((adicional) => ({
            itemPedidoId: registro.id,
            adicionalId: adicional.adicionalId,
            nome: adicional.nome,
            preco: adicional.preco,
            quantidade: adicional.quantidade,
          })),
        });
      }
    }

    return buscarPedido(tx, pedido.id);
  });
}

/* ------------------------------------------------------------ validações */

/** Carrega os produtos do pedido garantindo que existem, são da empresa e estão disponíveis. */
async function carregarProdutos(empresaId: string, itens: ItemEntrada[]) {
  const ids = [...new Set(itens.map((item) => item.produtoId))];

  const encontrados = await prisma.produto.findMany({
    where: { id: { in: ids }, empresaId },
    select: { id: true, nome: true, preco: true, disponivel: true },
  });

  if (encontrados.length !== ids.length) {
    const achados = new Set(encontrados.map((produto) => produto.id));
    const faltando = ids.filter((id) => !achados.has(id));
    throw new AppError(`Produto não encontrado no cardápio: ${faltando.join(', ')}`, 404);
  }

  const indisponivel = encontrados.find((produto) => !produto.disponivel);
  if (indisponivel) {
    throw AppError.conflito(`O produto "${indisponivel.nome}" está indisponível no momento.`);
  }

  return new Map(encontrados.map((produto) => [produto.id, produto]));
}

/**
 * Carrega os adicionais escolhidos garantindo que pertencem à empresa e que
 * estão realmente vinculados ao produto em que foram pedidos.
 */
async function carregarAdicionais(empresaId: string, itens: ItemEntrada[]) {
  const escolhas = itens.flatMap((item) =>
    (item.adicionais ?? []).map((adicional) => ({
      produtoId: item.produtoId,
      adicionalId: adicional.adicionalId,
    })),
  );

  if (escolhas.length === 0) return new Map<string, { id: string; nome: string; preco: number }>();

  const ids = [...new Set(escolhas.map((escolha) => escolha.adicionalId))];

  const encontrados = await prisma.adicional.findMany({
    where: {
      id: { in: ids },
      disponivel: true,
      grupo: { empresaId, ativo: true },
    },
    select: {
      id: true,
      nome: true,
      preco: true,
      grupo: { select: { id: true, produtos: { select: { produtoId: true } } } },
    },
  });

  if (encontrados.length !== ids.length) {
    throw new AppError('Um ou mais adicionais não estão disponíveis.', 404);
  }

  const porId = new Map(encontrados.map((adicional) => [adicional.id, adicional]));

  for (const escolha of escolhas) {
    const adicional = porId.get(escolha.adicionalId)!;
    const pertence = adicional.grupo.produtos.some(
      (vinculo) => vinculo.produtoId === escolha.produtoId,
    );

    if (!pertence) {
      throw new AppError(
        `O adicional "${adicional.nome}" não está disponível para este produto.`,
        422,
      );
    }
  }

  return new Map(
    encontrados.map((adicional) => [
      adicional.id,
      { id: adicional.id, nome: adicional.nome, preco: adicional.preco },
    ]),
  );
}

/** Formato de resposta do pedido, usado também para montar a comanda no frontend. */
function buscarPedido(tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0], id: string) {
  return tx.pedido.findUniqueOrThrow({
    where: { id },
    select: {
      id: true,
      numero: true,
      cliente: true,
      telefone: true,
      tipo: true,
      endereco: true,
      formaPagamento: true,
      trocoPara: true,
      status: true,
      observacao: true,
      subtotal: true,
      taxaEntrega: true,
      valorTotal: true,
      createdAt: true,
      itens: {
        select: {
          id: true,
          nome: true,
          preco: true,
          quantidade: true,
          subtotal: true,
          observacao: true,
          adicionais: {
            select: { id: true, nome: true, preco: true, quantidade: true },
          },
        },
      },
    },
  });
}
