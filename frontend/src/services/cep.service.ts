import { onlyDigits } from '@/lib/format';

interface ViaCepResponse {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  erro?: boolean;
}

export interface CepLookupResult {
  street: string;
  neighborhood: string;
  city: string;
}

/** Consulta o ViaCEP. Retorna null quando o CEP não existe ou o serviço está indisponível. */
export async function lookupCep(zipCode: string): Promise<CepLookupResult | null> {
  const digits = onlyDigits(zipCode);
  if (digits.length !== 8) return null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    if (!response.ok) return null;

    const data: ViaCepResponse = await response.json();
    if (data.erro) return null;

    return {
      street: data.logradouro ?? '',
      neighborhood: data.bairro ?? '',
      city: data.localidade ?? '',
    };
  } catch {
    return null;
  }
}
