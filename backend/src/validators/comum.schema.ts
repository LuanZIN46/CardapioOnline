import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.uuid('Identificador inválido.'),
});

export const paginacaoSchema = z.object({
  pagina: z.coerce.number().int().positive().default(1),
  porPagina: z.coerce.number().int().positive().max(100).default(20),
});

/** Texto obrigatório já sem espaços nas pontas. */
export const textoObrigatorio = (campo: string, max = 120) =>
  z.string().trim().min(1, `${campo} é obrigatório.`).max(max, `${campo} é muito longo.`);

export const textoOpcional = (max = 500) =>
  z.string().trim().max(max).optional().nullable();

export const telefoneSchema = z
  .string()
  .trim()
  .min(10, 'Telefone inválido.')
  .max(20, 'Telefone inválido.');

/** Dinheiro sempre em centavos, inteiro e não negativo. */
export const precoSchema = z
  .number()
  .int('O preço deve estar em centavos (número inteiro).')
  .nonnegative('O preço não pode ser negativo.')
  .max(100_000_000, 'Preço acima do limite.');

export const booleanoOpcional = z.coerce.boolean().optional();
