import { jsPDF } from 'jspdf';
import { formatCurrency } from '@/lib/format';
import type { PedidoSalvo } from '../order.service';
import type { StoreSettings } from '@/types';

/**
 * A comanda é montada a partir do pedido que o servidor gravou — nunca a
 * partir do carrinho local. Assim o papel mostra exatamente o que está no banco.
 */
export interface OrderDocument {
  pedido: PedidoSalvo;
  settings: StoreSettings;
}

export interface GeneratedOrderPdf {
  blob: Blob;
  file: File;
  fileName: string;
  /** URL temporária para pré-visualizar ou baixar. Libere com `revokeOrderPdf`. */
  objectUrl: string;
}

const PAGAMENTO_LABEL: Record<PedidoSalvo['formaPagamento'], string> = {
  PIX: 'PIX',
  CARTAO: 'Cartão',
  DINHEIRO: 'DINHEIRO',
};

/** Número da comanda com zeros à esquerda, como na notinha do balcão. */
function numeroComanda(numero: number): string {
  return String(numero).padStart(3, '0');
}

/**
 * Bobina térmica de 80mm (papel 80x30: 80mm de largura por 30m de rolo).
 *
 * A cabeça de impressão de uma impressora de 80mm cobre ~72mm centralizados,
 * ou seja, de 4mm a 76mm. As margens laterais de 5mm mantêm todo o conteúdo
 * dentro dessa faixa em qualquer modelo, sem risco de cortar a coluna de valores.
 *
 * A altura é calculada pelo conteúdo, então a página termina logo após o rodapé
 * e não sobra papel em branco no arquivo.
 */
const LARGURA = 80;
const MARGEM = 5;
/** Folga no topo e no fim da bobina — o suficiente para o corte, sem desperdício. */
const MARGEM_TOPO = 3.5;
const MARGEM_FIM = 3;
const DIREITA = LARGURA - MARGEM;
const LARGURA_UTIL = LARGURA - MARGEM * 2;

/* Colunas da tabela, alinhadas à direita a partir da margem esquerda. */
const COL_QUANT = MARGEM + 32;
const COL_UNIT = MARGEM + 52;
const COL_TOTAL = DIREITA;

const PRETO: [number, number, number] = [0, 0, 0];

/**
 * Gera a comanda do pedido em PDF, no formato da notinha do bar.
 *
 * O layout é desenhado duas vezes: a primeira apenas mede a altura final,
 * a segunda desenha de verdade numa página do tamanho exato. Sem isso a
 * bobina sairia com sobra em branco no fim.
 */
export async function generateOrderPDF(order: OrderDocument): Promise<GeneratedOrderPdf> {
  const medidor = new jsPDF({ unit: 'mm', format: [LARGURA, 1000] });
  const alturaFinal = desenhar(medidor, order) + MARGEM_FIM;

  const doc = new jsPDF({ unit: 'mm', format: [LARGURA, alturaFinal], compress: true });
  desenhar(doc, order);

  const blob = doc.output('blob');
  const fileName = `pedido-${numeroComanda(order.pedido.numero)}.pdf`;
  const file = new File([blob], fileName, { type: 'application/pdf' });

  return { blob, file, fileName, objectUrl: URL.createObjectURL(blob) };
}

export function revokeOrderPdf(pdf: GeneratedOrderPdf): void {
  URL.revokeObjectURL(pdf.objectUrl);
}

/** Desenha a comanda inteira e devolve a posição vertical final. */
function desenhar(doc: jsPDF, order: OrderDocument): number {
  doc.setTextColor(...PRETO);
  let y = MARGEM_TOPO + 3;

  y = cabecalho(doc, order, y);
  y = identificacao(doc, order, y);
  y = itens(doc, order, y);
  y = totais(doc, order, y);
  y = pagamento(doc, order, y);
  y = observacoes(doc, order, y);
  y = rodape(doc, y);

  return y;
}

/* ------------------------------------------------------------------ blocos */

function cabecalho(doc: jsPDF, order: OrderDocument, yInicial: number): number {
  let y = texto(doc, order.settings.name, yInicial, {
    negrito: true,
    tamanho: 13,
    alinhamento: 'centro',
  });

  y = texto(doc, order.settings.address, y + 1, { tamanho: 7.5, alinhamento: 'centro' });
  y = texto(doc, `Tel: ${order.settings.phone}`, y, { tamanho: 7.5, alinhamento: 'centro' });

  return divisoria(doc, y + 2);
}

function identificacao(doc: jsPDF, order: OrderDocument, yInicial: number): number {
  const { pedido } = order;

  let y = texto(doc, `*** COMANDA: ${numeroComanda(pedido.numero)} ***`, yInicial + 3.5, {
    negrito: true,
    tamanho: 11,
    alinhamento: 'centro',
  });

  y = divisoria(doc, y + 1.5) + 3.5;

  const criadoEm = new Date(pedido.createdAt);
  const data = criadoEm.toLocaleDateString('pt-BR');
  const hora = criadoEm.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  y = texto(doc, `${data} ${hora}`, y, { tamanho: 8 });
  y = texto(doc, `Cliente: ${pedido.cliente}`, y, { negrito: true, tamanho: 9 });
  y = texto(doc, `Tel: ${pedido.telefone}`, y, { tamanho: 8 });

  y = texto(doc, pedido.tipo === 'ENTREGA' ? 'Entrega' : 'Retirada no balcão', y + 0.5, {
    negrito: true,
    tamanho: 9.5,
  });

  if (pedido.endereco) {
    y = texto(doc, pedido.endereco, y, { tamanho: 8 });
  }

  return divisoria(doc, y + 1.5);
}

function itens(doc: jsPDF, order: OrderDocument, yInicial: number): number {
  let y = yInicial + 3.5;

  // Cabeçalho das colunas, como na comanda do balcão.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('PRODUTO', MARGEM, y);
  doc.text('QUANT.', COL_QUANT, y, { align: 'right' });
  doc.text('UNIT.', COL_UNIT, y, { align: 'right' });
  doc.text('TOTAL', COL_TOTAL, y, { align: 'right' });

  y = divisoria(doc, y + 1.5) + 4;

  for (const item of order.pedido.itens) {
    // Nome em caixa alta e negrito: é o que a cozinha precisa ler de longe.
    y = texto(doc, item.nome, y, { negrito: true, tamanho: 10 });

    const unitario = item.quantidade > 0 ? Math.round(item.subtotal / item.quantidade) : item.preco;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(quantidade(item.quantidade), COL_QUANT, y, { align: 'right' });
    doc.text(valor(unitario), COL_UNIT, y, { align: 'right' });
    doc.text(valor(item.subtotal), COL_TOTAL, y, { align: 'right' });
    y += 4;

    for (const adicional of item.adicionais) {
      const vezes = adicional.quantidade > 1 ? ` (${adicional.quantidade}x)` : '';
      y = texto(doc, `+ ${adicional.nome}${vezes}`, y, {
        negrito: true,
        tamanho: 8.5,
        recuo: 3,
      });
    }

    if (item.observacao) {
      y = texto(doc, `OBS: ${item.observacao}`, y, {
        negrito: true,
        tamanho: 8.5,
        recuo: 3,
      });
    }

    y = divisoria(doc, y + 1) + 3.5;
  }

  return y - 3.5;
}

function totais(doc: jsPDF, order: OrderDocument, yInicial: number): number {
  const { pedido } = order;
  let y = yInicial + 3.5;

  y = linhaValor(doc, 'Subtotal', valor(pedido.subtotal), y);

  if (pedido.tipo === 'ENTREGA') {
    y = linhaValor(
      doc,
      'Taxa de entrega',
      pedido.taxaEntrega === 0 ? 'GRÁTIS' : valor(pedido.taxaEntrega),
      y,
    );
  }

  y = divisoria(doc, y) + 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('TOTAL', MARGEM, y);
  doc.text(formatCurrency(pedido.valorTotal), DIREITA, y, { align: 'right' });

  return divisoria(doc, y + 2);
}

function pagamento(doc: jsPDF, order: OrderDocument, yInicial: number): number {
  const { pedido } = order;

  let y = texto(doc, `PAGAMENTO: ${PAGAMENTO_LABEL[pedido.formaPagamento]}`, yInicial + 3.5, {
    negrito: true,
    tamanho: 9.5,
  });

  if (pedido.formaPagamento === 'DINHEIRO' && pedido.trocoPara) {
    const troco = pedido.trocoPara - pedido.valorTotal;
    const complemento = troco > 0 ? ` - levar ${formatCurrency(troco)}` : '';
    y = texto(doc, `Troco para ${formatCurrency(pedido.trocoPara)}${complemento}`, y, {
      tamanho: 8,
    });
  }

  if (pedido.formaPagamento === 'PIX') {
    y = texto(doc, `Chave PIX: ${order.settings.pixKey}`, y, { tamanho: 8 });
  }

  return divisoria(doc, y + 1.5);
}

function observacoes(doc: jsPDF, order: OrderDocument, yInicial: number): number {
  const nota = order.pedido.observacao;
  if (!nota) return yInicial;

  let y = texto(doc, 'Observações', yInicial + 3.5, { negrito: true, tamanho: 9 });
  y = texto(doc, nota, y, { negrito: true, tamanho: 9 });

  return divisoria(doc, y + 1.5);
}

function rodape(doc: jsPDF, yInicial: number): number {
  return texto(doc, 'Pedido gerado automaticamente pelo sistema.', yInicial + 4, {
    tamanho: 6.5,
    alinhamento: 'centro',
  });
}

/* ---------------------------------------------------------------- desenho */

interface OpcoesTexto {
  negrito?: boolean;
  tamanho?: number;
  alinhamento?: 'esquerda' | 'centro';
  /** Deslocamento à esquerda, usado nos adicionais e observações do item. */
  recuo?: number;
}

/**
 * Escreve o texto quebrando em várias linhas quando não couber na bobina.
 *
 * Tudo sai em caixa alta: é a única passagem por onde o texto da comanda entra,
 * então quem chama não precisa lembrar de converter.
 */
function texto(doc: jsPDF, conteudo: string, y: number, opcoes: OpcoesTexto = {}): number {
  const { negrito = false, tamanho = 8, alinhamento = 'esquerda', recuo = 0 } = opcoes;

  doc.setFont('helvetica', negrito ? 'bold' : 'normal');
  doc.setFontSize(tamanho);

  const x = alinhamento === 'centro' ? LARGURA / 2 : MARGEM + recuo;
  const linhas = doc.splitTextToSize(maiusculas(conteudo), LARGURA_UTIL - recuo) as string[];
  const alturaLinha = tamanho * 0.42;

  let cursor = y;
  for (const linha of linhas) {
    doc.text(linha, x, cursor, alinhamento === 'centro' ? { align: 'center' } : undefined);
    cursor += alturaLinha;
  }

  return cursor;
}

/** Linha pontilhada, igual à da comanda impressa. */
function divisoria(doc: jsPDF, y: number): number {
  doc.setLineDashPattern([0.6, 0.6], 0);
  doc.setLineWidth(0.2);
  doc.line(MARGEM, y, DIREITA, y);
  doc.setLineDashPattern([], 0);
  return y;
}

function linhaValor(doc: jsPDF, rotulo: string, montante: string, y: number): number {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(maiusculas(rotulo), MARGEM, y);
  doc.text(montante, DIREITA, y, { align: 'right' });
  return y + 4;
}

/** Caixa alta preservando acentos: "Porções" vira "PORÇÕES". */
function maiusculas(conteudo: string): string {
  return conteudo.toLocaleUpperCase('pt-BR');
}

/* --------------------------------------------------------------- valores */

/** Valor sem o "R$", como aparece nas colunas da comanda. */
function valor(centavos: number): string {
  return (centavos / 100).toFixed(2).replace('.', ',');
}

/** Quantidade com 3 casas, no mesmo padrão do sistema do balcão. */
function quantidade(unidades: number): string {
  return unidades.toFixed(3).replace('.', ',');
}
