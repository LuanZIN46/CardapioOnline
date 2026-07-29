import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="container flex flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="font-display text-6xl font-black text-brand-gold">404</p>
      <h1 className="font-display text-xl font-bold">Página não encontrada</h1>
      <p className="text-sm text-brand-white/50">
        O link que você acessou não existe ou foi removido do cardápio.
      </p>
      <Link
        to="/"
        className="mt-2 rounded-xl bg-brand-gold px-6 py-3 text-sm font-bold text-brand-black shadow-gold"
      >
        Voltar ao cardápio
      </Link>
    </main>
  );
}
