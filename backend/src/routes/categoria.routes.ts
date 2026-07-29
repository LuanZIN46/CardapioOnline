import { Router } from 'express';
import * as categoriaController from '../controllers/categoria.controller.js';
import { autenticar, autorizar } from '../middlewares/auth.middleware.js';
import { validar } from '../middlewares/validate.middleware.js';
import { idParamSchema } from '../validators/comum.schema.js';
import {
  atualizarCategoriaSchema,
  criarCategoriaSchema,
  listarCategoriasQuerySchema,
} from '../validators/recursos.schema.js';
import { asyncHandler } from '../utils/async-handler.js';

export const categoriaRoutes = Router();

categoriaRoutes.use(autenticar);

categoriaRoutes.get(
  '/',
  validar({ query: listarCategoriasQuerySchema }),
  asyncHandler(categoriaController.listar),
);

categoriaRoutes.get(
  '/:id',
  validar({ params: idParamSchema }),
  asyncHandler(categoriaController.buscarPorId),
);

categoriaRoutes.post(
  '/',
  autorizar('ADMIN', 'GERENTE'),
  validar({ body: criarCategoriaSchema }),
  asyncHandler(categoriaController.criar),
);

categoriaRoutes.put(
  '/:id',
  autorizar('ADMIN', 'GERENTE'),
  validar({ params: idParamSchema, body: atualizarCategoriaSchema }),
  asyncHandler(categoriaController.atualizar),
);

categoriaRoutes.delete(
  '/:id',
  autorizar('ADMIN', 'GERENTE'),
  validar({ params: idParamSchema }),
  asyncHandler(categoriaController.remover),
);
