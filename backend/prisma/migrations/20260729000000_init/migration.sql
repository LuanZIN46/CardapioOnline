-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Plano" AS ENUM ('FREE', 'BASICO', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "Cargo" AS ENUM ('ADMIN', 'GERENTE', 'ATENDENTE');

-- CreateEnum
CREATE TYPE "StatusPedido" AS ENUM ('NOVO', 'EM_PREPARO', 'SAIU_PARA_ENTREGA', 'FINALIZADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "StatusMesa" AS ENUM ('LIVRE', 'OCUPADA', 'RESERVADA', 'INATIVA');

-- CreateTable
CREATE TABLE "empresas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "plano" "Plano" NOT NULL DEFAULT 'FREE',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "cargo" "Cargo" NOT NULL DEFAULT 'ATENDENTE',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "empresaId" TEXT NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "empresaId" TEXT NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "preco" INTEGER NOT NULL,
    "imagem" TEXT,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoriaId" TEXT,
    "empresaId" TEXT NOT NULL,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" TEXT NOT NULL,
    "numero" SERIAL NOT NULL,
    "cliente" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "endereco" TEXT,
    "status" "StatusPedido" NOT NULL DEFAULT 'NOVO',
    "observacao" TEXT,
    "valorTotal" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mesaId" TEXT,
    "empresaId" TEXT NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_pedido" (
    "id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "preco" INTEGER NOT NULL,
    "observacao" TEXT,
    "pedidoId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,

    CONSTRAINT "itens_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mesas" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "status" "StatusMesa" NOT NULL DEFAULT 'LIVRE',
    "capacidade" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "empresaId" TEXT NOT NULL,

    CONSTRAINT "mesas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "empresas_email_key" ON "empresas"("email");

-- CreateIndex
CREATE INDEX "usuarios_empresaId_idx" ON "usuarios"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_empresaId_email_key" ON "usuarios"("empresaId", "email");

-- CreateIndex
CREATE INDEX "categorias_empresaId_idx" ON "categorias"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_empresaId_nome_key" ON "categorias"("empresaId", "nome");

-- CreateIndex
CREATE INDEX "produtos_empresaId_idx" ON "produtos"("empresaId");

-- CreateIndex
CREATE INDEX "produtos_empresaId_categoriaId_idx" ON "produtos"("empresaId", "categoriaId");

-- CreateIndex
CREATE INDEX "pedidos_empresaId_idx" ON "pedidos"("empresaId");

-- CreateIndex
CREATE INDEX "pedidos_empresaId_status_idx" ON "pedidos"("empresaId", "status");

-- CreateIndex
CREATE INDEX "pedidos_empresaId_createdAt_idx" ON "pedidos"("empresaId", "createdAt");

-- CreateIndex
CREATE INDEX "itens_pedido_pedidoId_idx" ON "itens_pedido"("pedidoId");

-- CreateIndex
CREATE INDEX "itens_pedido_produtoId_idx" ON "itens_pedido"("produtoId");

-- CreateIndex
CREATE INDEX "mesas_empresaId_idx" ON "mesas"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "mesas_empresaId_numero_key" ON "mesas"("empresaId", "numero");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_mesaId_fkey" FOREIGN KEY ("mesaId") REFERENCES "mesas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mesas" ADD CONSTRAINT "mesas_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
