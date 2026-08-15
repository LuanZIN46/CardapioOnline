-- CreateEnum
CREATE TYPE "TipoPedido" AS ENUM ('ENTREGA', 'RETIRADA');

-- CreateEnum
CREATE TYPE "FormaPagamento" AS ENUM ('PIX', 'CARTAO', 'DINHEIRO');

-- AlterTable
-- O slug entra nulo, recebe valor derivado do id nas linhas já existentes e só
-- então vira NOT NULL. Assim a migration roda mesmo com empresas cadastradas.
ALTER TABLE "empresas" ADD COLUMN     "slug" TEXT,
ADD COLUMN     "taxaEntrega" INTEGER NOT NULL DEFAULT 0;

UPDATE "empresas" SET "slug" = 'empresa-' || LEFT("id", 8) WHERE "slug" IS NULL;

ALTER TABLE "empresas" ALTER COLUMN "slug" SET NOT NULL;

-- AlterTable
ALTER TABLE "categorias" ADD COLUMN     "icone" TEXT;

-- AlterTable
ALTER TABLE "produtos" ADD COLUMN     "badges" TEXT[],
ADD COLUMN     "ingredientes" TEXT[];

-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "formaPagamento" "FormaPagamento" NOT NULL DEFAULT 'PIX',
ADD COLUMN     "subtotal" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "taxaEntrega" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tipo" "TipoPedido" NOT NULL DEFAULT 'ENTREGA',
ADD COLUMN     "trocoPara" INTEGER;

-- AlterTable
-- Mesma estratégia: itens antigos herdam o nome atual do produto antes do NOT NULL.
ALTER TABLE "itens_pedido" ADD COLUMN     "nome" TEXT,
ADD COLUMN     "subtotal" INTEGER NOT NULL DEFAULT 0;

UPDATE "itens_pedido" AS i
SET "nome" = p."nome"
FROM "produtos" AS p
WHERE i."produtoId" = p."id" AND i."nome" IS NULL;

UPDATE "itens_pedido" SET "nome" = 'Produto removido' WHERE "nome" IS NULL;
UPDATE "itens_pedido" SET "subtotal" = "preco" * "quantidade" WHERE "subtotal" = 0;

ALTER TABLE "itens_pedido" ALTER COLUMN "nome" SET NOT NULL;

-- CreateTable
CREATE TABLE "grupos_adicionais" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "minSelecao" INTEGER NOT NULL DEFAULT 0,
    "maxSelecao" INTEGER NOT NULL DEFAULT 1,
    "permiteRepetir" BOOLEAN NOT NULL DEFAULT false,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "empresaId" TEXT NOT NULL,

    CONSTRAINT "grupos_adicionais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adicionais" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "preco" INTEGER NOT NULL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "grupoId" TEXT NOT NULL,

    CONSTRAINT "adicionais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos_grupos_adicionais" (
    "produtoId" TEXT NOT NULL,
    "grupoId" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "produtos_grupos_adicionais_pkey" PRIMARY KEY ("produtoId","grupoId")
);

-- CreateTable
CREATE TABLE "itens_pedido_adicionais" (
    "id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "preco" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "itemPedidoId" TEXT NOT NULL,
    "adicionalId" TEXT,

    CONSTRAINT "itens_pedido_adicionais_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "grupos_adicionais_empresaId_idx" ON "grupos_adicionais"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "grupos_adicionais_empresaId_nome_key" ON "grupos_adicionais"("empresaId", "nome");

-- CreateIndex
CREATE INDEX "adicionais_grupoId_idx" ON "adicionais"("grupoId");

-- CreateIndex
CREATE INDEX "produtos_grupos_adicionais_grupoId_idx" ON "produtos_grupos_adicionais"("grupoId");

-- CreateIndex
CREATE INDEX "itens_pedido_adicionais_itemPedidoId_idx" ON "itens_pedido_adicionais"("itemPedidoId");

-- CreateIndex
CREATE INDEX "itens_pedido_adicionais_adicionalId_idx" ON "itens_pedido_adicionais"("adicionalId");

-- CreateIndex
CREATE UNIQUE INDEX "empresas_slug_key" ON "empresas"("slug");

-- AddForeignKey
ALTER TABLE "grupos_adicionais" ADD CONSTRAINT "grupos_adicionais_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adicionais" ADD CONSTRAINT "adicionais_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "grupos_adicionais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos_grupos_adicionais" ADD CONSTRAINT "produtos_grupos_adicionais_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos_grupos_adicionais" ADD CONSTRAINT "produtos_grupos_adicionais_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "grupos_adicionais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pedido_adicionais" ADD CONSTRAINT "itens_pedido_adicionais_itemPedidoId_fkey" FOREIGN KEY ("itemPedidoId") REFERENCES "itens_pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pedido_adicionais" ADD CONSTRAINT "itens_pedido_adicionais_adicionalId_fkey" FOREIGN KEY ("adicionalId") REFERENCES "adicionais"("id") ON DELETE SET NULL ON UPDATE CASCADE;
