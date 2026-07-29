import { z } from 'zod';
import { telefoneSchema, textoObrigatorio } from './comum.schema.js';

const senhaSchema = z
  .string()
  .min(8, 'A senha precisa ter ao menos 8 caracteres.')
  .max(72, 'A senha é muito longa.') // limite do bcrypt
  .regex(/[a-zA-Z]/, 'A senha precisa conter letras.')
  .regex(/\d/, 'A senha precisa conter números.');

export const registrarSchema = z.object({
  empresa: z.object({
    nome: textoObrigatorio('Nome da empresa'),
    telefone: telefoneSchema,
    email: z.email('E-mail da empresa inválido.').toLowerCase(),
    plano: z.enum(['FREE', 'BASICO', 'PRO', 'ENTERPRISE']).optional(),
  }),
  usuario: z.object({
    nome: textoObrigatorio('Nome do usuário'),
    email: z.email('E-mail do usuário inválido.').toLowerCase(),
    senha: senhaSchema,
  }),
});

export const loginSchema = z.object({
  email: z.email('E-mail inválido.').toLowerCase(),
  senha: z.string().min(1, 'Informe a senha.'),
});
