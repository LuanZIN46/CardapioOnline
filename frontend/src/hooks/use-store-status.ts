import { useEffect, useState } from 'react';
import { getStoreStatus } from '@/lib/opening-hours';
import { useCardapio } from '@/hooks/use-catalog';
import { storeSettings } from '@/data/settings';
import type { StoreStatus } from '@/types';

const REFRESH_INTERVAL_MS = 60_000;

/**
 * Situação da loja: o horário fixo, corrigido pelo fechamento avulso que vem
 * junto do cardápio.
 *
 * O hook busca os dois por conta própria para que cabeçalho, banner e checkout
 * nunca discordem — antes cada tela montava o argumento por fora e bastava
 * esquecer um para a loja aparecer aberta em um canto e fechada no outro.
 */
export function useStoreStatus(): StoreStatus {
  const { data } = useCardapio();
  const hours = storeSettings.openingHours;
  const pausaAte = data?.pausa.fechado ? data.pausa.reabreEm : null;

  const [status, setStatus] = useState<StoreStatus>(() =>
    getStoreStatus(hours, new Date(), pausaAte),
  );

  useEffect(() => {
    const recalcular = () => setStatus(getStoreStatus(hours, new Date(), pausaAte));
    recalcular();

    // O minuto de folga é o que faz o "Aberto" virar "Fechado" às 23h sem
    // ninguém recarregar a página — e a pausa vencer sozinha à meia-noite.
    const timer = window.setInterval(recalcular, REFRESH_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [hours, pausaAte]);

  return status;
}
