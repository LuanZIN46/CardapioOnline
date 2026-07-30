import type { Request } from 'express';
import { AppError } from './AppError.js';

/**
 * O Express 5 tipa parâmetros de rota como `string | string[]`.
 * O valor já passou pelo schema de validação, então aqui só normalizamos o tipo.
 */
export function paramString(req: Request, nome: string): string {
  const valor = req.params[nome];
  const texto = Array.isArray(valor) ? valor[0] : valor;

  if (!texto) throw new AppError(`Parâmetro "${nome}" ausente.`, 400);

  return texto;
}

export function idDaRota(req: Request): string {
  return paramString(req, 'id');
}
