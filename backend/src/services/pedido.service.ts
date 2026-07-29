import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import type { StatusPedido } from '../generated/prisma/enums.js';

interface ItemEntrada {
  produtoId: string;
  quantidade: number;
  observacao?: string;
}

interface DadosPedido {
  cliente: string;
  telefone: string;
  endereco?: string | null;
  observacao?: string | null;
  mesaId?: string | null;
  itens: ItemEntrada[];
}

interface FiltrosPedido {
  status?: StatusPedido;
  de?: Date;
  ate?: Date;
  pagina: number;
  porPagina: number;
}

/** Transições permitidas: impede, por exemplo, reabrir um pedido cancelado. */
const TRANSICOES: Record<StatusPedido, StatusPedido[]> = {
  NOVO: ['EM_PREPARO', 'CANCELADO'],
  EM_PREPARO: ['SAIU_PARA_ENTREGA', 'FINALIZADO', 'CANCELADO'],
  SAIU_PARA_ENTREGA: ['FINALIZADO', 'CANCELADO'],
  FINALIZADO: [],
  CANCELADO: [],
};

const camposPublicos = {
  id: true,
  numero: true,
  cliente: true,
  telefone: true,
  endereco: true,
  status: true,
  observacao: true,
  valorTotal: true,
  createdAt: true,
  mesa: { select: { id: true, numero: true } },
  itens: {
    select: {
      id: true,
      quantidade: true,
      preco: true,
      observacao: true,
      produto: { select: { id: true, nome: true, imagem: true } },
    },
  },
} as const;

export async function listar(empresaId: string, filtros: FiltrosPedido) {
  const where = {
    empresaId,
    ...(filtros.status ? { status: filtros.status } : {}),
    ...(filtros.de || filtros.ate
      ? {
          createdAt: {
            ...(filtros.de ? { gte: filtros.de } : {}),
            ...(filtros.ate ? { lte: filtros.ate } : {}),
          },
        }
      : {}),
  };

  const [itens, total] = await Promise.all([
    prisma.pedido.findMany({
      where,
      select: camposPublicos,
      orderBy: { createdAt: 'desc' },
      skip: (filtros.pagina - 1) * filtros.porPagina,
      take: filtros.porPagina,
    }),
    prisma.pedido.count({ where }),
  ]);

  return {
    itens,
    paginacao: {
      pagina: filtros.pagina,
      porPagina: filtros.porPagina,
      total,
      totalPaginas: Math.ceil(total / filtros.porPagina),
    },
  };
}

export async function buscarPorId(empresaId: string, id: string) {
  const pedido = await prisma.pedido.findFirst({
    where: { id, empresaId },
    select: camposPublicos,
  });

  if (!pedido) throw AppError.naoEncontrado('Pedido');

  return pedido;
}

/**
 * Cria o pedido numa transação. Os preços são lidos do banco, nunca do cliente:
 * confiar no valor enviado permitiria comprar por qualquer preço.
 */
export async function criar(empresaId: string, dados: DadosPedido) {
  if (dados.itens.length === 0) {
    throw new AppError('O pedido precisa de ao menos um item.', 422);
  }

  const produtoIds = [...new Set(dados.itens.map((item) => item.produtoId))];

  const produtos = await prisma.produto.findMany({
    where: { id: { in: produtoIds }, empresaId },
    select: { id: true, preco: true, disponivel: true, nome: true },
  });

  if (produtos.length !== produtoIds.length) {
    throw AppError.naoEncontrado('Um ou mais produtos');
  }

  const indisponivel = produtos.find((produto) => !produto.disponivel);
  if (indisponivel) {
    throw AppError.conflito(`O produto "${indisponivel.nome}" está indisponível.`);
  }

  if (dados.mesaId) await garantirMesaDaEmpresa(empresaId, dados.mesaId);

  const precoPorId = new Map(produtos.map((produto) => [produto.id, produto.preco]));

  const itens = dados.itens.map((item) => ({
    produtoId: item.produtoId,
    quantidade: item.quantidade,
    preco: precoPorId.get(item.produtoId)!,
    observacao: item.observacao ?? null,
  }));

  const valorTotal = itens.reduce((total, item) => total + item.preco * item.quantidade, 0);

  return prisma.pedido.create({
    data: {
      empresaId,
      cliente: dados.cliente,
      telefone: dados.telefone,
      endereco: dados.endereco ?? null,
      observacao: dados.observacao ?? null,
      mesaId: dados.mesaId ?? null,
      valorTotal,
      itens: { create: itens },
    },
    select: camposPublicos,
  });
}

export async function atualizarStatus(empresaId: string, id: string, novoStatus: StatusPedido) {
  const pedido = await prisma.pedido.findFirst({
    where: { id, empresaId },
    select: { id: true, status: true },
  });

  if (!pedido) throw AppError.naoEncontrado('Pedido');

  if (pedido.status === novoStatus) {
    return buscarPorId(empresaId, id);
  }

  if (!TRANSICOES[pedido.status].includes(novoStatus)) {
    throw AppError.conflito(
      `Não é possível mudar de ${pedido.status} para ${novoStatus}.`,
    );
  }

  await prisma.pedido.update({ where: { id }, data: { status: novoStatus } });

  return buscarPorId(empresaId, id);
}

export async function atualizar(
  empresaId: string,
  id: string,
  dados: Partial<Pick<DadosPedido, 'cliente' | 'telefone' | 'endereco' | 'observacao'>>,
) {
  const pedido = await prisma.pedido.findFirst({
    where: { id, empresaId },
    select: { status: true },
  });

  if (!pedido) throw AppError.naoEncontrado('Pedido');

  if (pedido.status === 'FINALIZADO' || pedido.status === 'CANCELADO') {
    throw AppError.conflito('Pedido encerrado não pode ser alterado.');
  }

  await prisma.pedido.update({ where: { id }, data: dados });

  return buscarPorId(empresaId, id);
}

export async function remover(empresaId: string, id: string) {
  await buscarPorId(empresaId, id);
  await prisma.pedido.delete({ where: { id } });
}

/** Números do dia para o painel administrativo. */
export async function resumoDoDia(empresaId: string, referencia = new Date()) {
  const inicio = new Date(referencia);
  inicio.setHours(0, 0, 0, 0);
  const fim = new Date(inicio);
  fim.setDate(fim.getDate() + 1);

  const periodo = { empresaId, createdAt: { gte: inicio, lt: fim } };

  const [porStatus, faturamento] = await Promise.all([
    prisma.pedido.groupBy({
      by: ['status'],
      where: periodo,
      _count: { _all: true },
    }),
    prisma.pedido.aggregate({
      where: { ...periodo, status: 'FINALIZADO' },
      _sum: { valorTotal: true },
      _count: { _all: true },
    }),
  ]);

  const finalizados = faturamento._count._all;
  const total = faturamento._sum.valorTotal ?? 0;

  return {
    data: inicio.toISOString().slice(0, 10),
    pedidosPorStatus: Object.fromEntries(
      porStatus.map((linha) => [linha.status, linha._count._all]),
    ),
    faturamento: total,
    pedidosFinalizados: finalizados,
    ticketMedio: finalizados > 0 ? Math.round(total / finalizados) : 0,
  };
}

async function garantirMesaDaEmpresa(empresaId: string, mesaId: string) {
  const mesa = await prisma.mesa.findFirst({
    where: { id: mesaId, empresaId },
    select: { id: true },
  });

  if (!mesa) throw AppError.naoEncontrado('Mesa');
}
