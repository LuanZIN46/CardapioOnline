# Bar do Pardal — Cardápio Online

Sistema de cardápio online com carrinho e finalização de pedido pelo WhatsApp.
Mobile First, tema preto e dourado, instalável como PWA.

## Estrutura

```
Cardapio/
├── frontend/            React 19 + TypeScript + Vite — cardápio do cliente
├── backend/             Node + Express + Prisma + PostgreSQL — API SaaS
└── docker-compose.yml   PostgreSQL + API, com volumes persistentes
```

## Subindo tudo com Docker

```bash
cp .env.example .env && docker compose up -d
```

Preencha `JWT_SECRET` no `.env` antes de subir. A API fica em `http://localhost:3333/api`
e o banco em `localhost:5432`. Detalhes da API em [backend/README.md](backend/README.md).

## Rodando o frontend

```bash
cd frontend && npm install && npm run dev
```

Scripts disponíveis:

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Type check + build de produção (gera PWA) |
| `npm run preview` | Serve o build de produção |
| `npm run lint` | Lint com oxlint |
| `npm run icons` | Regera favicon, ícones do PWA e a marca reduzida a partir de `public/logo.jpg` |

## O que já está pronto

**Cardápio**
- Banner, status Aberto/Fechado calculado pelos horários (inclusive madrugada), tempo de entrega, taxa e pedido mínimo
- Categorias em rolagem horizontal com destaque automático conforme a rolagem da página
- Cards com foto, preço promocional e selos de Novo / Promoção / Mais Vendido
- Modal do produto com ingredientes, quantidade, observações e grupos de adicionais (obrigatórios e opcionais, com repetição)

**Carrinho e checkout**
- Carrinho lateral persistido em `localStorage`, com edição de quantidade e limpeza
- Bloqueio de checkout abaixo do pedido mínimo
- Checkout validado com Zod: entrega ou retirada, endereço com busca automática por CEP, PIX / cartão / dinheiro com cálculo de troco
- Cupons de desconto (`PARDAL10`, `FRETEGRATIS`, `PARDAL5`)
- Comprovante do pedido em PDF, compartilhado no WhatsApp `5514998580049`

**Base técnica**
- PWA instalável com service worker
- Rotas com lazy loading, SEO básico e dados estruturados JSON-LD
- Valores monetários em centavos (sem erro de ponto flutuante)
- Máscaras de telefone, CEP e moeda brasileira

## Identidade visual

| Arquivo | Onde aparece |
| --- | --- |
| `public/logo.jpg` | Logo completa — rodapé e origem de todos os ícones |
| `public/logo-mark.png` | Só o emblema das canecas — header (legível em 40px) |
| `public/fachada.jpg` | Foto de capa do topo da página |
| `public/icons/` | Favicon, apple-touch-icon e ícones do PWA (gerados) |

Para trocar a marca: substitua `public/logo.jpg` e rode `npm run icons`.
O recorte do emblema é fixo em `scripts/generate-icons.mjs` (`MARK_CROP`) e precisa ser revisto se a arte mudar.

## Onde ficam as configurações

Os dados do estabelecimento estão em [`frontend/src/data/settings.ts`](frontend/src/data/settings.ts) —
nome, WhatsApp, taxa de entrega, pedido mínimo, chave PIX, endereço e horários por dia da semana.
Cardápio, adicionais e cupons ficam nos demais arquivos de `src/data/`.

O frontend ainda lê o cardápio desses arquivos locais. Para ligá-lo à API, troque o corpo das
funções de [`frontend/src/services/catalog.service.ts`](frontend/src/services/catalog.service.ts)
por chamadas HTTP — o restante da aplicação não muda.

## Próximas etapas

1. Ligar o frontend à API (substituir os dados locais pelas rotas de `/produtos` e `/categorias`)
2. Painel administrativo consumindo `/pedidos` e `/produtos`
3. Pedidos em tempo real com Socket.IO
4. Adicionais, cupons e horários de funcionamento no banco (hoje vivem só no frontend)
