import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

interface DadosProduto {
  nome: string;
  descricao?: string | null;
  preco: number;
  imagem?: string | null;
  disponivel?: boolean;
  ordem?: number;
  categoriaId?: string | null;
}

interface FiltrosProduto {
  categoriaId?: string;
  disponivel?: boolean;
  busca?: string;
  pagina: number;
  porPagina: number;
}

const camposPublicos = {
  id: true,
  nome: true,
  descricao: true,
  preco: true,
  imagem: true,
  disponivel: true,
  ordem: true,
  createdAt: true,
  categoria: { select: { id: true, nome: true } },
} as const;

export async function listar(empresaId: string, filtros: FiltrosProduto) {
  const where = {
    empresaId,
    ...(filtros.categoriaId ? { categoriaId: filtros.categoriaId } : {}),
    ...(filtros.disponivel === undefined ? {} : { disponivel: filtros.disponivel }),
    ...(filtros.busca
      ? { nome: { contains: filtros.busca, mode: 'insensitive' as const } }
      : {}),
  };

  const [itens, total] = await Promise.all([
    prisma.produto.findMany({
      where,
      select: camposPublicos,
      orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
      skip: (filtros.pagina - 1) * filtros.porPagina,
      take: filtros.porPagina,
    }),
    prisma.produto.count({ where }),
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
  const produto = await prisma.produto.findFirst({
    where: { id, empresaId },
    select: camposPublicos,
  });

  if (!produto) throw AppError.naoEncontrado('Produto');

  return produto;
}

export async function criar(empresaId: string, dados: DadosProduto) {
  if (dados.categoriaId) await garantirCategoriaDaEmpresa(empresaId, dados.categoriaId);

  return prisma.produto.create({
    data: { ...dados, empresaId },
    select: camposPublicos,
  });
}

export async function atualizar(empresaId: string, id: string, dados: Partial<DadosProduto>) {
  await buscarPorId(empresaId, id);

  if (dados.categoriaId) await garantirCategoriaDaEmpresa(empresaId, dados.categoriaId);

  return prisma.produto.update({
    where: { id },
    data: dados,
    select: camposPublicos,
  });
}

export async function remover(empresaId: string, id: string) {
  await buscarPorId(empresaId, id);

  const emPedidos = await prisma.itemPedido.count({ where: { produtoId: id } });

  if (emPedidos > 0) {
    // Excluir quebraria o histórico de pedidos, então o produto sai apenas do cardápio.
    await prisma.produto.update({ where: { id }, data: { disponivel: false } });
    return { removido: false, mensagem: 'Produto possui histórico de pedidos e foi marcado como indisponível.' };
  }

  await prisma.produto.delete({ where: { id } });
  return { removido: true, mensagem: 'Produto excluído.' };
}

/** Impede vincular um produto a uma categoria de outra empresa. */
async function garantirCategoriaDaEmpresa(empresaId: string, categoriaId: string) {
  const categoria = await prisma.categoria.findFirst({
    where: { id: categoriaId, empresaId },
    select: { id: true },
  });

  if (!categoria) throw AppError.naoEncontrado('Categoria');
}
