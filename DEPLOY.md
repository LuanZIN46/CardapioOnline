# Colocando o sistema no ar

Três peças, cada uma num lugar: **banco** (Neon), **API** (Render) e **cardápio**
(Vercel). Todas têm plano gratuito suficiente para começar.

Nada aqui exige Docker.

---

## 1. Subir o código para o GitHub

O repositório já aponta para `github.com/LuanZIN46/CardapioOnline`.

```bash
git add -A
git commit -m "Cardápio online conectado ao PostgreSQL com painel administrativo"
git push
```

Os arquivos `.env` estão no `.gitignore` e **não vão junto** — confira com
`git status` antes de commitar se aparecer algum.

---

## 2. Banco de dados no Neon

1. Crie uma conta em [neon.tech](https://neon.tech) e um projeto na região **South America (São Paulo)**.
2. Copie a *connection string*. Ela se parece com:

```
postgresql://usuario:senha@ep-xxx.sa-east-1.aws.neon.tech/neondb?sslmode=require
```

3. Guarde essa string — ela é a `DATABASE_URL` do próximo passo.

Aplique as migrations e o cardápio inicial a partir da sua máquina, uma única vez:

```bash
cd backend
DATABASE_URL="cole-a-string-aqui" npx prisma migrate deploy
DATABASE_URL="cole-a-string-aqui" npm run seed
```

> No PowerShell use `$env:DATABASE_URL="..."` numa linha separada antes dos comandos.

---

## 3. API no Render

1. Em [render.com](https://render.com), **New → Web Service** e conecte o repositório.
2. Configure:

| Campo | Valor |
| --- | --- |
| Root Directory | `backend` |
| Build Command | `npm install && npm run build` |
| Start Command | `npx prisma migrate deploy && npm start` |

3. Em **Environment**, adicione:

| Variável | Valor |
| --- | --- |
| `DATABASE_URL` | a string do Neon |
| `JWT_SECRET` | **gere um novo**, veja abaixo |
| `NODE_ENV` | `production` |
| `CORS_ORIGINS` | a URL da Vercel (preencha depois do passo 4) |

Gere o segredo com:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Anote a URL que o Render devolve, algo como `https://cardapio-api.onrender.com`.

---

## 4. Cardápio na Vercel

1. Em [vercel.com](https://vercel.com), **Add New → Project** e escolha o repositório.
2. Em **Root Directory**, selecione `frontend`.
3. Em **Environment Variables**:

| Variável | Valor |
| --- | --- |
| `VITE_API_URL` | `https://cardapio-api.onrender.com/api` |
| `VITE_EMPRESA_SLUG` | `bar-do-pardal` |

O `vercel.json` do projeto já cuida do roteamento da SPA — sem ele, recarregar
`/admin/produtos` daria 404.

4. Publique e copie a URL final.

---

## 5. Fechar o CORS

Volte ao Render e ajuste `CORS_ORIGINS` para a URL da Vercel:

```
CORS_ORIGINS=https://seu-cardapio.vercel.app
```

Sem esse passo o navegador bloqueia todas as chamadas à API.

---

## 6. Conferir

1. Abra a URL da Vercel — o cardápio deve carregar com os 30 produtos.
2. Faça um pedido de teste até a comanda em PDF.
3. Entre em `/admin/login` e altere um preço; o cardápio deve refletir.

---

## Pontos de atenção

**As fotos enviadas pelo painel somem a cada deploy.** O Render grava em disco
efêmero. Enquanto o volume de fotos for pequeno, dá para reenviar; quando
incomodar, o caminho é trocar o Multer por Cloudinary ou S3 — muda só o
`upload.middleware.ts`, o resto da aplicação não sente.

**O plano gratuito do Render hiberna** após 15 minutos sem uso. A primeira visita
depois disso demora ~30 segundos. O plano pago mais barato resolve.

**Troque a senha do administrador.** O seed cria `admin@bardopardal.com.br` com
`pardal2026`, que está escrito neste repositório público.

**Domínio próprio:** tanto Vercel quanto Render aceitam. Depois de apontar,
lembre de atualizar `CORS_ORIGINS` e `VITE_API_URL`.
