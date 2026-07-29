import { Router } from 'express';
import * as produtoController from '../controllers/produto.controller.js';
import { autenticar, autorizar } from '../middlewares/auth.middleware.js';
import { validar } from '../middlewares/validate.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import { idParamSchema } from '../validators/comum.schema.js';
import {
  atualizarProdutoSchema,
  criarProdutoSchema,
  listarProdutosQuerySchema,
} from '../validators/recursos.schema.js';
import { asyncHandler } from '../utils/async-handler.js';

export const produtoRoutes = Router();

produtoRoutes.use(autenticar);

produtoRoutes.get(
  '/',
  validar({ query: listarProdutosQuerySchema }),
  asyncHandler(produtoController.listar),
);

produtoRoutes.get(
  '/:id',
  validar({ params: idParamSchema }),
  asyncHandler(produtoController.buscarPorId),
);

produtoRoutes.post(
  '/',
  autorizar('ADMIN', 'GERENTE'),
  validar({ body: criarProdutoSchema }),
  asyncHandler(produtoController.criar),
);

produtoRoutes.put(
  '/:id',
  autorizar('ADMIN', 'GERENTE'),
  validar({ params: idParamSchema, body: atualizarProdutoSchema }),
  asyncHandler(produtoController.atualizar),
);

// Upload da foto do produto: o arquivo vai para o disco e só o caminho vai ao banco.
produtoRoutes.post(
  '/:id/imagem',
  autorizar('ADMIN', 'GERENTE'),
  validar({ params: idParamSchema }),
  upload.single('imagem'),
  asyncHandler(produtoController.enviarImagem),
);

produtoRoutes.delete(
  '/:id',
  autorizar('ADMIN', 'GERENTE'),
  validar({ params: idParamSchema }),
  asyncHandler(produtoController.remover),
);
