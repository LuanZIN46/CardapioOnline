import { api } from './api';
import type { UsuarioAutenticado } from '@/store/auth.store';

/**
 * Chamadas do painel administrativo.
 *
 * Todas exigem token — o backend resolve a empresa pelo JWT, então nenhum
 * `empresaId` é enviado daqui. Um administrador nunca alcança dados de outra empresa.
 */

/* --------------------------------------------------------------- sessão */

interface RespostaLogin {
  token: string;
  usuario: UsuarioAutenticado;
  empresa: { id: string; nome: string; plano: string };
}

export async function login(email: string, senha: string): Promise<RespostaLogin> {
  const { data } = await api.post<RespostaLogin>('/auth/login', { email, senha });
  return data;
}

/* ----------------------------------------------------------- categorias */

export interface CategoriaAdmin {
  id: string;
  nome: string;
  icone: string | null;
  ordem: number;
  ativo: boolean;
  _count?: { produtos: number };
}

export interface DadosCategoria {
  nome: string;
  icone?: string | null;
  ordem?: number;
  ativo?: boolean;
}

export async function listarCategorias(): Promise<CategoriaAdmin[]> {
  // Inclui as inativas: o painel precisa enxergar o que está fora do ar.
  const { data } = await api.get<CategoriaAdmin[]>('/categorias', {
    params: { incluirInativas: 'true' },
  });
  return data;
}

export async function criarCategoria(dados: DadosCategoria): Promise<CategoriaAdmin> {
  const { data } = await api.post<CategoriaAdmin>('/categorias', dados);
  return data;
}

export async function atualizarCategoria(
  id: string,
  dados: Partial<DadosCategoria>,
): Promise<CategoriaAdmin> {
  const { data } = await api.put<CategoriaAdmin>(`/categorias/${id}`, dados);
  return data;
}

export async function excluirCategoria(id: string): Promise<void> {
  await api.delete(`/categorias/${id}`);
}

/* -------------------------------------------------------------- produtos */

export interface ProdutoAdmin {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  imagem: string | null;
  disponivel: boolean;
  ordem: number;
  categoria: { id: string; nome: string } | null;
}

export interface DadosProduto {
  nome: string;
  descricao?: string | null;
  preco: number;
  disponivel?: boolean;
  categoriaId?: string | null;
}

interface ListaProdutos {
  itens: ProdutoAdmin[];
  paginacao: { pagina: number; porPagina: number; total: number; totalPaginas: number };
}

export async function listarProdutos(): Promise<ProdutoAdmin[]> {
  const { data } = await api.get<ListaProdutos>('/produtos', {
    params: { porPagina: 100 },
  });
  return data.itens;
}

export async function criarProduto(dados: DadosProduto): Promise<ProdutoAdmin> {
  const { data } = await api.post<ProdutoAdmin>('/produtos', dados);
  return data;
}

export async function atualizarProduto(
  id: string,
  dados: Partial<DadosProduto>,
): Promise<ProdutoAdmin> {
  const { data } = await api.put<ProdutoAdmin>(`/produtos/${id}`, dados);
  return data;
}

/** Produto com histórico de pedidos é apenas desativado; a API avisa qual foi o caso. */
export async function excluirProduto(id: string): Promise<{ removido: boolean; mensagem: string }> {
  const { data } = await api.delete<{ removido: boolean; mensagem: string }>(`/produtos/${id}`);
  return data;
}

/** Envia a foto e devolve o caminho público já gravado no produto. */
export async function enviarFoto(id: string, arquivo: File): Promise<string> {
  const corpo = new FormData();
  corpo.append('imagem', arquivo);

  const { data } = await api.post<{ imagem: string }>(`/produtos/${id}/imagem`, corpo, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data.imagem;
}
