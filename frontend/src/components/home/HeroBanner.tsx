import { motion } from 'framer-motion';
import { Bike, Clock, MessageCircle, ShoppingBasket } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProductImage } from '@/components/ui/ProductImage';
import { formatCurrency, formatMinutesRange } from '@/lib/format';
import { buildContactUrl } from '@/services/whatsapp.service';
import type { StoreSettings, StoreStatus } from '@/types';

interface HeroBannerProps {
  settings: StoreSettings;
  status: StoreStatus;
}

export function HeroBanner({ settings, status }: HeroBannerProps) {
  return (
    <section className="relative">
      <div className="relative h-44 w-full overflow-hidden sm:h-72 lg:h-80">
        <ProductImage
          src={settings.bannerUrl}
          alt={`Fachada do ${settings.name}`}
          eager
          // O enquadramento puxa para baixo para mostrar a fachada, não o céu.
          className="h-full w-full object-[center_88%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/65 to-brand-black/20" />
      </div>

      <div className="container relative -mt-16 pb-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="card-surface p-5 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                {settings.name}
              </h1>
              <p className="mt-1 text-sm text-brand-white/60">{settings.tagline}</p>
            </div>

            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                status.isOpen
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-red-500/15 text-red-400'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${status.isOpen ? 'bg-emerald-400' : 'bg-red-400'}`}
                aria-hidden
              />
              {status.isOpen ? 'Aberto' : 'Fechado'}
            </span>
          </div>

          <p className="mt-2 text-sm font-medium text-brand-white/70">{status.message}</p>

          <dl className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
            <InfoTile
              icon={<Clock className="h-4 w-4" />}
              label="Entrega"
              value={formatMinutesRange(settings.deliveryTimeMinutes)}
            />
            <InfoTile
              icon={<Bike className="h-4 w-4" />}
              label="Taxa"
              value={formatCurrency(settings.deliveryFee)}
            />
            <InfoTile
              icon={<ShoppingBasket className="h-4 w-4" />}
              label="Mínimo"
              value={formatCurrency(settings.minimumOrder)}
            />
          </dl>

          <Button
            variant="whatsapp"
            size="lg"
            full
            className="mt-4"
            onClick={() => window.open(buildContactUrl(settings), '_blank', 'noopener')}
          >
            <MessageCircle className="h-5 w-5" aria-hidden />
            Falar no WhatsApp
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

interface InfoTileProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}

function InfoTile({ icon, label, value, className }: InfoTileProps) {
  return (
    <div
      className={`rounded-xl border border-surface-border bg-surface-muted px-2.5 py-2 sm:p-3 ${className ?? ''}`}
    >
      <dt className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-brand-white/45 sm:text-[11px]">
        <span className="shrink-0 text-brand-gold" aria-hidden>
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </dt>
      <dd className="mt-0.5 text-sm font-bold sm:text-base">{value}</dd>
    </div>
  );
}
