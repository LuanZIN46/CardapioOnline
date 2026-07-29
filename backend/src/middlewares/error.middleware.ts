import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { Prisma } from '../generated/prisma/client.js';

/** Rota inexistente — cai aqui antes do handler de erros. */
export function rotaNaoEncontrada(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(`Rota não encontrada: ${req.method} ${req.originalUrl}`, 404));
}

/**
 * Tratamento global de erros. É o único lugar que monta resposta de erro,
 * garantindo formato consistente e sem vazar detalhes internos em produção.
 */
export function tratarErros(
  erro: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (erro instanceof AppError) {
    res.status(erro.statusCode).json({
      erro: erro.message,
      ...(erro.detalhes ? { detalhes: erro.detalhes } : {}),
    });
    return;
  }

  if (erro instanceof multer.MulterError) {
    const mensagem =
      erro.code === 'LIMIT_FILE_SIZE'
        ? `Arquivo maior que o limite de ${env.MAX_UPLOAD_MB}MB.`
        : `Falha no upload: ${erro.message}`;
    res.status(400).json({ erro: mensagem });
    return;
  }

  if (erro instanceof Prisma.PrismaClientKnownRequestError) {
    const tratado = traduzirErroPrisma(erro);
    if (tratado) {
      res.status(tratado.status).json({ erro: tratado.mensagem });
      return;
    }
  }

  // Falha inesperada: registra o motivo real e devolve mensagem genérica.
  console.error('[erro não tratado]', erro);
  res.status(500).json({
    erro: 'Erro interno do servidor.',
    ...(env.isProduction ? {} : { debug: erro instanceof Error ? erro.message : String(erro) }),
  });
}

function traduzirErroPrisma(
  erro: Prisma.PrismaClientKnownRequestError,
): { status: number; mensagem: string } | null {
  switch (erro.code) {
    case 'P2002': {
      const alvo = (erro.meta?.target as string[] | undefined)?.join(', ');
      return { status: 409, mensagem: `Já existe um registro com esse valor${alvo ? ` (${alvo})` : ''}.` };
    }
    case 'P2003':
      return { status: 409, mensagem: 'Registro vinculado a outro cadastro.' };
    case 'P2025':
      return { status: 404, mensagem: 'Registro não encontrado.' };
    default:
      return null;
  }
}
