import { Link } from 'react-router-dom';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useStoreSettings } from '@/hooks/use-catalog';
import { buildContactUrl } from '@/services/whatsapp.service';

export default function OrderSentPage() {
  const { settings } = useStoreSettings();

  return (
    <main className="container flex max-w-lg flex-col items-center justify-center gap-5 py-20 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15">
        <CheckCircle2 className="h-10 w-10 text-emerald-400" aria-hidden />
      </span>

      <div>
        <h1 className="font-display text-2xl font-extrabold">Pedido enviado!</h1>
        <p className="mt-2 text-sm text-brand-white/60">
          Abrimos o WhatsApp do {settings.name} com todos os detalhes do seu pedido. Envie a mensagem
          para confirmarmos o preparo.
        </p>
      </div>

      <div className="flex w-full flex-col gap-2">
        <Button
          variant="whatsapp"
          size="lg"
          full
          onClick={() => window.open(buildContactUrl(settings), '_blank', 'noopener')}
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
          Abrir WhatsApp novamente
        </Button>
        <Link
          to="/"
          className="flex h-14 w-full items-center justify-center rounded-xl border border-surface-border bg-surface-raised text-sm font-semibold transition-colors hover:border-brand-gold/60 hover:text-brand-gold"
        >
          Voltar ao cardápio
        </Link>
      </div>
    </main>
  );
}
