import { Router } from 'express';
import { authRoutes } from './auth.routes.js';
import { categoriaRoutes } from './categoria.routes.js';
import { empresaRoutes } from './empresa.routes.js';
import { mesaRoutes } from './mesa.routes.js';
import { pedidoRoutes } from './pedido.routes.js';
import { produtoRoutes } from './produto.routes.js';

export const routes = Router();

routes.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

routes.use('/auth', authRoutes);
routes.use('/empresa', empresaRoutes);
routes.use('/categorias', categoriaRoutes);
routes.use('/produtos', produtoRoutes);
routes.use('/pedidos', pedidoRoutes);
routes.use('/mesas', mesaRoutes);
