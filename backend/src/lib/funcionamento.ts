/**
 * Quando a pausa manual do atendimento termina.
 *
 * O servidor do Render roda em UTC, mas o bar fecha e abre no horário de
 * Bastos. Se usássemos o relógio do processo, uma pausa acionada às 22h de
 * terça expiraria às 21h — ainda terça — porque a meia-noite de Londres chega
 * antes. Por isso todo o cálculo passa por `Intl` com o fuso fixo.
 */

const FUSO = 'America/Sao_Paulo';

const formatador = new Intl.DateTimeFormat('en-CA', {
  timeZone: FUSO,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

interface RelogioLocal {
  hora: number;
  minuto: number;
  segundo: number;
}

/** Hora da parede em São Paulo para um instante qualquer. */
function relogioEmSaoPaulo(instante: Date): RelogioLocal {
  const partes = new Map(
    formatador.formatToParts(instante).map((parte) => [parte.type, parte.value]),
  );

  return {
    // Algumas versões do ICU devolvem "24" para a meia-noite com hour12: false.
    hora: Number(partes.get('hour')) % 24,
    minuto: Number(partes.get('minute')),
    segundo: Number(partes.get('second')),
  };
}

/** O instante em que o dia começou, para quem está em São Paulo. */
function inicioDoDia(instante: Date): Date {
  const { hora, minuto, segundo } = relogioEmSaoPaulo(instante);
  const decorridoMs =
    ((hora * 60 + minuto) * 60 + segundo) * 1000 + (instante.getTime() % 1000);
  return new Date(instante.getTime() - decorridoMs);
}

/**
 * A próxima virada do dia — o momento em que a pausa deixa de valer.
 *
 * Somamos 26 horas e voltamos ao início do dia em vez de somar 24 direto: se o
 * Brasil retomar o horário de verão, um dia pode ter 23 ou 25 horas, e a
 * normalização absorve a diferença.
 */
export function fimDaPausa(agora: Date = new Date()): Date {
  const amanha = new Date(inicioDoDia(agora).getTime() + 26 * 60 * 60 * 1000);
  return inicioDoDia(amanha);
}

/** A pausa só vale enquanto o prazo não venceu; depois disso é histórico. */
export function pausaEmVigor(fechadoAte: Date | null, agora: Date = new Date()): boolean {
  return fechadoAte !== null && fechadoAte.getTime() > agora.getTime();
}
