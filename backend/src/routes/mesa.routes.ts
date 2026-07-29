import { Router } from 'express';
import * as mesaController from '../controllers/mesa.controller.js';
import { autenticar, autorizar } from '../middlewares/auth.middleware.js';
import { validar } from '../middlewares/validate.middleware.js';
import { idParamSchema } from '../validators/comum.schema.js';
import {
  atualizarMesaSchema,
  criarMesaSchema,
  listarMesasQuerySchema,
} from '../validators/recursos.schema.js';
import { asyncHandler } from '../utils/async-handler.js';

export const mesaRoutes = Router();

mesaRoutes.use(autenticar);

mesaRoutes.get('/', validar({ query: listarMesasQuerySchema }), asyncHandler(mesaController.listar));

mesaRoutes.get(
  '/:id',
  validar({ params: idParamSchema }),
  asyncHandler(mesaController.buscarPorId),
);

mesaRoutes.post(
  '/',
  autorizar('ADMIN', 'GERENTE'),
  validar({ body: criarMesaSchema }),
  asyncHandler(mesaController.criar),
);

// Atendente precisa mudar o status da mesa no dia a dia.
mesaRoutes.put(
  '/:id',
  validar({ params: idParamSchema, body: atualizarMesaSchema }),
  asyncHandler(mesaController.atualizar),
);

mesaRoutes.delete(
  '/:id',
  autorizar('ADMIN', 'GERENTE'),
  validar({ params: idParamSchema }),
  asyncHandler(mesaController.remover),
);
