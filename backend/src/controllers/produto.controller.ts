import type { Request, Response } from 'express';
import * as produtoService from '../services/produto.service.js';
import { contextoDaRequisicao } from '../middlewares/auth.middleware.js';
import { idDaRota } from '../utils/params.js';
import * as imagemService from '../services/imagem.service.js';
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

/** Envia a foto ao Cloudinary e guarda apenas a URL no banco. */
export async function enviarImagem(req: Request, res: Response): Promise<void> {
  const { empresaId } = contextoDaRequisicao(req);
  const id = idDaRota(req);

  if (!req.file) throw new AppError('Envie um arquivo no campo "imagem".', 400);

  // Confere a posse antes de gastar banda: produto de outra empresa nem sobe.
  const anterior = await produtoService.buscarPorId(empresaId, id);

  const { url } = await imagemService.enviarImagem(req.file.buffer, empresaId);
  const produto = await produtoService.atualizar(empresaId, id, { imagem: url });

  // A troca já foi persistida; a foto antiga vira lixo e pode sair.
  void imagemService.removerImagem(anterior.imagem);

  res.status(201).json({ imagem: url, produto });
}
