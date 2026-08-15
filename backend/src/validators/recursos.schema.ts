import { z } from 'zod';
import {
  paginacaoSchema,
  precoSchema,
  telefoneSchema,
  textoObrigatorio,
  textoOpcional,
} from './comum.schema.js';

/* -------------------------------------------------------------- Empresa */

export const atualizarEmpresaSchema = z
  .object({
    nome: textoObrigatorio('Nome').optional(),
    telefone: telefoneSchema.optional(),
    email: z.email('E-mail inválido.').toLowerCase().optional(),
    plano: z.enum(['FREE', 'BASICO', 'PRO', 'ENTERPRISE']).optional(),
    ativo: z.boolean().optional(),
  })
  .refine((dados) => Object.keys(dados).length > 0, 'Envie ao menos um campo.');

/* ------------------------------------------------------------ Categoria */

export const criarCategoriaSchema = z.object({
  nome: textoObrigatorio('Nome'),
  // Emoji exibido na navegação do cardápio público.
  icone: z.string().trim().max(8).optional().nullable(),
  ordem: z.number().int().min(0).optional(),
  ativo: z.boolean().optional(),
});

export const atualizarCategoriaSchema = criarCategoriaSchema
  .partial()
  .refine((dados) => Object.keys(dados).length > 0, 'Envie ao menos um campo.');

export const listarCategoriasQuerySchema = z.object({
  incluirInativas: z
    .enum(['true', 'false'])
    .default('false')
    .transform((valor) => valor === 'true'),
});

/* -------------------------------------------------------------- Produto */

export const criarProdutoSchema = z.object({
  nome: textoObrigatorio('Nome'),
  descricao: textoOpcional(500),
  preco: precoSchema,
  imagem: textoOpcional(300),
  disponivel: z.boolean().optional(),
  ordem: z.number().int().min(0).optional(),
  categoriaId: z.uuid('Categoria inválida.').optional().nullable(),
});

export const atualizarProdutoSchema = criarProdutoSchema
  .partial()
  .refine((dados) => Object.keys(dados).length > 0, 'Envie ao menos um campo.');

export const listarProdutosQuerySchema = paginacaoSchema.extend({
  categoriaId: z.uuid().optional(),
  disponivel: z
    .enum(['true', 'false'])
    .optional()
    .transform((valor) => (valor === undefined ? undefined : valor === 'true')),
  busca: z.string().trim().max(80).optional(),
});

/* --------------------------------------------------------------- Pedido */

const statusPedidoSchema = z.enum([
  'NOVO',
  'EM_PREPARO',
  'SAIU_PARA_ENTREGA',
  'FINALIZADO',
  'CANCELADO',
]);

export const criarPedidoSchema = z.object({
  cliente: textoObrigatorio('Nome do cliente'),
  telefone: telefoneSchema,
  endereco: textoOpcional(300),
  observacao: textoOpcional(500),
  mesaId: z.uuid('Mesa inválida.').optional().nullable(),
  itens: z
    .array(
      z.object({
        produtoId: z.uuid('Produto inválido.'),
        quantidade: z.number().int().positive().max(999),
        observacao: z.string().trim().max(200).optional(),
      }),
    )
    .min(1, 'Inclua ao menos um item.')
    .max(100, 'Pedido com itens demais.'),
});

export const atualizarPedidoSchema = z
  .object({
    cliente: textoObrigatorio('Nome do cliente').optional(),
    telefone: telefoneSchema.optional(),
    endereco: textoOpcional(300),
    observacao: textoOpcional(500),
  })
  .refine((dados) => Object.keys(dados).length > 0, 'Envie ao menos um campo.');

export const atualizarStatusPedidoSchema = z.object({
  status: statusPedidoSchema,
});

export const listarPedidosQuerySchema = paginacaoSchema.extend({
  status: statusPedidoSchema.optional(),
  de: z.coerce.date().optional(),
  ate: z.coerce.date().optional(),
});

/* ----------------------------------------------------------------- Mesa */

const statusMesaSchema = z.enum(['LIVRE', 'OCUPADA', 'RESERVADA', 'INATIVA']);

export const criarMesaSchema = z.object({
  numero: z.number().int().positive('Número da mesa inválido.'),
  status: statusMesaSchema.optional(),
  capacidade: z.number().int().positive().max(50).optional().nullable(),
});

export const atualizarMesaSchema = criarMesaSchema
  .partial()
  .refine((dados) => Object.keys(dados).length > 0, 'Envie ao menos um campo.');

export const listarMesasQuerySchema = z.object({
  status: statusMesaSchema.optional(),
});
