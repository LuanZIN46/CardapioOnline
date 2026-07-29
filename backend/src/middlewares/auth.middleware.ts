import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError.js';
import { verificarToken } from '../utils/jwt.js';
import type { TokenPayload } from '../utils/jwt.js';
import type { Cargo } from '../generated/prisma/enums.js';

/** Exige um token válido e anexa o usuário autenticado à requisição. */
export function autenticar(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    throw AppError.naoAutorizado('Token não informado.');
  }

  req.usuario = verificarToken(header.slice(7).trim());
  next();
}

/** Restringe a rota aos cargos informados. Use sempre depois de `autenticar`. */
export function autorizar(...cargos: Cargo[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.usuario) throw AppError.naoAutorizado();

    if (!cargos.includes(req.usuario.cargo)) {
      throw AppError.proibido('Seu cargo não permite esta ação.');
    }

    next();
  };
}

/**
 * Lê o contexto autenticado de forma segura.
 * Centraliza o acesso ao `empresaId` — nenhum service deve buscá-lo de outro lugar.
 */
export function contextoDaRequisicao(req: Request): TokenPayload {
  if (!req.usuario) throw AppError.naoAutorizado();
  return req.usuario;
}
