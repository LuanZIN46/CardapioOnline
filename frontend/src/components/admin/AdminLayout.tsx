import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { ExternalLink, LogOut } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useStoreSettings } from '@/hooks/use-catalog';
import { useAuthStore } from '@/store/auth.store';

/** Só entra quem tem sessão. O backend valida de novo em cada requisição. */
export function RotaProtegida() {
  const token = useAuthStore((state) => state.token);

  if (!token) return <Navigate to="/admin/login" replace />;

  return <AdminLayout />;
}

const ABAS = [
  { para: '/admin/produtos', rotulo: 'Produtos' },
  { para: '/admin/categorias', rotulo: 'Categorias' },
];

function AdminLayout() {
  const navigate = useNavigate();
  const { settings } = useStoreSettings();
  const usuario = useAuthStore((state) => state.usuario);
  const sair = useAuthStore((state) => state.sair);

  const encerrar = () => {
    sair();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-surface-border bg-brand-black/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate font-display text-base font-extrabold">Gerenciar cardápio</p>
            <p className="truncate text-xs text-brand-white/45">
              {settings.name}
              {usuario ? ` · ${usuario.nome}` : ''}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-brand-white/60 transition-colors hover:text-brand-gold"
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Ver cardápio</span>
            </a>

            <button
              type="button"
              onClick={encerrar}
              className="flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-brand-white/60 transition-colors hover:text-red-400"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        <nav className="container flex gap-1 pb-2" aria-label="Seções do painel">
          {ABAS.map((aba) => (
            <NavLink
              key={aba.para}
              to={aba.para}
              className={({ isActive }) =>
                cn(
                  'rounded-xl px-4 py-2 text-sm font-semibold transition-colors',
                  isActive
                    ? 'bg-brand-gold text-brand-black'
                    : 'text-brand-white/60 hover:bg-surface-muted hover:text-brand-white',
                )
              }
            >
              {aba.rotulo}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="container py-6 pb-20">
        <Outlet />
      </main>
    </div>
  );
}
