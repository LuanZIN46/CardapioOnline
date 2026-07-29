import type { TokenPayload } from '../utils/jwt.js';

declare global {
  namespace Express {
    interface Request {
      /** Preenchido pelo middleware de autenticação. */
      usuario?: TokenPayload;
    }
  }
}

export {};
