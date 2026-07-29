import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import type { StatusMesa } from '../generated/prisma/enums.js';

interface DadosMesa {
  numero: number;
  status?: StatusMesa;
  capacidade?: number | null;
}

const camposPublicos = {
  id: true,
  numero: true,
  status: true,
  capacidade: true,
  createdAt: true,
} as const;

export async function listar(empresaId: string, status?: StatusMesa) {
  return prisma.mesa.findMany({
    where: { empresaId, ...(status ? { status } : {}) },
    select: camposPublicos,
    orderBy: { numero: 'asc' },
  });
}

export async function buscarPorId(empresaId: string, id: string) {
  const mesa = await prisma.mesa.findFirst({
    where: { id, empresaId },
    select: {
      ...camposPublicos,
      pedidos: {
        where: { status: { in: ['NOVO', 'EM_PREPARO'] } },
        select: { id: true, numero: true, status: true, valorTotal: true },
      },
    },
  });

  if (!mesa) throw AppError.naoEncontrado('Mesa');

  return mesa;
}

export async function criar(empresaId: string, dados: DadosMesa) {
  const existente = await prisma.mesa.findFirst({
    where: { empresaId, numero: dados.numero },
    select: { id: true },
  });

  if (existente) throw AppError.conflito(`Já existe a mesa ${dados.numero}.`);

  return prisma.mesa.create({
    data: { ...dados, empresaId },
    select: camposPublicos,
  });
}

export async function atualizar(empresaId: string, id: string, dados: Partial<DadosMesa>) {
  await buscarPorId(empresaId, id);

  if (dados.numero !== undefined) {
    const conflito = await prisma.mesa.findFirst({
      where: { empresaId, numero: dados.numero, NOT: { id } },
      select: { id: true },
    });

    if (conflito) throw AppError.conflito(`Já existe a mesa ${dados.numero}.`);
  }

  return prisma.mesa.update({
    where: { id },
    data: dados,
    select: camposPublicos,
  });
}

export async function remover(empresaId: string, id: string) {
  await buscarPorId(empresaId, id);

  const pedidosAbertos = await prisma.pedido.count({
    where: { mesaId: id, status: { in: ['NOVO', 'EM_PREPARO', 'SAIU_PARA_ENTREGA'] } },
  });

  if (pedidosAbertos > 0) {
    throw AppError.conflito('Esta mesa possui pedidos em andamento.');
  }

  await prisma.mesa.delete({ where: { id } });
}
