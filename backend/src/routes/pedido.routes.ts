import { Router } from 'express';
import * as pedidoController from '../controllers/pedido.controller.js';
import { autenticar, autorizar } from '../middlewares/auth.middleware.js';
import { validar } from '../middlewares/validate.middleware.js';
import { idParamSchema } from '../validators/comum.schema.js';
import {
  atualizarPedidoSchema,
  atualizarStatusPedidoSchema,
  criarPedidoSchema,
  listarPedidosQuerySchema,
} from '../validators/recursos.schema.js';
import { asyncHandler } from '../utils/async-handler.js';

export const pedidoRoutes = Router();

pedidoRoutes.use(autenticar);

pedidoRoutes.get(
  '/',
  validar({ query: listarPedidosQuerySchema }),
  asyncHandler(pedidoController.listar),
);

pedidoRoutes.get('/resumo-do-dia', asyncHandler(pedidoController.resumoDoDia));

pedidoRoutes.get(
  '/:id',
  validar({ params: idParamSchema }),
  asyncHandler(pedidoController.buscarPorId),
);

pedidoRoutes.post(
  '/',
  validar({ body: criarPedidoSchema }),
  asyncHandler(pedidoController.criar),
);

pedidoRoutes.put(
  '/:id',
  validar({ params: idParamSchema, body: atualizarPedidoSchema }),
  asyncHandler(pedidoController.atualizar),
);

pedidoRoutes.patch(
  '/:id/status',
  validar({ params: idParamSchema, body: atualizarStatusPedidoSchema }),
  asyncHandler(pedidoController.atualizarStatus),
);

// Apagar pedido remove histórico financeiro, então fica restrito ao dono da conta.
pedidoRoutes.delete(
  '/:id',
  autorizar('ADMIN'),
  validar({ params: idParamSchema }),
  asyncHandler(pedidoController.remover),
);
