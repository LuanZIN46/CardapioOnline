# API — Cardápio Digital Online

Backend SaaS multiempresa em Node.js + Express + Prisma + **PostgreSQL**.

## Subindo

### Com Docker (recomendado)

Na raiz do repositório:

```bash
cp .env.example .env && docker compose up -d
```

O compose sobe o PostgreSQL, aplica as migrations e inicia a API em `http://localhost:3333/api`.
Preencha `JWT_SECRET` no `.env` antes — o compose recusa subir sem ele.

### Sem Docker

Com um PostgreSQL já rodando:

```bash
cp .env.example .env
npm install
npm run migrate
npm run seed
npm run dev
```

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
