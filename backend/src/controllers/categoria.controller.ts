import type { Request, Response } from 'express';
import * as categoriaService from '../services/categoria.service.js';
import { contextoDaRequisicao } from '../middlewares/auth.middleware.js';

export async function listar(req: Request, res: Response): Promise<void> {
  const { empresaId } = contextoDaRequisicao(req);
  const { incluirInativas } = req.query as unknown as { incluirInativas: boolean };
  res.json(await categoriaService.listar(empresaId, incluirInativas));
}

export async function buscarPorId(req: Request, res: Response): Promise<void> {
  const { empresaId } = contextoDaRequisicao(req);
  res.json(await categoriaService.buscarPorId(empresaId, req.params.id!));
}

export async function criar(req: Request, res: Response): Promise<void> {
  const { empresaId } = contextoDaRequisicao(req);
  res.status(201).json(await categoriaService.criar(empresaId, req.body));
}

export async function atualizar(req: Request, res: Response): Promise<void> {
  const { empresaId } = contextoDaRequisicao(req);
  res.json(await categoriaService.atualizar(empresaId, req.params.id!, req.body));
}

export async function remover(req: Request, res: Response): Promise<void> {
  const { empresaId } = contextoDaRequisicao(req);
  await categoriaService.remover(empresaId, req.params.id!);
  res.status(204).send();
}
