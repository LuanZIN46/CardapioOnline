import { z } from 'zod';
import { telefoneSchema, textoObrigatorio } from './comum.schema.js';

export const empresaParamSchema = z.object({
  empresa: z
    .string()
    .trim()
    .min(1, 'Estabelecimento não informado.')
    .max(80)
    .regex(/^[a-z0-9-]+$/, 'Identificador do estabelecimento inválido.'),
});

const enderecoSchema = z.object({
  rua: textoObrigatorio('Rua', 160),
  numero: textoObrigatorio('Número', 20),
  bairro: textoObrigatorio('Bairro', 80),
  cidade: textoObrigatorio('Cidade', 80),
});

export const criarPedidoPublicoSchema = z
  .object({
    cliente: textoObrigatorio('Nome do cliente', 80),
    telefone: telefoneSchema,
    tipo: z.enum(['ENTREGA', 'RETIRADA']),
    endereco: enderecoSchema.optional(),
    formaPagamento: z.enum(['PIX', 'CARTAO', 'DINHEIRO']),
    // Centavos. Só é considerado quando o pagamento é em dinheiro.
    trocoPara: z.number().int().positive().max(100_000_000).optional(),
    observacao: z.string().trim().max(500).optional(),
    itens: z
      .array(
        z.object({
          produtoId: z.uuid('Produto inválido.'),
          quantidade: z.number().int().positive('Quantidade inválida.').max(99),
          observacao: z.string().trim().max(200).optional(),
          adicionais: z
            .array(
              z.object({
                adicionalId: z.uuid('Adicional inválido.'),
                quantidade: z.number().int().positive().max(20),
              }),
            )
            .max(20)
            .optional(),
        }),
      )
      .min(1, 'Inclua ao menos um item no pedido.')
      .max(50, 'Pedido com itens demais.'),
  })
  .refine((dados) => dados.tipo !== 'ENTREGA' || dados.endereco !== undefined, {
    path: ['endereco'],
    message: 'Informe o endereço para entrega.',
  });
