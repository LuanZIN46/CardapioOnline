import { Router } from 'express';
import * as empresaController from '../controllers/empresa.controller.js';
import { autenticar, autorizar } from '../middlewares/auth.middleware.js';
import { validar } from '../middlewares/validate.middleware.js';
import { atualizarEmpresaSchema } from '../validators/recursos.schema.js';
import { asyncHandler } from '../utils/async-handler.js';

export const empresaRoutes = Router();

// A criação da empresa acontece em POST /auth/register, junto do primeiro admin.
empresaRoutes.use(autenticar);

empresaRoutes.get('/', asyncHandler(empresaController.buscar));

empresaRoutes.put(
  '/',
  autorizar('ADMIN'),
  validar({ body: atualizarEmpresaSchema }),
  asyncHandler(empresaController.atualizar),
);

empresaRoutes.delete('/', autorizar('ADMIN'), asyncHandler(empresaController.desativar));
