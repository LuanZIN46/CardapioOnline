import type { Request, Response } from 'express';
import * as mesaService from '../services/mesa.service.js';
import { contextoDaRequisicao } from '../middlewares/auth.middleware.js';
import { idDaRota } from '../utils/params.js';
import type { StatusMesa } from '../generated/prisma/enums.js';

export async function listar(req: Request, res: Response): Promise<void> {
  const { empresaId } = contextoDaRequisicao(req);
  const { status } = req.query as { status?: StatusMesa };
  res.json(await mesaService.listar(empresaId, status));
}

export async function buscarPorId(req: Request, res: Response): Promise<void> {
  const { empresaId } = contextoDaRequisicao(req);
  res.json(await mesaService.buscarPorId(empresaId, idDaRota(req)));
}

export async function criar(req: Request, res: Response): Promise<void> {
  const { empresaId } = contextoDaRequisicao(req);
  res.status(201).json(await mesaService.criar(empresaId, req.body));
}

export async function atualizar(req: Request, res: Response): Promise<void> {
  const { empresaId } = contextoDaRequisicao(req);
  res.json(await mesaService.atualizar(empresaId, idDaRota(req), req.body));
}

export async function remover(req: Request, res: Response): Promise<void> {
  const { empresaId } = contextoDaRequisicao(req);
  await mesaService.remover(empresaId, idDaRota(req));
  res.status(204).send();
}
