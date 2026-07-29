import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/auth.controller.js';
import { autenticar } from '../middlewares/auth.middleware.js';
import { validar } from '../middlewares/validate.middleware.js';
import { loginSchema, registrarSchema } from '../validators/auth.schema.js';
import { asyncHandler } from '../utils/async-handler.js';

// Limite estreito nas rotas de credencial para dificultar força bruta.
const limiteAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas. Tente novamente em alguns minutos.' },
});

export const authRoutes = Router();

authRoutes.post(
  '/register',
  limiteAuth,
  validar({ body: registrarSchema }),
  asyncHandler(authController.registrar),
);

authRoutes.post(
  '/login',
  limiteAuth,
  validar({ body: loginSchema }),
  asyncHandler(authController.login),
);

authRoutes.get('/me', autenticar, asyncHandler(authController.perfil));
