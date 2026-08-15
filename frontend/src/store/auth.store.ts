import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UsuarioAutenticado {
  id: string;
  nome: string;
  email: string;
  cargo: 'ADMIN' | 'GERENTE' | 'ATENDENTE';
  empresaId: string;
}

interface AuthState {
  token?: string;
  usuario?: UsuarioAutenticado;
  entrar: (token: string, usuario: UsuarioAutenticado) => void;
  sair: () => void;
}

/**
 * Sessão do painel administrativo.
 *
 * O token é guardado no localStorage para o administrador não precisar logar a
 * cada aba. A empresa NÃO é lida daqui para consultar dados: quem manda é o
 * `empresaId` de dentro do JWT, validado no backend.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: undefined,
      usuario: undefined,
      entrar: (token, usuario) => set({ token, usuario }),
      sair: () => set({ token: undefined, usuario: undefined }),
    }),
    { name: 'bar-do-pardal:auth' },
  ),
);

/** Lido pelo interceptor do Axios sem depender do ciclo de render do React. */
export function tokenAtual(): string | undefined {
  return useAuthStore.getState().token;
}
