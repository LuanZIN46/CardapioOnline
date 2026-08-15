import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toaster';
import { ApiError } from '@/services/api';
import {
  atualizarCategoria,
  criarCategoria,
  excluirCategoria,
  listarCategorias,
  type CategoriaAdmin,
} from '@/services/admin.service';

export default function CategoriasPage() {
  const queryClient = useQueryClient();
  const [emEdicao, setEmEdicao] = useState<CategoriaAdmin | null>(null);
  const [criando, setCriando] = useState(false);

  const categorias = useQuery({ queryKey: ['admin', 'categorias'], queryFn: listarCategorias });

  /** Recarrega o painel e o cardápio público, que compartilham o mesmo dado. */
  const recarregar = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'categorias'] });
    void queryClient.invalidateQueries({ queryKey: ['cardapio'] });
  };

  const alternar = useMutation({
    mutationFn: (categoria: CategoriaAdmin) =>
      atualizarCategoria(categoria.id, { ativo: !categoria.ativo }),
    onSuccess: (_, categoria) => {
      recarregar();
      toast(categoria.ativo ? 'Categoria desativada.' : 'Categoria ativada.');
    },
    onError: (erro) => toast(mensagem(erro), 'error'),
  });

  const remover = useMutation({
    mutationFn: (id: string) => excluirCategoria(id),
    onSuccess: () => {
      recarregar();
      toast('Categoria excluída.');
    },
    onError: (erro) => toast(mensagem(erro), 'error'),
  });

  const excluir = (categoria: CategoriaAdmin) => {
    const total = categoria._count?.produtos ?? 0;
    if (total > 0) {
      toast(`"${categoria.nome}" tem ${total} produto(s). Mova-os antes de excluir.`, 'error');
      return;
    }
    if (!window.confirm(`Excluir a categoria "${categoria.nome}"?`)) return;
    remover.mutate(categoria.id);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-xl font-extrabold">Categorias</h1>
        <Button onClick={() => setCriando(true)}>
          <Plus className="h-4 w-4" aria-hidden />
          Nova categoria
        </Button>
      </div>

      {categorias.isPending && <p className="text-sm text-brand-white/50">Carregando...</p>}

      {categorias.isError && (
        <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {mensagem(categorias.error)}
        </p>
      )}

      <ul className="space-y-2">
        {categorias.data?.map((categoria) => (
          <li
            key={categoria.id}
            className="card-surface flex flex-wrap items-center gap-3 p-4 sm:flex-nowrap"
          >
            <span aria-hidden className="text-2xl">
              {categoria.icone ?? '🍽️'}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{categoria.nome}</p>
              <p className="text-xs text-brand-white/45">
                {categoria._count?.produtos ?? 0} produto(s)
                {!categoria.ativo && ' · oculta no cardápio'}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <Button variant="secondary" onClick={() => setEmEdicao(categoria)}>
                <Pencil className="h-4 w-4" aria-hidden />
                Editar
              </Button>
              <Button
                variant="secondary"
                loading={alternar.isPending && alternar.variables?.id === categoria.id}
                onClick={() => alternar.mutate(categoria)}
              >
                {categoria.ativo ? (
                  <EyeOff className="h-4 w-4" aria-hidden />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden />
                )}
                {categoria.ativo ? 'Desativar' : 'Ativar'}
              </Button>
              <button
                type="button"
                aria-label={`Excluir ${categoria.nome}`}
                onClick={() => excluir(categoria)}
                className="flex h-11 w-11 items-center justify-center rounded-xl text-brand-white/50 transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {categorias.data?.length === 0 && (
        <p className="rounded-xl border border-surface-border bg-surface-muted px-4 py-8 text-center text-sm text-brand-white/50">
          Nenhuma categoria cadastrada ainda.
        </p>
      )}

      <FormularioCategoria
        aberto={criando || emEdicao !== null}
        categoria={emEdicao}
        aoFechar={() => {
          setCriando(false);
          setEmEdicao(null);
        }}
        aoSalvar={recarregar}
      />
    </div>
  );
}

interface FormularioProps {
  aberto: boolean;
  categoria: CategoriaAdmin | null;
  aoFechar: () => void;
  aoSalvar: () => void;
}

function FormularioCategoria({ aberto, categoria, aoFechar, aoSalvar }: FormularioProps) {
  const [nome, setNome] = useState('');
  const [icone, setIcone] = useState('');
  const [chave, setChave] = useState('');

  // Recarrega os campos ao trocar de categoria sem depender de efeito.
  const identidade = categoria?.id ?? 'nova';
  if (chave !== identidade) {
    setChave(identidade);
    setNome(categoria?.nome ?? '');
    setIcone(categoria?.icone ?? '');
  }

  const salvar = useMutation({
    mutationFn: () => {
      const dados = { nome: nome.trim(), icone: icone.trim() || null };
      return categoria ? atualizarCategoria(categoria.id, dados) : criarCategoria(dados);
    },
    onSuccess: () => {
      toast(categoria ? 'Categoria atualizada.' : 'Categoria criada.');
      aoSalvar();
      aoFechar();
    },
    onError: (erro) => toast(mensagem(erro), 'error'),
  });

  return (
    <Modal
      open={aberto}
      onClose={aoFechar}
      title={categoria ? 'Editar categoria' : 'Nova categoria'}
      footer={
        <div className="flex gap-2">
          <Button variant="secondary" full onClick={aoFechar}>
            Cancelar
          </Button>
          <Button
            full
            loading={salvar.isPending}
            disabled={nome.trim().length === 0}
            onClick={() => salvar.mutate()}
          >
            Salvar
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Input
          label="Nome"
          required
          placeholder="Ex.: Hambúrgueres"
          value={nome}
          onChange={(evento) => setNome(evento.target.value)}
        />
        <Input
          label="Ícone"
          hint="Um emoji que aparece no cardápio. Ex.: 🍔"
          placeholder="🍔"
          maxLength={4}
          value={icone}
          onChange={(evento) => setIcone(evento.target.value)}
        />
      </div>
    </Modal>
  );
}

function mensagem(erro: unknown): string {
  return erro instanceof ApiError ? erro.message : 'Algo deu errado. Tente novamente.';
}
