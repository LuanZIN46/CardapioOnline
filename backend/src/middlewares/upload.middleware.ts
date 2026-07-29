import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];

export const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR);

if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    // Nome gerado pelo servidor: o nome original do cliente nunca toca o disco,
    // evitando path traversal e colisões.
    const extensao = path.extname(file.originalname).toLowerCase().slice(0, 10);
    cb(null, `${randomUUID()}${extensao}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: env.maxUploadBytes, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!TIPOS_PERMITIDOS.includes(file.mimetype)) {
      cb(new AppError('Formato inválido. Envie JPEG, PNG ou WebP.', 415));
      return;
    }
    cb(null, true);
  },
});

/** Caminho público salvo no banco — nunca o caminho absoluto do disco. */
export function caminhoPublico(nomeArquivo: string): string {
  return `/${env.UPLOAD_DIR}/${nomeArquivo}`;
}
