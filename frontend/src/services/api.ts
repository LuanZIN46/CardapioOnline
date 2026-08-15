import axios, { AxiosError } from 'axios';
import { tokenAtual, useAuthStore } from '@/store/auth.store';

/**
 * Ponto único de comunicação com a API.
 * Nenhum componente monta URL ou trata resposta HTTP por conta própria.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api';

/** Slug do estabelecimento no cardápio público: /api/publico/{slug}/... */
export const EMPRESA_SLUG = import.meta.env.VITE_EMPRESA_SLUG ?? 'bar-do-pardal';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/** Erro já traduzido para algo que a interface pode mostrar ao cliente. */
export class ApiError extends Error {
  readonly status: number;
  readonly detalhes?: Array<{ campo: string; mensagem: string }>;
  /** Sem resposta do servidor: rede caiu, API fora do ar ou timeout. */
  readonly offline: boolean;

  constructor(
    message: string,
    status: number,
    options: { detalhes?: Array<{ campo: string; mensagem: string }>; offline?: boolean } = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detalhes = options.detalhes;
    this.offline = options.offline ?? false;
  }
}

// Toda requisição autenticada leva o token do painel. O cardápio público
// ignora esse cabeçalho, então não há prejuízo em enviá-lo sempre que existir.
api.interceptors.request.use((config) => {
  const token = tokenAtual();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ erro?: string; detalhes?: Array<{ campo: string; mensagem: string }> }>) => {
    // Sem `response` o pedido nem chegou ao servidor.
    if (!error.response) {
      return Promise.reject(
        new ApiError(
          'Não conseguimos falar com o servidor. Verifique sua conexão e tente de novo.',
          0,
          { offline: true },
        ),
      );
    }

    const { status, data } = error.response;

    // Token expirado ou inválido: derruba a sessão para o painel voltar ao login.
    if (status === 401 && tokenAtual()) {
      useAuthStore.getState().sair();
    }

    const mensagem = data?.erro ?? mensagemPadrao(status);

    return Promise.reject(new ApiError(mensagem, status, { detalhes: data?.detalhes }));
  },
);

function mensagemPadrao(status: number): string {
  if (status === 404) return 'Não encontramos o que você procura.';
  if (status === 422) return 'Alguns dados do pedido estão incorretos.';
  if (status === 429) return 'Muitas tentativas seguidas. Aguarde um instante.';
  if (status >= 500) return 'O servidor teve um problema. Tente novamente em instantes.';
  return 'Não foi possível concluir a solicitação.';
}

/** Caminho das rotas públicas do estabelecimento atual. */
export function rotaPublica(caminho: string): string {
  return `/publico/${EMPRESA_SLUG}${caminho}`;
}

/**
 * Resolve a imagem de um produto.
 * Fotos enviadas pelo painel voltam como caminho relativo (`/uploads/x.jpg`) e
 * são servidas pela API, não pelo frontend. URLs absolutas passam intactas.
 */
export function urlDaImagem(caminho: string | null | undefined): string {
  if (!caminho) return '';
  if (/^https?:\/\//i.test(caminho)) return caminho;

  const origem = BASE_URL.replace(/\/api\/?$/, '');
  return `${origem}${caminho.startsWith('/') ? '' : '/'}${caminho}`;
}
