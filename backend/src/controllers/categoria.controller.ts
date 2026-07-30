import type { Request, Response } from 'express';
import * as categoriaService from '../services/categoria.service.js';
import { contextoDaRequisicao } from '../middlewares/auth.middleware.js';
import { idDaRota } from '../utils/params.js';

export async function listar(req: Request, res: Response): Promise<void> {
  const { empresaId } = contextoDaRequisicao(req);
  const { incluirInativas } = req.query as unknown as { incluirInativas: boolean };
  res.json(await categoriaService.listar(empresaId, incluirInativas));
}

export async function buscarPorId(req: Request, res: Response): Promise<void> {
  const { empresaId } = contextoDaRequisicao(req);
  res.json(await categoriaService.buscarPorId(empresaId, idDaRota(req)));
}

export async function criar(req: Request, res: Response): Promise<void> {
  const { empresaId } = contextoDaRequisicao(req);
  res.status(201).json(await categoriaService.criar(empresaId, req.body));
}

export async function atualizar(req: Request, res: Response): Promise<void> {
  const { empresaId } = contextoDaRequisicao(req);
  res.json(await categoriaService.atualizar(empresaId, idDaRota(req), req.body));
}

export async function remover(req: Request, res: Response): Promise<void> {
  const { empresaId } = contextoDaRequisicao(req);
  await categoriaService.remover(empresaId, idDaRota(req));
  res.status(204).send();
}
