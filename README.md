# Bar do Pardal — Cardápio Online

Cardápio digital com carrinho, checkout em duas etapas e comanda em PDF enviada
pelo WhatsApp. Mobile First, tema preto e dourado, instalável como PWA.

```
React 19 + Vite  →  Express  →  Prisma  →  PostgreSQL
```

## Estrutura

```
Cardapio/
├── frontend/            React 19 + TypeScript + Vite — cardápio do cliente
├── backend/             Node + Express + Prisma + PostgreSQL — API
└── docker-compose.yml   opcional: PostgreSQL + API em contêiner
```

O cardápio **vem do banco de dados**. Não há mais produtos em arquivos `.ts`.

## Rodando

Precisa de um PostgreSQL. O Docker é opcional — veja as alternativas em
[backend/README.md](backend/README.md#subindo).

**1. Backend**

```bash
cd backend && cp .env.example .env
```

Ajuste `DATABASE_URL` e `JWT_SECRET` no `.env`, depois:

```bash
npm install && npm run migrate:deploy && npm run seed && npm run dev
```

**2. Frontend**, em outro terminal:

```bash
cd frontend && npm install && npm run dev
```

O cardápio abre em `http://localhost:5173` consumindo a API em `http://localhost:3333/api`.

## Scripts

### Frontend

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Type check + build de produção (gera PWA) |
| `npm run preview` | Serve o build de produção |
| `npm run lint` | Lint com oxlint |
| `npm run icons` | Regera favicon, ícones do PWA e a marca reduzida a partir de `public/logo.jpg` |

### Backend

| Comando | O que faz |
| --- | --- |
| `npm run dev` | API com recarga automática |
| `npm run migrate` | Cria e aplica migrations (desenvolvimento) |
| `npm run migrate:deploy` | Aplica migrations pendentes |
| `npm run seed` | Popula o cardápio real do Bar do Pardal |
| `npm run studio` | Abre o Prisma Studio para inspecionar o banco |

## Configuração

| Onde | O quê |
| --- | --- |
| `backend/.env` | `DATABASE_URL`, `JWT_SECRET`, `PORT`, `CORS_ORIGINS` |
| `frontend/.env` | `VITE_API_URL`, `VITE_EMPRESA_SLUG` |
| `backend/prisma/cardapio.ts` | Cardápio usado pelo seed — produtos, preços e adicionais |
| `frontend/src/data/settings.ts` | Nome, WhatsApp, PIX, endereço e horários (ainda locais) |

A **taxa de entrega** fica na coluna `taxaEntrega` da tabela `empresas`: é o servidor
que calcula o total do pedido, então esse valor não pode vir do navegador.

## Identidade visual

| Arquivo | Onde aparece |
| --- | --- |
| `frontend/public/logo.jpg` | Logo completa — rodapé e origem de todos os ícones |
| `frontend/public/logo-mark.png` | Só o emblema — header (legível em 40px) |
| `frontend/public/fachada.jpg` | Foto de capa do topo da página |
| `frontend/public/icons/` | Favicon, apple-touch-icon e ícones do PWA (gerados) |

Para trocar a marca: substitua `public/logo.jpg` e rode `npm run icons`.

## Como o pedido funciona

1. Cliente monta o carrinho (persistido em `localStorage`)
2. Checkout em duas etapas: dados do cliente → recebimento e pagamento
3. `POST /api/publico/{slug}/pedidos` com **apenas ids e quantidades**
4. O servidor lê os preços do banco, calcula subtotal, taxa e total, e persiste
5. A resposta traz o número da comanda, usado para gerar o PDF de 80 mm
6. O cliente compartilha o PDF no WhatsApp

O `wa.me` só aceita texto, então o envio usa a Web Share API (celular) ou baixa o
PDF e abre a conversa (desktop).


Duas telas apenas: **Produtos** e **Categorias**. Alterou o preço e salvou, o
cardápio público já mostra o novo valor — sem editar arquivo nem fazer deploy.

As fotos vão para `backend/uploads/` com nome gerado pelo servidor; o banco
guarda só o caminho.

## Publicando

Passo a passo em [DEPLOY.md](DEPLOY.md): banco no Neon, API no Render e cardápio
na Vercel. Nenhuma das três exige Docker.

## Próximas etapas

1. Painel administrativo: login, dashboard e fila de pedidos
2. CRUD de produtos e categorias com upload de imagem
3. Levar cupons, configurações da loja e horários para o banco
4. Pedidos em tempo real com Socket.IO
