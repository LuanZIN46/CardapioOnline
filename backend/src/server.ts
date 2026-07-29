import { app } from './app.js';
import { env } from './config/env.js';
import { disconnectPrisma } from './config/prisma.js';

const servidor = app.listen(env.PORT, () => {
  console.log(`API do Cardápio Digital rodando em http://localhost:${env.PORT}/api`);
  console.log(`Ambiente: ${env.NODE_ENV}`);
});

/** Encerramento ordenado: para de aceitar conexões antes de fechar o banco. */
async function encerrar(sinal: string): Promise<void> {
  console.log(`\n${sinal} recebido, encerrando...`);

  servidor.close(async () => {
    await disconnectPrisma();
    process.exit(0);
  });

  // Rede travada não pode impedir o processo de morrer.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => void encerrar('SIGTERM'));
process.on('SIGINT', () => void encerrar('SIGINT'));

process.on('unhandledRejection', (motivo) => {
  console.error('[promessa rejeitada sem tratamento]', motivo);
});
