import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from './AppError.js';
import type { Cargo } from '../generated/prisma/enums.js';

/** Conteúdo do token. `empresaId` é o que garante o isolamento entre clientes do SaaS. */
export interface TokenPayload {
  sub: string;
  empresaId: string;
  cargo: Cargo;
}

export function gerarToken(payload: TokenPayload): string {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verificarToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (typeof decoded === 'string' || !decoded.sub || !('empresaId' in decoded)) {
      throw AppError.naoAutorizado('Token inválido.');
    }

    return {
      sub: String(decoded.sub),
      empresaId: String(decoded.empresaId),
      cargo: decoded.cargo as Cargo,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error instanceof jwt.TokenExpiredError) {
      throw AppError.naoAutorizado('Sessão expirada. Faça login novamente.');
    }
    throw AppError.naoAutorizado('Token inválido.');
  }
}
