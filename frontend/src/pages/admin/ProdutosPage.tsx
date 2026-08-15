import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ProductImage } from '@/components/ui/ProductImage';
import { toast } from '@/components/ui/Toaster';
import { formatCurrency, maskCurrency, parseCurrencyToCents } from '@/lib/format';
import { ApiError, urlDaImagem } from '@/services/api';
import {
  atualizarProduto,
  criarProduto,
  enviarFoto,
  excluirProduto,
  listarCategorias,
  listarProdutos,
  type ProdutoAdmin,
} from '@/services/admin.service';

export default function ProdutosPage() {
  const queryClient = useQueryClient();
  const [emEdicao, setEmEdicao] = useState<ProdutoAdmin | null>(null);
  const [criando, setCriando] = useState(false);

  const produtos = useQuery({ queryKey: ['admin', 'produtos'], queryFn: listarProdutos });

  /** Painel e cardápio público leem o mesmo banco: recarrega os dois. */
  const recarregar = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'produtos'] });
    void queryClient.invalidateQueries({ queryKey: ['cardapio'] });
  };

  const alternar = useMutation({
    mutationFn: (produto: ProdutoAdmin) =>
      atualizarProduto(produto.id, { disponivel: !produto.disponivel }),
    onSuccess: (_, produto) => {
      recarregar();
      toast(produto.disponivel ? 'Produto desativado.' : 'Produto ativado.');
    },
    onError: (erro) => toast(mensagem(erro), 'error'),
  });

  const remover = useMutation({
    mutationFn: (id: string) => excluirProduto(id),
    onSuccess: (resultado) => {
      recarregar();
      toast(resultado.mensagem, resultado.removido ? 'success' : 'info');
    },
    onError: (erro) => toast(mensagem(erro), 'error'),
  });

  const excluir = (produto: ProdutoAdmin) => {
    if (!window.confirm(`Excluir "${produto.nome}"?`)) return;
    remover.mutate(produto.id);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-xl font-extrabold">Produtos</h1>
        <Button onClick={() => setCriando(true)}>
          <Plus className="h-4 w-4" aria-hidden />
          Novo produto
        </Button>
      </div>

      {produtos.isPending && <p className="text-sm text-brand-white/50">Carregando...</p>}

      {produtos.isError && (
        <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {mensagem(produtos.error)}
        </p>
      )}

      <ul className="space-y-2">
        {produtos.data?.map((produto) => (
          <li key={produto.id} className="card-surface flex items-center gap-3 p-3">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-muted">
              <ProductImage
                src={urlDaImagem(produto.imagem)}
                alt={produto.nome}
                className="h-full w-full"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{produto.nome}</p>
              <p className="truncate text-xs text-brand-white/45">
                {produto.categoria?.nome ?? 'Sem categoria'}
                {!produto.disponivel && ' · indisponível'}
              </p>
              <p className="mt-0.5 font-display text-sm font-bold text-brand-gold">
                {formatCurrency(produto.preco)}
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center">
              <Button variant="secondary" onClick={() => setEmEdicao(produto)}>
                <Pencil className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">Editar</span>
              </Button>
              <Button
                variant="secondary"
                loading={alternar.isPending && alternar.variables?.id === produto.id}
                onClick={() => alternar.mutate(produto)}
              >
                {produto.disponivel ? (
                  <EyeOff className="h-4 w-4" aria-hidden />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden />
                )}
                <span className="hidden sm:inline">
                  {produto.disponivel ? 'Desativar' : 'Ativar'}
                </span>
              </Button>
              <button
                type="button"
                aria-label={`Excluir ${produto.nome}`}
                onClick={() => excluir(produto)}
                className="flex h-11 w-11 items-center justify-center rounded-xl text-brand-white/50 transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {produtos.data?.length === 0 && (
        <p className="rounded-xl border border-surface-border bg-surface-muted px-4 py-8 text-center text-sm text-brand-white/50">
          Nenhum produto cadastrado ainda.
        </p>
      )}

      <FormularioProduto
        aberto={criando || emEdicao !== null}
        produto={emEdicao}
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
  produto: ProdutoAdmin | null;
  aoFechar: () => void;
  aoSalvar: () => void;
}

function FormularioProduto({ aberto, produto, aoFechar, aoSalvar }: FormularioProps) {
  const categorias = useQuery({ queryKey: ['admin', 'categorias'], queryFn: listarCategorias });
  const seletorFoto = useRef<HTMLInputElement>(null);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [disponivel, setDisponivel] = useState(true);
  const [foto, setFoto] = useState<File | null>(null);
  const [previa, setPrevia] = useState('');
  const [chave, setChave] = useState('');

  const identidade = produto?.id ?? 'novo';
  if (chave !== identidade) {
    setChave(identidade);
    setNome(produto?.nome ?? '');
    setDescricao(produto?.descricao ?? '');
    setPreco(produto ? maskCurrency(String(produto.preco)) : '');
    setCategoriaId(produto?.categoria?.id ?? '');
    setDisponivel(produto?.disponivel ?? true);
    setFoto(null);
    setPrevia(urlDaImagem(produto?.imagem));
  }

  const escolherFoto = (arquivo: File | null) => {
    if (!arquivo) return;
    setFoto(arquivo);
    setPrevia(URL.createObjectURL(arquivo));
  };

  const salvar = useMutation({
    mutationFn: async () => {
      const dados = {
        nome: nome.trim(),
        descricao: descricao.trim() || null,
        preco: parseCurrencyToCents(preco),
        disponivel,
        categoriaId: categoriaId || null,
      };

      const salvo = produto
        ? await atualizarProduto(produto.id, dados)
        : await criarProduto(dados);

      // A foto vai numa segunda chamada: o produto precisa existir para receber o arquivo.
      if (foto) await enviarFoto(salvo.id, foto);

      return salvo;
    },
    onSuccess: () => {
      toast(produto ? 'Produto atualizado.' : 'Produto criado.');
      aoSalvar();
      aoFechar();
    },
    onError: (erro) => toast(mensagem(erro), 'error'),
  });

  const precoEmCentavos = parseCurrencyToCents(preco);
  const podeSalvar = nome.trim().length > 0 && precoEmCentavos > 0;

  return (
    <Modal
      open={aberto}
      onClose={aoFechar}
      title={produto ? 'Editar produto' : 'Novo produto'}
      footer={
        <div className="flex gap-2">
          <Button variant="secondary" full onClick={aoFechar}>
            Cancelar
          </Button>
          <Button full loading={salvar.isPending} disabled={!podeSalvar} onClick={() => salvar.mutate()}>
            Salvar
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-muted">
            <ProductImage src={previa} alt={nome || 'Produto'} className="h-full w-full" />
          </div>

          <div>
            <Button variant="secondary" onClick={() => seletorFoto.current?.click()}>
              <ImagePlus className="h-4 w-4" aria-hidden />
              {previa ? 'Trocar foto' : 'Escolher foto'}
            </Button>
            <p className="mt-1 text-xs text-brand-white/40">JPEG, PNG ou WebP até 5 MB.</p>
          </div>

          <input
            ref={seletorFoto}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(evento) => escolherFoto(evento.target.files?.[0] ?? null)}
          />
        </div>

        <Input
          label="Nome"
          required
          placeholder="Ex.: X-Burger"
          value={nome}
          onChange={(evento) => setNome(evento.target.value)}
        />

        <Textarea
          label="Descrição"
          placeholder="Ingredientes e detalhes que aparecem no cardápio"
          maxLength={500}
          value={descricao}
          onChange={(evento) => setDescricao(evento.target.value)}
        />

        <Input
          label="Preço"
          required
          inputMode="numeric"
          placeholder="0,00"
          hint={precoEmCentavos > 0 ? `Será exibido como ${formatCurrency(precoEmCentavos)}` : undefined}
          value={preco}
          onChange={(evento) => setPreco(maskCurrency(evento.target.value))}
        />

        <div>
          <label
            htmlFor="categoria-produto"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-white/50"
          >
            Categoria
          </label>
          <select
            id="categoria-produto"
            value={categoriaId}
            onChange={(evento) => setCategoriaId(evento.target.value)}
            className="h-12 w-full rounded-xl border border-surface-border bg-surface-muted px-4 text-sm text-brand-white outline-none transition-colors focus:border-brand-gold"
          >
            <option value="">Sem categoria</option>
            {categorias.data?.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-surface-border bg-surface-muted px-4 py-3">
          <input
            type="checkbox"
            checked={disponivel}
            onChange={(evento) => setDisponivel(evento.target.checked)}
            className="h-5 w-5 accent-brand-gold"
          />
          <span className="text-sm">
            <span className="font-semibold">Disponível no cardápio</span>
            <span className="block text-xs text-brand-white/45">
              Desmarque para esconder o produto sem excluí-lo.
            </span>
          </span>
        </label>
      </div>
    </Modal>
  );
}

function mensagem(erro: unknown): string {
  return erro instanceof ApiError ? erro.message : 'Algo deu errado. Tente novamente.';
}
