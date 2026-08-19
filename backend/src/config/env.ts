import 'dotenv/config';
import { z } from 'zod';

/**
 * Valida as variáveis de ambiente na inicialização.
 * Falhar aqui é melhor do que descobrir um segredo ausente em produção.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3333),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET precisa ter ao menos 32 caracteres'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_UPLOAD_MB: z.coerce.number().positive().default(5),

  // Cloudinary guarda as fotos dos produtos. São opcionais de propósito: sem
  // elas a API sobe normalmente e apenas o envio de fotos fica indisponível,
  // com mensagem clara — em vez de derrubar o serviço inteiro.
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const detalhes = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(`Variáveis de ambiente inválidas:\n${detalhes}`);
}

const raw = parsed.data;

export const env = {
  ...raw,
  isProduction: raw.NODE_ENV === 'production',
  corsOrigins: raw.CORS_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  maxUploadBytes: raw.MAX_UPLOAD_MB * 1024 * 1024,
  cloudinaryConfigurado: Boolean(
    raw.CLOUDINARY_CLOUD_NAME && raw.CLOUDINARY_API_KEY && raw.CLOUDINARY_API_SECRET,
  ),
} as const;
