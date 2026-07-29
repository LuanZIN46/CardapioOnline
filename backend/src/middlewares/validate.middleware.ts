import type { NextFunction, Request, Response } from 'express';
import { z, type ZodType } from 'zod';
import { AppError } from '../utils/AppError.js';

interface Schemas {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
}

/**
 * Valida e sanitiza a requisição antes de chegar ao controller.
 * O resultado do parse substitui o valor original, então os controllers
 * recebem apenas campos conhecidos — chaves extras são descartadas pelo Zod.
 */
export function validar(schemas: Schemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    for (const parte of ['body', 'params', 'query'] as const) {
      const schema = schemas[parte];
      if (!schema) continue;

      const resultado = schema.safeParse(req[parte]);

      if (!resultado.success) {
        throw new AppError('Dados inválidos.', 422, formatarIssues(resultado.error));
      }

      // `req.query` é somente leitura no Express 5, por isso a atribuição via defineProperty.
      Object.defineProperty(req, parte, {
        value: resultado.data,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }

    next();
  };
}

function formatarIssues(error: z.ZodError): Array<{ campo: string; mensagem: string }> {
  return error.issues.map((issue) => ({
    campo: issue.path.join('.') || '(raiz)',
    mensagem: issue.message,
  }));
}
