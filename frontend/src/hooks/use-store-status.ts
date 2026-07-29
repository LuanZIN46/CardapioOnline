import { useEffect, useState } from 'react';
import { getStoreStatus } from '@/lib/opening-hours';
import type { OpeningHour, StoreStatus } from '@/types';

const REFRESH_INTERVAL_MS = 60_000;

export function useStoreStatus(hours: OpeningHour[]): StoreStatus {
  const [status, setStatus] = useState<StoreStatus>(() => getStoreStatus(hours));

  useEffect(() => {
    setStatus(getStoreStatus(hours));
    const timer = window.setInterval(() => setStatus(getStoreStatus(hours)), REFRESH_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [hours]);

  return status;
}
