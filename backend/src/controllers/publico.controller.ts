import type { Request, Response } from 'express';
import * as publicoService from '../services/publico.service.js';
import { paramString } from '../utils/params.js';

export async function cardapio(req: Request, res: Response): Promise<void> {
  const slug = paramString(req, 'empresa');
  res.json(await publicoService.cardapio(slug));
}

export async function criarPedido(req: Request, res: Response): Promise<void> {
  const slug = paramString(req, 'empresa');
  const pedido = await publicoService.criarPedido(slug, req.body);
  res.status(201).json(pedido);
}
