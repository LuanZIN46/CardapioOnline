import { RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ApiError } from '@/services/api';

interface CatalogErrorProps {
  erro: unknown;
  aoTentarNovamente: () => void;
  carregando?: boolean;
}

/** Estado de falha do cardápio, com o motivo e um caminho de saída. */
export function CatalogError({ erro, aoTentarNovamente, carregando }: CatalogErrorProps) {
  const offline = erro instanceof ApiError && erro.offline;

  const mensagem =
    erro instanceof ApiError
      ? erro.message
      : 'Não conseguimos carregar o cardápio agora.';

  return (
    <section
      role="alert"
      className="container flex max-w-md flex-col items-center gap-4 py-16 text-center"
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted">
        <WifiOff className="h-8 w-8 text-brand-gold" aria-hidden />
      </span>

      <div>
        <h2 className="font-display text-xl font-extrabold">
          {offline ? 'Sem conexão com o servidor' : 'Não foi possível carregar o cardápio'}
        </h2>
        <p className="mt-2 text-sm text-brand-white/60">{mensagem}</p>
      </div>

      <Button onClick={aoTentarNovamente} loading={carregando}>
        <RefreshCw className="h-4 w-4" aria-hidden />
        Tentar novamente
      </Button>
    </section>
  );
}
