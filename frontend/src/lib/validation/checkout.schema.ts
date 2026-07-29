import { z } from 'zod';
import { onlyDigits, parseCurrencyToCents } from '@/lib/format';
import type { Money } from '@/types';

const addressSchema = z.object({
  zipCode: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  complement: z.string().optional(),
  reference: z.string().optional(),
});

export const baseCheckoutSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Informe seu nome completo.')
    .max(80, 'Nome muito longo.'),
  phone: z
    .string()
    .refine((value) => onlyDigits(value).length >= 10, 'Informe um telefone válido com DDD.'),
  orderType: z.enum(['delivery', 'pickup']),
  address: addressSchema,
  payment: z.enum(['pix', 'card', 'cash']),
  needsChange: z.boolean(),
  changeFor: z.string().optional(),
  notes: z.string().max(300, 'Observação muito longa.').optional(),
});

export type CheckoutFormValues = z.infer<typeof baseCheckoutSchema>;

const REQUIRED_ADDRESS_FIELDS = [
  { field: 'street', message: 'Informe a rua.' },
  { field: 'number', message: 'Informe o número.' },
  { field: 'neighborhood', message: 'Informe o bairro.' },
  { field: 'city', message: 'Informe a cidade.' },
] as const;

/** O total é injetado para validar se o troco informado cobre o valor do pedido. */
export function createCheckoutSchema(total: Money) {
  return baseCheckoutSchema.superRefine((values, ctx) => {
    if (values.orderType === 'delivery') {
      for (const { field, message } of REQUIRED_ADDRESS_FIELDS) {
        if (!values.address?.[field]?.trim()) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['address', field], message });
        }
      }

      if (onlyDigits(values.address?.zipCode ?? '').length !== 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['address', 'zipCode'],
          message: 'Informe um CEP válido.',
        });
      }
    }

    if (values.payment === 'cash' && values.needsChange) {
      const changeFor = parseCurrencyToCents(values.changeFor ?? '');
      if (changeFor <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['changeFor'],
          message: 'Informe o valor para o troco.',
        });
      } else if (changeFor < total) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['changeFor'],
          message: 'O valor precisa ser maior ou igual ao total do pedido.',
        });
      }
    }
  });
}
