import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Encapsula controllers assíncronos para que rejeições cheguem ao handler
 * global de erros sem repetir try/catch em cada rota.
 */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}
