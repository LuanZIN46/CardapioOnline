import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import type { Plano } from '../generated/prisma/enums.js';

interface AtualizarEmpresa {
  nome?: string;
  telefone?: string;
  email?: string;
  plano?: Plano;
  ativo?: boolean;
}

const camposPublicos = {
  id: true,
  nome: true,
  telefone: true,
  email: true,
  plano: true,
  ativo: true,
  createdAt: true,
} as const;

/**
 * Um usuário só enxerga a própria empresa — não existe listagem global.
 * O `empresaId` vem sempre do token, nunca da requisição.
 */
export async function buscar(empresaId: string) {
  const empresa = await prisma.empresa.findUnique({
    where: { id: empresaId },
    select: {
      ...camposPublicos,
      _count: { select: { usuarios: true, produtos: true, categorias: true, pedidos: true, mesas: true } },
    },
  });

  if (!empresa) throw AppError.naoEncontrado('Empresa');

  return empresa;
}

export async function atualizar(empresaId: string, dados: AtualizarEmpresa) {
  if (dados.email) {
    const conflito = await prisma.empresa.findFirst({
      where: { email: dados.email, NOT: { id: empresaId } },
      select: { id: true },
    });

    if (conflito) throw AppError.conflito('Este e-mail já pertence a outra empresa.');
  }

  return prisma.empresa.update({
    where: { id: empresaId },
    data: dados,
    select: camposPublicos,
  });
}

/**
 * Desativa a empresa em vez de apagar: pedidos e histórico fiscal precisam sobreviver.
 * A exclusão definitiva fica a cargo de uma rotina administrativa separada.
 */
export async function desativar(empresaId: string) {
  return prisma.empresa.update({
    where: { id: empresaId },
    data: { ativo: false },
    select: camposPublicos,
  });
}
