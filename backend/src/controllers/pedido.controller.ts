import type { Request, Response } from 'express';
import * as pedidoService from '../services/pedido.service.js';
import { contextoDaRequisicao } from '../middlewares/auth.middleware.js';

export async function listar(req: Request, res: Response): Promise<void> {
  const { empresaId } = contextoDaRequisicao(req);
  const filtros = req.query as unknown as Parameters<typeof pedidoService.listar>[1];
  res.json(await pedidoService.listar(empresaId, filtros));
}

export async function buscarPorId(req: Request, res: Response): Promise<void> {
  const { empresaId } = contextoDaRequisicao(req);
  res.json(await pedidoService.buscarPorId(empresaId, req.params.id!));
}

export async function criar(req: Request, res: Response): Promise<void> {
  const { empresaId } = contextoDaRequisicao(req);
  res.status(201).json(await pedidoService.criar(empresaId, req.body));
}

export async function atualizar(req: Request, res: Response): Promise<void> {
  const { empresaId } = contextoDaRequisicao(req);
  res.json(await pedidoService.atualizar(empresaId, req.params.id!, req.body));
}

export async function atualizarStatus(req: Request, res: Response): Promise<void> {
  const { empresaId } = contextoDaRequisicao(req);
  res.json(await pedidoService.atualizarStatus(empresaId, req.params.id!, req.body.status));
}

export async function remover(req: Request, res: Response): Promise<void> {
  const { empresaId } = contextoDaRequisicao(req);
  await pedidoService.remover(empresaId, req.params.id!);
  res.status(204).send();
}

export async function resumoDoDia(req: Request, res: Response): Promise<void> {
  const { empresaId } = contextoDaRequisicao(req);
  res.json(await pedidoService.resumoDoDia(empresaId));
}
