import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarClock, Power, Store } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toaster';
import { storeSettings } from '@/data/settings';
import { formatScheduleLine, WEEKDAY_LABELS } from '@/lib/opening-hours';
import { ApiError } from '@/services/api';
import {
  buscarFuncionamento,
  definirFuncionamento,
  type Funcionamento,
} from '@/services/admin.service';

/**
 * Fechar o dia quando dá algum imprevisto.
 *
 * A pausa vale só até a virada da noite: no dia seguinte o cardápio volta a
 * seguir o horário de sempre sem ninguém precisar lembrar de reabrir. Por isso
 * a tela fala em "hoje" o tempo todo — é esse o alcance do botão.
 */
export default function FuncionamentoPage() {
  const queryClient = useQueryClient();

  const funcionamento = useQuery({
    queryKey: ['admin', 'funcionamento'],
    queryFn: buscarFuncionamento,
  });

  const alternar = useMutation({
    mutationFn: (fechado: boolean) => definirFuncionamento(fechado),
    onSuccess: (resultado: Funcionamento) => {
      queryClient.setQueryData(['admin', 'funcionamento'], resultado);
      // O cardápio do cliente carrega esse mesmo estado; sem invalidar, quem já
      // estava com a página aberta continuaria vendo a loja aberta.
      void queryClient.invalidateQueries({ queryKey: ['cardapio'] });
      toast(
        resultado.fechado
          ? 'Fechado por hoje. Amanhã abre no horário normal.'
          : 'Aberto de novo, seguindo o horário normal.',
      );
    },
    onError: (erro) =>
      toast(erro instanceof ApiError ? erro.message : 'Não foi possível salvar.', 'error'),
  });

  const fechado = funcionamento.data?.fechado ?? false;
  const salvando = alternar.isPending;

  return (
    <div className="space-y-5">
      <h1 className="font-display text-xl font-extrabold">Funcionamento</h1>

      {funcionamento.isPending && <p className="text-sm text-brand-white/50">Carregando...</p>}

      {funcionamento.isError && (
        <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
          Não foi possível carregar a situação da loja. Recarregue a página.
        </p>
      )}

      {funcionamento.data && (
        <>
          <section className="card-surface space-y-5 p-6">
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                  fechado ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                }`}
              >
                <Store className="h-6 w-6" />
              </span>

              <div className="min-w-0">
                <p className="font-display text-lg font-extrabold">
                  {fechado ? 'Fechado hoje' : 'Aberto no horário normal'}
                </p>
                <p className="text-sm text-brand-white/55">
                  {fechado
                    ? 'O cardápio avisa que está fechado e não aceita pedidos.'
                    : 'O cardápio abre e fecha sozinho conforme os horários abaixo.'}
                </p>
              </div>
            </div>

            <Button
              variant={fechado ? 'primary' : 'danger'}
              size="lg"
              full
              loading={salvando}
              onClick={() => alternar.mutate(!fechado)}
            >
              <Power className="h-5 w-5" aria-hidden />
              {fechado ? 'Reabrir agora' : 'Fechar por hoje'}
            </Button>

            <p className="flex items-start gap-2 text-sm text-brand-white/55">
              <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" aria-hidden />
              {fechado
                ? 'A pausa termina sozinha na virada da noite. Amanhã a loja volta a abrir no horário de sempre — não precisa mexer aqui de novo.'
                : 'Use quando algum imprevisto impedir de abrir. Vale só para hoje: amanhã o horário normal volta sozinho.'}
            </p>
          </section>

          <section className="card-surface p-6">
            <h2 className="font-display text-base font-extrabold">Horário de sempre</h2>
            <p className="mt-1 text-sm text-brand-white/45">
              Fixo no sistema. O botão acima é a exceção do dia, não substitui esta tabela.
            </p>

            <ul className="mt-4 space-y-1.5">
              {storeSettings.openingHours.map((horario) => (
                <li
                  key={horario.weekday}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <span className="text-brand-white/70">{WEEKDAY_LABELS[horario.weekday]}</span>
                  <span className="font-semibold">{formatScheduleLine(horario)}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
