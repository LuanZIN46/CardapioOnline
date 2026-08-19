import multer from 'multer';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * O arquivo fica em memória e segue direto para o Cloudinary — nada é gravado
 * no disco do servidor, que no Render é apagado a cada deploy.
 *
 * O limite de tamanho protege a memória do processo: com `files: 1` e o teto de
 * MAX_UPLOAD_MB, o pico por requisição é conhecido.
 */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxUploadBytes, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!TIPOS_PERMITIDOS.includes(file.mimetype)) {
      cb(new AppError('Formato inválido. Envie JPEG, PNG ou WebP.', 415));
      return;
    }
    cb(null, true);
  },
});
