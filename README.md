# Cardápio Online

Cardápio digital para bares e restaurantes. O cliente monta o pedido pelo
celular, finaliza em duas etapas e recebe um comprovante em PDF para enviar ao
WhatsApp do estabelecimento.

Inclui uma área administrativa onde o dono altera produtos, preços e fotos sem
mexer no código.

```
React + Vite  →  Express  →  Prisma  →  PostgreSQL
```

## Stack

| Camada | Tecnologias |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, PWA |
| Backend | Node.js, Express, Prisma ORM, JWT |
| Banco | PostgreSQL |

## Estrutura

```
├── frontend/    aplicação do cliente e painel administrativo
└── backend/     API REST e acesso ao banco
```

## Rodando localmente

Requisitos: Node.js 20+ e um PostgreSQL acessível.

**Backend**

```bash
cd backend
cp .env.example .env
npm install
npm run migrate:deploy
npm run seed
npm run dev
```

Preencha o `.env` com a URL do seu banco e um segredo para o JWT antes de subir.

**Frontend**, em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

O cardápio abre em `http://localhost:5173`.

## Scripts principais

| Comando | Onde | O que faz |
| --- | --- | --- |
| `npm run dev` | ambos | Servidor de desenvolvimento |
| `npm run build` | ambos | Build de produção |
| `npm run migrate:deploy` | backend | Aplica as migrations |
| `npm run seed` | backend | Popula o cardápio inicial |
| `npm run studio` | backend | Abre o Prisma Studio |

## Funcionalidades

- Cardápio por categorias, com busca de adicionais por produto
- Carrinho persistente e checkout em duas etapas
- Comprovante do pedido em PDF no formato de bobina térmica
- Área administrativa protegida para gerenciar produtos e categorias
- Upload de fotos dos produtos
- Estrutura multiempresa: cada estabelecimento enxerga apenas os próprios dados
- Instalável como aplicativo (PWA)

## Configuração

As variáveis de ambiente ficam em `backend/.env` e `frontend/.env`, com exemplos
comentados nos respectivos arquivos `.env.example`. Nenhum desses arquivos vai
para o repositório.

Os dados do estabelecimento — nome, contato e horários — ficam em
`frontend/src/data/settings.ts`.

## Licença

Projeto privado.
