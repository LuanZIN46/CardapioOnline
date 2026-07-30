# syntax=docker/dockerfile:1

# ---------- build ----------
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts tsconfig.json ./
# O client precisa existir antes do tsc, pois o código importa os tipos gerados.
RUN npx prisma generate

COPY src ./src
RUN npm run build

# ---------- runtime ----------
FROM node:22-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY --from=build /app/src/generated ./dist/src/generated
COPY prisma ./prisma
COPY prisma.config.ts ./

# Uploads ficam num volume para sobreviver a novos deploys.
RUN mkdir -p uploads && chown -R node:node /app

USER node
EXPOSE 3333

CMD ["node", "dist/src/server.js"]
