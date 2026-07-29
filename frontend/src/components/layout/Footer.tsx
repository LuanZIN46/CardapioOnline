import { Clock, MapPin, Phone } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { FacebookIcon, InstagramIcon } from '@/components/ui/SocialIcons';
import { WEEKDAY_LABELS, formatScheduleLine } from '@/lib/opening-hours';
import type { StoreSettings, Weekday } from '@/types';

interface FooterProps {
  settings: StoreSettings;
}

export function Footer({ settings }: FooterProps) {
  const today = new Date().getDay() as Weekday;

  return (
    <footer className="mt-16 border-t border-surface-border bg-surface-raised">
      <div className="container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-3">
          <Logo src={settings.logoUrl} name={settings.name} className="h-16 w-16 text-xl" />
          <h2 className="font-display text-lg font-bold text-brand-gold">{settings.name}</h2>
          <p className="text-sm text-brand-white/60">{settings.tagline}</p>
          <div className="flex gap-3 pt-1">
            {settings.instagram && (
              <a
                href={settings.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="rounded-lg border border-surface-border p-2 text-brand-white/70 transition-colors hover:border-brand-gold hover:text-brand-gold"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
            )}
            {settings.facebook && (
              <a
                href={settings.facebook}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="rounded-lg border border-surface-border p-2 text-brand-white/70 transition-colors hover:border-brand-gold hover:text-brand-gold"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-brand-white/80">
            <Clock className="h-4 w-4 text-brand-gold" aria-hidden />
            Horários
          </h3>
          <ul className="space-y-1.5 text-sm">
            {settings.openingHours.map((schedule) => (
              <li
                key={schedule.weekday}
                className={`flex justify-between gap-4 ${
                  schedule.weekday === today ? 'font-semibold text-brand-gold' : 'text-brand-white/60'
                }`}
              >
                <span>{WEEKDAY_LABELS[schedule.weekday]}</span>
                <span>{formatScheduleLine(schedule)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-brand-white/80">Contato</h3>
          <p className="flex items-start gap-2 text-sm text-brand-white/60">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" aria-hidden />
            {settings.address}
          </p>
          <p className="flex items-center gap-2 text-sm text-brand-white/60">
            <Phone className="h-4 w-4 shrink-0 text-brand-gold" aria-hidden />
            {settings.phone}
          </p>
        </div>
      </div>

      <div className="border-t border-surface-border py-5 text-center text-xs text-brand-white/40">
        © {new Date().getFullYear()} {settings.name}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
