import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { fimDaPausa, pausaEmVigor } from '../lib/funcionamento.js';
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

/* -------------------------------------------------------- funcionamento */

export interface Funcionamento {
  /** True enquanto a pausa manual estiver valendo. */
  fechado: boolean;
  /** Quando o atendimento volta ao horário normal, em ISO. */
  reabreEm: string | null;
}

function montarFuncionamento(fechadoAte: Date | null, agora = new Date()): Funcionamento {
  const fechado = pausaEmVigor(fechadoAte, agora);
  return { fechado, reabreEm: fechado ? fechadoAte!.toISOString() : null };
}

export async function funcionamento(empresaId: string): Promise<Funcionamento> {
  const empresa = await prisma.empresa.findUnique({
    where: { id: empresaId },
    select: { fechadoAte: true },
  });

  if (!empresa) throw AppError.naoEncontrado('Empresa');

  return montarFuncionamento(empresa.fechadoAte);
}

/**
 * Liga e desliga a pausa manual.
 *
 * Fechar grava o fim da pausa, nunca um `true`: assim o prazo é o próprio dado
 * e a loja reabre na virada sem depender de ninguém lembrar de desmarcar.
 * Reabrir antes da hora é só limpar a coluna.
 */
export async function definirFuncionamento(
  empresaId: string,
  fechado: boolean,
): Promise<Funcionamento> {
  const agora = new Date();
  const fechadoAte = fechado ? fimDaPausa(agora) : null;

  const empresa = await prisma.empresa.update({
    where: { id: empresaId },
    data: { fechadoAte },
    select: { fechadoAte: true },
  });

  return montarFuncionamento(empresa.fechadoAte, agora);
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
