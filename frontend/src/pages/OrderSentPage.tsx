import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Download, Eye, MessageCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toaster';
import { useStoreSettings } from '@/hooks/use-catalog';
import { formatCurrency } from '@/lib/format';
import {
  abrirPdfEmNovaAba,
  baixarPdf,
  canalDisponivel,
  compartilharPdf,
  montarResumoDaConversa,
  urlDaConversa,
} from '@/services/pdf/orderShare.service';
import { useLastOrderStore } from '@/store/last-order.store';

export default function OrderSentPage() {
  const navigate = useNavigate();
  const { settings } = useStoreSettings();
  const order = useLastOrderStore((state) => state.order);
  const pdf = useLastOrderStore((state) => state.pdf);
  const [enviando, setEnviando] = useState(false);

  // Recarregar a página descarta o Blob, então não há o que compartilhar.
  useEffect(() => {
    if (!order || !pdf) navigate('/', { replace: true });
  }, [order, pdf, navigate]);

  const canal = useMemo(() => (pdf ? canalDisponivel(pdf.file) : null), [pdf]);

  const resumo = useMemo(() => {
    if (!order) return '';
    const { pedido } = order;
    return montarResumoDaConversa({
      orderCode: String(pedido.numero).padStart(3, '0'),
      clienteNome: pedido.cliente,
      quantidadeItens: pedido.itens.reduce((total, item) => total + item.quantidade, 0),
      total: formatCurrency(pedido.valorTotal),
      tipo: pedido.tipo === 'ENTREGA' ? 'delivery' : 'pickup',
    });
  }, [order]);

  if (!order || !pdf) return null;

  const podeAnexar = canal === 'compartilhar-arquivo';
  const numeroComanda = String(order.pedido.numero).padStart(3, '0');
  const totalItens = order.pedido.itens.reduce((total, item) => total + item.quantidade, 0);

  const enviarPeloWhatsApp = async () => {
    setEnviando(true);
    try {
      const resultado = await compartilharPdf(pdf, settings, resumo);

      if (resultado === 'compartilhado') {
        toast('Pedido compartilhado!');
        return;
      }

      if (resultado === 'cancelado') return;

      // Sem suporte a anexo: baixa o arquivo e abre a conversa para o cliente anexar.
      baixarPdf(pdf);
      window.open(urlDaConversa(settings, resumo), '_blank', 'noopener');
      toast('PDF baixado. Anexe-o na conversa do WhatsApp.', 'info');
    } catch (erro) {
      console.error('[compartilhar] falhou', erro);
      toast('Não foi possível compartilhar. Baixe o PDF e envie manualmente.', 'error');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="container flex max-w-lg flex-col items-center gap-5 py-12 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15">
        <CheckCircle2 className="h-10 w-10 text-emerald-400" aria-hidden />
      </span>

      <div>
        <h1 className="font-display text-2xl font-extrabold">Pedido pronto!</h1>
        <p className="mt-2 text-sm text-brand-white/60">
          Seu pedido foi registrado como{' '}
          <strong className="text-brand-gold">comanda #{numeroComanda}</strong>. Agora envie o
          comprovante para o WhatsApp do {settings.name} para confirmarmos o preparo.
        </p>
      </div>

      <div className="card-surface w-full space-y-1.5 p-4 text-left text-sm">
        <Linha rotulo="Cliente" valor={order.pedido.cliente} />
        <Linha rotulo="Itens" valor={String(totalItens)} />
        <Linha
          rotulo="Tipo"
          valor={order.pedido.tipo === 'ENTREGA' ? 'Entrega' : 'Retirada no balcão'}
        />
        <div className="flex justify-between border-t border-surface-border pt-2 font-display text-base font-extrabold">
          <span>Total</span>
          <span className="text-brand-gold">{formatCurrency(order.pedido.valorTotal)}</span>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2">
        <Button
          variant="whatsapp"
          size="lg"
          full
          loading={enviando}
          onClick={enviarPeloWhatsApp}
        >
          {podeAnexar ? (
            <Share2 className="h-5 w-5" aria-hidden />
          ) : (
            <MessageCircle className="h-5 w-5" aria-hidden />
          )}
          {podeAnexar ? 'Enviar PDF no WhatsApp' : 'Baixar PDF e abrir WhatsApp'}
        </Button>

        <div className="flex gap-2">
          <Button variant="secondary" full onClick={() => baixarPdf(pdf)}>
            <Download className="h-4 w-4" aria-hidden />
            Baixar PDF
          </Button>
          <Button variant="secondary" full onClick={() => abrirPdfEmNovaAba(pdf)}>
            <Eye className="h-4 w-4" aria-hidden />
            Visualizar
          </Button>
        </div>

        {!podeAnexar && (
          <p className="rounded-xl border border-surface-border bg-surface-muted px-4 py-3 text-left text-xs text-brand-white/55">
            Neste dispositivo o navegador não permite anexar arquivos automaticamente. Vamos baixar o
            PDF e abrir a conversa — basta anexá-lo no WhatsApp. Pelo celular o anexo vai junto
            automaticamente.
          </p>
        )}

        <Link
          to="/"
          className="mt-1 flex h-12 w-full items-center justify-center rounded-xl text-sm font-semibold text-brand-white/60 transition-colors hover:text-brand-gold"
        >
          Voltar ao cardápio
        </Link>
      </div>
    </main>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex justify-between gap-4 text-brand-white/60">
      <span>{rotulo}</span>
      <span className="font-semibold text-brand-white">{valor}</span>
    </div>
  );
}
