import type { Request, Response } from 'express';
import * as produtoService from '../services/produto.service.js';
import { contextoDaRequisicao } from '../middlewares/auth.middleware.js';
import { idDaRota } from '../utils/params.js';
import { caminhoPublico } from '../middlewares/upload.middleware.js';
import { AppError } from '../utils/AppError.js';

export async function listar(req: Request, res: Response): Promise<void> {
  const { empresaId } = contextoDaRequisicao(req);
  const filtros = req.query as unknown as Parameters<typeof produtoService.listar>[1];
  res.json(await produtoService.listar(empresaId, filtros));
}

export async function buscarPorId(req: Request, res: Response): Promise<void> {
  const { empresaId } = contextoDaRequisicao(req);
  res.json(await produtoService.buscarPorId(empresaId, idDaRota(req)));
}

export async function criar(req: Request, res: Response): Promise<void> {
  const { empresaId } = contextoDaRequisicao(req);
  res.status(201).json(await produtoService.criar(empresaId, req.body));
}

export async function atualizar(req: Request, res: Response): Promise<void> {
  const { empresaId } = contextoDaRequisicao(req);
  res.json(await produtoService.atualizar(empresaId, idDaRota(req), req.body));
}

export async function remover(req: Request, res: Response): Promise<void> {
  const { empresaId } = contextoDaRequisicao(req);
  res.json(await produtoService.remover(empresaId, idDaRota(req)));
}

/** Recebe a imagem e grava apenas o caminho público no banco. */
export async function enviarImagem(req: Request, res: Response): Promise<void> {
  const { empresaId } = contextoDaRequisicao(req);

  if (!req.file) throw new AppError('Envie um arquivo no campo "imagem".', 400);

  const imagem = caminhoPublico(req.file.filename);
  const produto = await produtoService.atualizar(empresaId, idDaRota(req), { imagem });

  res.status(201).json({ imagem, produto });
}
