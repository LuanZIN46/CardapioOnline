import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as publicoController from '../controllers/publico.controller.js';
import { validar } from '../middlewares/validate.middleware.js';
import {
  criarPedidoPublicoSchema,
  empresaParamSchema,
} from '../validators/publico.schema.js';
import { asyncHandler } from '../utils/async-handler.js';

/**
 * Cardápio público do cliente — sem token.
 * A empresa vem do slug na URL e prende todas as consultas ao seu `empresaId`.
 */
export const publicoRoutes = Router({ mergeParams: true });

// O cardápio é leitura pura e cacheável; o envio de pedido é mais restrito.
const limiteLeitura = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { erro: 'Muitas requisições. Aguarde um instante.' },
});

const limitePedido = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { erro: 'Muitos pedidos seguidos. Aguarde alguns minutos.' },
});

publicoRoutes.get(
  '/:empresa/cardapio',
  limiteLeitura,
  validar({ params: empresaParamSchema }),
  asyncHandler(publicoController.cardapio),
);

publicoRoutes.post(
  '/:empresa/pedidos',
  limitePedido,
  validar({ params: empresaParamSchema, body: criarPedidoPublicoSchema }),
  asyncHandler(publicoController.criarPedido),
);
