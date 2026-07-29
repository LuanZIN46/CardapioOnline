import type { Request, Response } from 'express';
import * as authService from '../services/auth.service.js';
import { contextoDaRequisicao } from '../middlewares/auth.middleware.js';

export async function registrar(req: Request, res: Response): Promise<void> {
  const resultado = await authService.registrar(req.body);
  res.status(201).json(resultado);
}

export async function login(req: Request, res: Response): Promise<void> {
  const resultado = await authService.login(req.body);
  res.json(resultado);
}

export async function perfil(req: Request, res: Response): Promise<void> {
  const { sub, empresaId } = contextoDaRequisicao(req);
  res.json(await authService.perfil(sub, empresaId));
}
