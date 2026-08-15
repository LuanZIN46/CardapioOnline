# API — Cardápio Digital Online

Backend SaaS multiempresa em Node.js + Express + Prisma + **PostgreSQL**.

## Subindo

**O Docker é opcional.** O backend só precisa de uma `DATABASE_URL` apontando para
qualquer PostgreSQL — instalado na máquina, na nuvem ou em contêiner. O
`docker-compose.yml` da raiz é só uma conveniência.

### 1. Escolha um PostgreSQL

| Opção | Como | Quando usar |
| --- | --- | --- |
| **PostgreSQL local** | [Instalador oficial para Windows](https://www.postgresql.org/download/windows/). Dá para escolher o disco de instalação (útil se o C: estiver cheio). | Uso normal, dados persistentes |
| **Postgres do Prisma** | `npx prisma dev` — sobe um servidor local e imprime a `DATABASE_URL` | Testes rápidos, sem instalar nada |
| **Nuvem** | [Neon](https://neon.tech) ou [Supabase](https://supabase.com), planos gratuitos | Acessar de outra máquina, sem instalar nada |
| **Docker** | `docker compose up -d` na raiz | Se já usa Docker |

### 2. Suba a API

```bash
cp .env.example .env
```

Ajuste `DATABASE_URL` no `.env` e depois:

```bash
npm install
npm run migrate:deploy
npm run seed
npm run dev
```

A API sobe em `http://localhost:3333/api` e o cardápio público fica em
`http://localhost:3333/api/publico/bar-do-pardal/cardapio`.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor com recarga automática (tsx watch) |
| `npm run build` | Compila TypeScript para `dist/` |
| `npm run start` | Executa o build de produção |
| `npm run migrate` | `prisma migrate dev` — cria e aplica migrations |
| `npm run migrate:deploy` | Aplica migrations pendentes (produção) |
| `npm run generate` | Regenera o Prisma Client |
| `npm run seed` | Popula uma empresa de demonstração |
| `npm run studio` | Abre o Prisma Studio |
| `npm run typecheck` | Checagem de tipos sem emitir arquivos |

## Arquitetura

```
src/
├── config/       env validado com Zod, Prisma Client
├── controllers/  leem a requisição e devolvem a resposta (sem regra de negócio)
├── middlewares/  autenticação, autorização, validação, upload, erros
├── routes/       definição dos endpoints e quem pode acessá-los
├── services/     toda a regra de negócio e o acesso ao banco
├── utils/        AppError, JWT, hash de senha, helpers
├── validators/   schemas Zod de entrada
└── generated/    Prisma Client (gerado, fora do Git)
```

Regra: **controller não conversa com o Prisma** e **service não conhece `req`/`res`**.

## Multiempresa

Toda tabela de domínio tem `empresaId`. O `empresaId` vem **sempre do JWT**, nunca do corpo
ou da query — assim uma empresa não consegue ler nem alterar dados de outra, mesmo
conhecendo o id do registro. Cada service filtra por `empresaId` antes de qualquer escrita.

## Endpoints

Base: `/api`

### Cardápio público (sem token)

É o que o site do cliente consome. A empresa vem pelo `slug` na URL.

| Método | Rota | O que faz |
| --- | --- | --- |
| GET | `/publico/:empresa/cardapio` | Categorias, produtos e adicionais numa resposta só |
| POST | `/publico/:empresa/pedidos` | Recebe o pedido, calcula os valores e persiste |

O `POST` recebe **apenas identificadores e quantidades**. Preço de produto, preço
de adicional e taxa de entrega vêm do banco — o que o navegador enviar como valor
é ignorado. A resposta traz o pedido salvo, incluindo o número da comanda.

```jsonc
// POST /publico/bar-do-pardal/pedidos
{
  "cliente": "Fabrício Alves",
  "telefone": "14988776655",
  "tipo": "ENTREGA",                    // ou "RETIRADA"
  "endereco": { "rua": "...", "numero": "01", "bairro": "...", "cidade": "..." },
  "formaPagamento": "DINHEIRO",         // PIX | CARTAO | DINHEIRO
  "trocoPara": 10000,                   // centavos, só com DINHEIRO
  "observacao": "Campainha quebrada",
  "itens": [
    {
      "produtoId": "uuid",
      "quantidade": 2,
      "observacao": "Sem cebola",
      "adicionais": [{ "adicionalId": "uuid", "quantidade": 1 }]
    }
  ]
}
```

### Auth
| Método | Rota | Acesso |
| --- | --- | --- |
| POST | `/auth/register` | público — cria empresa + primeiro ADMIN |
| POST | `/auth/login` | público |
| GET | `/auth/me` | autenticado |

### Empresa
| Método | Rota | Acesso |
| --- | --- | --- |
| GET | `/empresa` | autenticado |
| PUT | `/empresa` | ADMIN |
| DELETE | `/empresa` | ADMIN — desativa, não apaga |

### Categorias · Produtos · Mesas
| Método | Rota | Acesso |
| --- | --- | --- |
| GET | `/categorias`, `/produtos`, `/mesas` | autenticado |
| GET | `/{recurso}/:id` | autenticado |
| POST | `/{recurso}` | ADMIN, GERENTE |
| PUT | `/{recurso}/:id` | ADMIN, GERENTE (mesas: qualquer cargo) |
| DELETE | `/{recurso}/:id` | ADMIN, GERENTE |
| POST | `/produtos/:id/imagem` | ADMIN, GERENTE — upload Multer |

### Pedidos
| Método | Rota | Acesso |
| --- | --- | --- |
| GET | `/pedidos` | autenticado — filtros `status`, `de`, `ate`, paginação |
| GET | `/pedidos/resumo-do-dia` | autenticado — faturamento e ticket médio |
| GET | `/pedidos/:id` | autenticado |
| POST | `/pedidos` | autenticado |
| PUT | `/pedidos/:id` | autenticado |
| PATCH | `/pedidos/:id/status` | autenticado |
| DELETE | `/pedidos/:id` | ADMIN |

## Decisões que valem saber

**Dinheiro em centavos.** `preco` e `valorTotal` são inteiros. Nada de `float` em dinheiro.

**Preço nunca vem do cliente.** Ao criar um pedido, a API lê o preço do banco e ignora
qualquer valor enviado. O preço fica congelado em `ItemPedido`, então mudar o cardápio
depois não reescreve o histórico.

**Status com transições controladas.** Um pedido `FINALIZADO` ou `CANCELADO` não volta atrás.

**Exclusão que preserva histórico.** Produto com pedidos vira indisponível em vez de ser
apagado; empresa é desativada, não removida.

**Upload sem confiar no nome do arquivo.** O Multer grava com UUID gerado pelo servidor,
aceita apenas JPEG/PNG/WebP e respeita `MAX_UPLOAD_MB`. No banco vai só o caminho público.

**Login sem revelar quem existe.** E-mail inexistente e senha errada devolvem a mesma
mensagem, e o caminho inválido roda um hash falso para não vazar informação pelo tempo
de resposta.
