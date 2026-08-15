/**
 * Popula o banco com o Bar do Pardal e seu cardápio real.
 * Idempotente: rodar de novo atualiza os registros em vez de duplicar.
 *
 *   npm run seed
 */
import { prisma } from '../src/config/prisma.js';
import { gerarHash } from '../src/utils/senha.js';
import { categoriasSeed, gruposAdicionaisSeed, produtosSeed } from './cardapio.js';

const EMPRESA_SLUG = 'bar-do-pardal';
const EMAIL_EMPRESA = 'contato@bardopardal.com.br';
const EMAIL_ADMIN = process.env.ADMIN_EMAIL ?? 'admin@bardopardal.com.br';
/**
 * Em produção, defina ADMIN_SENHA antes de rodar o seed.
 * O padrão abaixo serve só para desenvolvimento local — ele está versionado,
 * então qualquer pessoa com acesso ao repositório o conhece.
 */
const SENHA_ADMIN = process.env.ADMIN_SENHA ?? 'pardal2026';
const TAXA_ENTREGA = 200;

async function main(): Promise<void> {
  const senha = await gerarHash(SENHA_ADMIN);

  const empresa = await prisma.empresa.upsert({
    where: { slug: EMPRESA_SLUG },
    update: { taxaEntrega: TAXA_ENTREGA },
    create: {
      nome: 'Bar do Pardal',
      slug: EMPRESA_SLUG,
      telefone: '14998580049',
      email: EMAIL_EMPRESA,
      taxaEntrega: TAXA_ENTREGA,
      plano: 'PRO',
      usuarios: {
        create: { nome: 'Administrador', email: EMAIL_ADMIN, senha, cargo: 'ADMIN' },
      },
    },
    select: { id: true, nome: true },
  });

  const categoriaIds = await semearCategorias(empresa.id);
  const grupoIds = await semearGrupos(empresa.id);
  const produtos = await semearProdutos(empresa.id, categoriaIds, grupoIds);

  for (const numero of [1, 2, 3, 4]) {
    await prisma.mesa.upsert({
      where: { empresaId_numero: { empresaId: empresa.id, numero } },
      update: {},
      create: { numero, capacidade: 4, empresaId: empresa.id },
    });
  }

  console.log(`Seed concluído para "${empresa.nome}" (slug: ${EMPRESA_SLUG})`);
  console.log(`  ${categoriaIds.size} categorias, ${produtos} produtos, ${grupoIds.size} grupos de adicionais`);
  console.log(`  Login do painel: ${EMAIL_ADMIN} / ${SENHA_ADMIN}`);
}

async function semearCategorias(empresaId: string): Promise<Map<string, string>> {
  const ids = new Map<string, string>();

  for (const categoria of categoriasSeed) {
    const registro = await prisma.categoria.upsert({
      where: { empresaId_nome: { empresaId, nome: categoria.nome } },
      update: { ordem: categoria.ordem, icone: categoria.icone, ativo: true },
      create: { nome: categoria.nome, icone: categoria.icone, ordem: categoria.ordem, empresaId },
      select: { id: true },
    });
    ids.set(categoria.slug, registro.id);
  }

  return ids;
}

async function semearGrupos(empresaId: string): Promise<Map<string, string>> {
  const ids = new Map<string, string>();

  for (const grupo of gruposAdicionaisSeed) {
    const registro = await prisma.grupoAdicional.upsert({
      where: { empresaId_nome: { empresaId, nome: grupo.nome } },
      update: {
        descricao: grupo.descricao,
        minSelecao: grupo.minSelecao,
        maxSelecao: grupo.maxSelecao,
        permiteRepetir: grupo.permiteRepetir,
        ordem: grupo.ordem,
        ativo: true,
      },
      create: {
        nome: grupo.nome,
        descricao: grupo.descricao,
        minSelecao: grupo.minSelecao,
        maxSelecao: grupo.maxSelecao,
        permiteRepetir: grupo.permiteRepetir,
        ordem: grupo.ordem,
        empresaId,
      },
      select: { id: true },
    });

    ids.set(grupo.slug, registro.id);

    for (const [indice, opcao] of grupo.opcoes.entries()) {
      const existente = await prisma.adicional.findFirst({
        where: { grupoId: registro.id, nome: opcao.nome },
        select: { id: true },
      });

      if (existente) {
        await prisma.adicional.update({
          where: { id: existente.id },
          data: { preco: opcao.preco, ordem: indice + 1, disponivel: true },
        });
      } else {
        await prisma.adicional.create({
          data: { nome: opcao.nome, preco: opcao.preco, ordem: indice + 1, grupoId: registro.id },
        });
      }
    }
  }

  return ids;
}

async function semearProdutos(
  empresaId: string,
  categoriaIds: Map<string, string>,
  grupoIds: Map<string, string>,
): Promise<number> {
  for (const produto of produtosSeed) {
    const categoriaId = categoriaIds.get(produto.categoria);
    if (!categoriaId) throw new Error(`Categoria "${produto.categoria}" não semeada.`);

    const dados = {
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
      imagem: produto.imagem ?? null,
      ingredientes: produto.ingredientes ?? [],
      badges: produto.badges ?? [],
      ordem: produto.ordem,
      disponivel: true,
      categoriaId,
    };

    const existente = await prisma.produto.findFirst({
      where: { empresaId, nome: produto.nome },
      select: { id: true },
    });

    const registro = existente
      ? await prisma.produto.update({ where: { id: existente.id }, data: dados, select: { id: true } })
      : await prisma.produto.create({ data: { ...dados, empresaId }, select: { id: true } });

    // Revincula os grupos de adicionais do zero para refletir mudanças no cardápio.
    await prisma.produtoGrupoAdicional.deleteMany({ where: { produtoId: registro.id } });

    for (const [indice, slugGrupo] of (produto.grupos ?? []).entries()) {
      const grupoId = grupoIds.get(slugGrupo);
      if (!grupoId) throw new Error(`Grupo "${slugGrupo}" não semeado.`);

      await prisma.produtoGrupoAdicional.create({
        data: { produtoId: registro.id, grupoId, ordem: indice + 1 },
      });
    }
  }

  return produtosSeed.length;
}

main()
  .catch((erro) => {
    console.error('Falha no seed:', erro);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
