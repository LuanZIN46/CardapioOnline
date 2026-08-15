import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

interface DadosCategoria {
  nome: string;
  icone?: string | null;
  ordem?: number;
  ativo?: boolean;
}

const camposPublicos = {
  id: true,
  nome: true,
  icone: true,
  ordem: true,
  ativo: true,
  createdAt: true,
} as const;

export async function listar(empresaId: string, incluirInativas = false) {
  return prisma.categoria.findMany({
    where: { empresaId, ...(incluirInativas ? {} : { ativo: true }) },
    select: { ...camposPublicos, _count: { select: { produtos: true } } },
    orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
  });
}

export async function buscarPorId(empresaId: string, id: string) {
  const categoria = await prisma.categoria.findFirst({
    where: { id, empresaId },
    select: camposPublicos,
  });

  if (!categoria) throw AppError.naoEncontrado('Categoria');

  return categoria;
}

export async function criar(empresaId: string, dados: DadosCategoria) {
  return prisma.categoria.create({
    data: { ...dados, empresaId },
    select: camposPublicos,
  });
}

export async function atualizar(empresaId: string, id: string, dados: Partial<DadosCategoria>) {
  // Confere a posse antes de atualizar: `update` sozinho buscaria só pelo id.
  await buscarPorId(empresaId, id);

  return prisma.categoria.update({
    where: { id },
    data: dados,
    select: camposPublicos,
  });
}

export async function remover(empresaId: string, id: string) {
  await buscarPorId(empresaId, id);

  const produtosVinculados = await prisma.produto.count({ where: { categoriaId: id, empresaId } });

  if (produtosVinculados > 0) {
    throw AppError.conflito(
      `Esta categoria possui ${produtosVinculados} produto(s). Mova-os antes de excluir.`,
    );
  }

  await prisma.categoria.delete({ where: { id } });
}
