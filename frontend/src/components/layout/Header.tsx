import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useCartCount } from '@/hooks/use-cart';
import { useUiStore } from '@/store/ui.store';
import type { StoreSettings, StoreStatus } from '@/types';

interface HeaderProps {
  settings: StoreSettings;
  status: StoreStatus;
}

export function Header({ settings, status }: HeaderProps) {
  const itemCount = useCartCount();
  const openCart = useUiStore((state) => state.openCart);

  return (
    <header className="sticky top-0 z-40 border-b border-surface-border bg-brand-black/90 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <Logo
            src={settings.logoMarkUrl}
            name={settings.name}
            className="h-10 w-10 shrink-0 border border-brand-gold/30 text-lg"
          />
          <span className="min-w-0">
            <span className="block truncate font-display text-base font-bold leading-tight">
              {settings.name}
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-brand-white/50">
              <span
                className={`h-1.5 w-1.5 rounded-full ${status.isOpen ? 'bg-emerald-400' : 'bg-red-400'}`}
                aria-hidden
              />
              {status.isOpen ? 'Aberto agora' : 'Fechado'}
            </span>
          </span>
        </Link>

        <button
          type="button"
          onClick={openCart}
          aria-label={`Abrir carrinho com ${itemCount} ${itemCount === 1 ? 'item' : 'itens'}`}
          className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-surface-border bg-surface-raised transition-colors hover:border-brand-gold/60"
        >
          <ShoppingBag className="h-5 w-5 text-brand-gold" aria-hidden />
          {itemCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-gold px-1 text-[11px] font-bold text-brand-black">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
