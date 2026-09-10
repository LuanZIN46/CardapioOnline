import { Router } from 'express';
import * as empresaController from '../controllers/empresa.controller.js';
import { autenticar, autorizar } from '../middlewares/auth.middleware.js';
import { validar } from '../middlewares/validate.middleware.js';
import { atualizarEmpresaSchema, funcionamentoSchema } from '../validators/recursos.schema.js';
import { asyncHandler } from '../utils/async-handler.js';

export const empresaRoutes = Router();

// A criação da empresa acontece em POST /auth/register, junto do primeiro admin.
empresaRoutes.use(autenticar);

empresaRoutes.get('/', asyncHandler(empresaController.buscar));

// Abrir e fechar é rotina de operação, não de cadastro: o gerente também pode.
empresaRoutes.get('/funcionamento', asyncHandler(empresaController.funcionamento));

empresaRoutes.put(
  '/funcionamento',
  autorizar('ADMIN', 'GERENTE'),
  validar({ body: funcionamentoSchema }),
  asyncHandler(empresaController.definirFuncionamento),
);

empresaRoutes.put(
  '/',
  autorizar('ADMIN'),
  validar({ body: atualizarEmpresaSchema }),
  asyncHandler(empresaController.atualizar),
);

empresaRoutes.delete('/', autorizar('ADMIN'), asyncHandler(empresaController.desativar));
