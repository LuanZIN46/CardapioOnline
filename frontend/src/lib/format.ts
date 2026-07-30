import type { Money } from '@/types';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function formatCurrency(cents: Money): string {
  return currencyFormatter.format(cents / 100);
}

/** Converte texto digitado ("12,50", "R$ 12.50") para centavos. */
export function parseCurrencyToCents(input: string): Money {
  const digits = input.replace(/\D/g, '');
  return digits ? Number(digits) : 0;
}

/** Máscara progressiva de moeda para inputs: "1250" -> "12,50". */
export function maskCurrency(input: string): string {
  const cents = parseCurrencyToCents(input);
  return (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function maskPhone(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.replace(/^(\d{0,2})/, '($1');
  if (digits.length <= 6) return digits.replace(/^(\d{2})(\d{0,4})/, '($1) $2');
  if (digits.length <= 10) {
    return digits.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  }
  return digits.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
}

export function onlyDigits(input: string): string {
  return input.replace(/\D/g, '');
}

export function formatMinutesRange(range: { min: number; max: number }): string {
  return `${range.min}-${range.max} min`;
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  return minutes === '00' ? `${hours}h` : `${hours}h${minutes}`;
}
