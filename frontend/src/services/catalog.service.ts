import { api, rotaPublica, urlDaImagem } from './api';
import { coupons } from '@/data/coupons';
import { storeSettings } from '@/data/settings';
import type {
  AddonGroup,
  Category,
  Coupon,
  Product,
  ProductBadge,
  StoreSettings,
} from '@/types';

/**
 * Acesso ao cardápio. Categorias, produtos e adicionais vêm da API
 * (PostgreSQL); cupons e configurações da loja ainda são locais e vão para o
 * banco quando o painel administrativo entrar.
 */

/* ------------------------------------------------------ contratos da API */

interface CategoriaApi {
  id: string;
  nome: string;
  icone: string | null;
  ordem: number;
}

interface AdicionalApi {
  id: string;
  nome: string;
  preco: number;
  disponivel: boolean;
}

interface GrupoAdicionalApi {
  id: string;
  nome: string;
  descricao: string | null;
  minSelecao: number;
  maxSelecao: number;
  permiteRepetir: boolean;
  opcoes: AdicionalApi[];
}

interface ProdutoApi {
  id: string;
  nome: string;
  descricao: string | null;
  ingredientes: string[];
  badges: string[];
  preco: number;
  imagem: string | null;
  disponivel: boolean;
  ordem: number;
  categoriaId: string | null;
  gruposAdicionais: GrupoAdicionalApi[];
}

interface CardapioApi {
  empresa: { id: string; nome: string; taxaEntrega: number };
  categorias: CategoriaApi[];
  produtos: ProdutoApi[];
}

export interface Cardapio {
  categories: Category[];
  products: Product[];
  addonGroups: AddonGroup[];
  deliveryFee: number;
}

/* ------------------------------------------------------------- conversão */

const BADGES_VALIDOS: ProductBadge[] = ['novo', 'promocao', 'mais-vendido'];

function paraSlug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function converterCategoria(categoria: CategoriaApi): Category {
  return {
    id: categoria.id,
    name: categoria.nome,
    slug: paraSlug(categoria.nome),
    icon: categoria.icone ?? '🍽️',
    displayOrder: categoria.ordem,
    visible: true,
  };
}

function converterGrupo(grupo: GrupoAdicionalApi): AddonGroup {
  return {
    id: grupo.id,
    name: grupo.nome,
    description: grupo.descricao ?? '',
    minSelection: grupo.minSelecao,
    maxSelection: grupo.maxSelecao,
    allowRepeat: grupo.permiteRepetir,
    options: grupo.opcoes.map((opcao) => ({
      id: opcao.id,
      name: opcao.nome,
      price: opcao.preco,
      available: opcao.disponivel,
    })),
  };
}

function converterProduto(produto: ProdutoApi): Product {
  return {
    id: produto.id,
    name: produto.nome,
    slug: paraSlug(produto.nome),
    description: produto.descricao ?? '',
    ingredients: produto.ingredientes,
    categoryId: produto.categoriaId ?? '',
    imageUrl: urlDaImagem(produto.imagem),
    price: produto.preco,
    badges: produto.badges.filter((badge): badge is ProductBadge =>
      BADGES_VALIDOS.includes(badge as ProductBadge),
    ),
    available: produto.disponivel,
    displayOrder: produto.ordem,
    addonGroupIds: produto.gruposAdicionais.map((grupo) => grupo.id),
  };
}

/* --------------------------------------------------------------- consultas */

/**
 * Cardápio inteiro numa requisição só: evita esperar três chamadas em série
 * e garante que categorias, produtos e adicionais são do mesmo instante.
 */
export async function fetchCardapio(): Promise<Cardapio> {
  const { data } = await api.get<CardapioApi>(rotaPublica('/cardapio'));

  // O mesmo grupo aparece em vários produtos; guardamos uma cópia de cada.
  const grupos = new Map<string, AddonGroup>();
  for (const produto of data.produtos) {
    for (const grupo of produto.gruposAdicionais) {
      if (!grupos.has(grupo.id)) grupos.set(grupo.id, converterGrupo(grupo));
    }
  }

  return {
    categories: data.categorias.map(converterCategoria),
    products: data.produtos.map(converterProduto),
    addonGroups: [...grupos.values()],
    deliveryFee: data.empresa.taxaEntrega,
  };
}

/** Configurações da loja: locais por enquanto, com a taxa vinda do banco. */
export function mesclarConfiguracoes(taxaEntrega: number): StoreSettings {
  return { ...storeSettings, deliveryFee: taxaEntrega };
}

export function fetchSettings(): Promise<StoreSettings> {
  return Promise.resolve(storeSettings);
}

export function fetchCouponByCode(code: string): Promise<Coupon | undefined> {
  const normalizado = code.trim().toUpperCase();
  return Promise.resolve(coupons.find((coupon) => coupon.code === normalizado));
}
