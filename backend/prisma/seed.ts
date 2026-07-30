/**
 * Popula o banco com uma empresa de demonstração.
 * Idempotente: rodar de novo não duplica registros.
 *
 *   npm run seed
 */
import { prisma } from '../src/config/prisma.js';
import { gerarHash } from '../src/utils/senha.js';

const EMAIL_EMPRESA = 'contato@bardopardal.com.br';
const EMAIL_ADMIN = 'admin@bardopardal.com.br';
const SENHA_ADMIN = 'pardal2026';

async function main(): Promise<void> {
  const senha = await gerarHash(SENHA_ADMIN);

  const empresa = await prisma.empresa.upsert({
    where: { email: EMAIL_EMPRESA },
    update: {},
    create: {
      nome: 'Bar do Pardal',
      telefone: '14998580049',
      email: EMAIL_EMPRESA,
      plano: 'PRO',
      usuarios: {
        create: { nome: 'Administrador', email: EMAIL_ADMIN, senha, cargo: 'ADMIN' },
      },
    },
    select: { id: true, nome: true },
  });

  const categorias = [
    { nome: 'Lanches', ordem: 1 },
    { nome: 'Porções', ordem: 2 },
    { nome: 'Bebidas', ordem: 3 },
  ];

  for (const categoria of categorias) {
    await prisma.categoria.upsert({
      where: { empresaId_nome: { empresaId: empresa.id, nome: categoria.nome } },
      update: { ordem: categoria.ordem },
      create: { ...categoria, empresaId: empresa.id },
    });
  }

  const lanches = await prisma.categoria.findFirstOrThrow({
    where: { empresaId: empresa.id, nome: 'Lanches' },
    select: { id: true },
  });
  const porcoes = await prisma.categoria.findFirstOrThrow({
    where: { empresaId: empresa.id, nome: 'Porções' },
    select: { id: true },
  });
  const bebidas = await prisma.categoria.findFirstOrThrow({
    where: { empresaId: empresa.id, nome: 'Bebidas' },
    select: { id: true },
  });

  // Preços em centavos.
  const produtos = [
    { nome: 'Pardal Classic', descricao: 'Blend 180g, queijo e molho da casa', preco: 3200, categoriaId: lanches.id },
    { nome: 'Bacon Supremo', descricao: 'Duplo blend, bacon e cheddar', preco: 3990, categoriaId: lanches.id },
    { nome: 'Batata com Cheddar', descricao: 'Serve 2 a 3 pessoas', preco: 4200, categoriaId: porcoes.id },
    { nome: 'Coca-Cola Lata', descricao: '350ml gelada', preco: 700, categoriaId: bebidas.id },
  ];

  for (const [indice, produto] of produtos.entries()) {
    const existente = await prisma.produto.findFirst({
      where: { empresaId: empresa.id, nome: produto.nome },
      select: { id: true },
    });

    if (existente) continue;

    await prisma.produto.create({
      data: { ...produto, ordem: indice + 1, empresaId: empresa.id },
    });
  }

  for (const numero of [1, 2, 3, 4]) {
    await prisma.mesa.upsert({
      where: { empresaId_numero: { empresaId: empresa.id, numero } },
      update: {},
      create: { numero, capacidade: 4, empresaId: empresa.id },
    });
  }

  console.log(`Seed concluído para "${empresa.nome}".`);
  console.log(`Login: ${EMAIL_ADMIN} / ${SENHA_ADMIN}`);
}

main()
  .catch((erro) => {
    console.error('Falha no seed:', erro);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
