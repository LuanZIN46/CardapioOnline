import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
import { useStoreSettings } from '@/hooks/use-catalog';
import { ApiError } from '@/services/api';
import { login } from '@/services/admin.service';
import { useAuthStore } from '@/store/auth.store';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { settings } = useStoreSettings();
  const entrar = useAuthStore((state) => state.entrar);

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const onSubmit = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setErro('');
    setEnviando(true);

    try {
      const resposta = await login(email.trim(), senha);
      entrar(resposta.token, resposta.usuario);
      navigate('/admin/produtos', { replace: true });
    } catch (falha) {
      setErro(
        falha instanceof ApiError ? falha.message : 'Não foi possível entrar. Tente novamente.',
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo src={settings.logoMarkUrl} name={settings.name} className="h-16 w-16 text-xl" />
          <div>
            <h1 className="font-display text-xl font-extrabold">Gerenciar cardápio</h1>
            <p className="mt-1 text-sm text-brand-white/50">{settings.name}</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="card-surface space-y-4 p-6" noValidate>
          <Input
            label="E-mail"
            type="email"
            required
            autoComplete="email"
            placeholder="voce@estabelecimento.com.br"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
          />

          <Input
            label="Senha"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Sua senha"
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
          />

          {erro && (
            <p role="alert" className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {erro}
            </p>
          )}

          <Button type="submit" size="lg" full loading={enviando}>
            <LogIn className="h-5 w-5" aria-hidden />
            Entrar
          </Button>
        </form>
      </div>
    </main>
  );
}
