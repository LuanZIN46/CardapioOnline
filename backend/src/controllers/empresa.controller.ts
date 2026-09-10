import type { Request, Response } from 'express';
import * as empresaService from '../services/empresa.service.js';
import { contextoDaRequisicao } from '../middlewares/auth.middleware.js';

export async function buscar(req: Request, res: Response): Promise<void> {
  const { empresaId } = contextoDaRequisicao(req);
  res.json(await empresaService.buscar(empresaId));
}

export async function atualizar(req: Request, res: Response): Promise<void> {
  const { empresaId } = contextoDaRequisicao(req);
  res.json(await empresaService.atualizar(empresaId, req.body));
}

export async function desativar(req: Request, res: Response): Promise<void> {
  const { empresaId } = contextoDaRequisicao(req);
  res.json(await empresaService.desativar(empresaId));
}

/* -------------------------------------------------------- funcionamento */

export async function funcionamento(req: Request, res: Response): Promise<void> {
  const { empresaId } = contextoDaRequisicao(req);
  res.json(await empresaService.funcionamento(empresaId));
}

export async function definirFuncionamento(req: Request, res: Response): Promise<void> {
  const { empresaId } = contextoDaRequisicao(req);
  res.json(await empresaService.definirFuncionamento(empresaId, req.body.fechado));
}
