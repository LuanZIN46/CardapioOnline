import { jsPDF } from 'jspdf';
import { formatCurrency } from '@/lib/format';
import { itemTotal, itemUnitTotal } from '@/lib/pricing';
import type {
  CartItem,
  CartTotals,
  CustomerInfo,
  DeliveryAddress,
  OrderPayment,
  OrderType,
  PaymentMethod,
  StoreSettings,
} from '@/types';

/** Tudo que o comprovante precisa. É o mesmo formato usado na mensagem do WhatsApp. */
export interface OrderDocument {
  orderCode: string;
  createdAt: Date;
  customer: CustomerInfo;
  type: OrderType;
  address?: DeliveryAddress;
  payment: OrderPayment;
  items: CartItem[];
  totals: CartTotals;
  couponCode?: string;
  notes?: string;
  settings: StoreSettings;
}

export interface GeneratedOrderPdf {
  blob: Blob;
  file: File;
  fileName: string;
  /** URL temporária para pré-visualizar ou baixar. Libere com `revokeOrderPdf`. */
  objectUrl: string;
}

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  pix: 'PIX',
  card: 'Cartão (na entrega)',
  cash: 'Dinheiro',
};

/* Medidas em milímetros (A4 = 210 x 297). */
const PAGE_WIDTH = 210;
const MARGIN = 16;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const RIGHT_EDGE = PAGE_WIDTH - MARGIN;
const PAGE_BOTTOM = 297 - MARGIN;

const COR_TEXTO: [number, number, number] = [17, 17, 17];
const COR_SUAVE: [number, number, number] = [110, 110, 110];
const COR_LINHA: [number, number, number] = [210, 210, 210];
const COR_DOURADO: [number, number, number] = [150, 122, 36];

/**
 * Monta o comprovante do pedido em PDF.
 *
 * A função é isolada de propósito: recebe o pedido pronto e devolve o arquivo,
 * sem tocar em estado da aplicação, rede ou navegação.
 */
export async function generateOrderPDF(order: OrderDocument): Promise<GeneratedOrderPdf> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  doc.setFont('helvetica', 'normal');

  let y = MARGIN;

  y = await desenharCabecalho(doc, order, y);
  y = desenharDadosDoPedido(doc, order, y);
  y = desenharCliente(doc, order, y);
  y = desenharItens(doc, order, y);
  y = desenharTotais(doc, order, y);
  y = desenharObservacoes(doc, order, y);
  desenharRodape(doc, order);

  const blob = doc.output('blob');
  const fileName = `pedido-${order.orderCode}.pdf`;
  const file = new File([blob], fileName, { type: 'application/pdf' });

  return { blob, file, fileName, objectUrl: URL.createObjectURL(blob) };
}

export function revokeOrderPdf(pdf: GeneratedOrderPdf): void {
  URL.revokeObjectURL(pdf.objectUrl);
}

/* ------------------------------------------------------------------ blocos */

async function desenharCabecalho(
  doc: jsPDF,
  order: OrderDocument,
  yInicial: number,
): Promise<number> {
  const logo = await carregarLogo(order.settings.logoUrl);
  let y = yInicial;

  if (logo) {
    const lado = 24;
    doc.addImage(logo.dataUrl, logo.formato, MARGIN, y, lado, lado);
    // Nome e contato ficam ao lado da logo.
    const textoX = MARGIN + lado + 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...COR_TEXTO);
    doc.text(order.settings.name, textoX, y + 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COR_SUAVE);
    doc.text(order.settings.address, textoX, y + 15);
    doc.text(`Telefone: ${order.settings.phone}`, textoX, y + 20);

    y += lado;
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...COR_TEXTO);
    doc.text(order.settings.name, PAGE_WIDTH / 2, y + 8, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COR_SUAVE);
    doc.text(order.settings.address, PAGE_WIDTH / 2, y + 14, { align: 'center' });
    doc.text(`Telefone: ${order.settings.phone}`, PAGE_WIDTH / 2, y + 19, { align: 'center' });

    y += 22;
  }

  return linhaDivisoria(doc, y + 5);
}

function desenharDadosDoPedido(doc: jsPDF, order: OrderDocument, yInicial: number): number {
  const y = yInicial + 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...COR_DOURADO);
  doc.text(`PEDIDO #${order.orderCode}`, MARGIN, y);

  const data = order.createdAt.toLocaleDateString('pt-BR');
  const hora = order.createdAt.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COR_TEXTO);
  doc.text(`${data} às ${hora}`, RIGHT_EDGE, y, { align: 'right' });

  const tipo = order.type === 'delivery' ? 'ENTREGA' : 'RETIRADA NO BALCÃO';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COR_SUAVE);
  doc.text(tipo, RIGHT_EDGE, y + 5, { align: 'right' });

  return y + 10;
}

function desenharCliente(doc: jsPDF, order: OrderDocument, yInicial: number): number {
  let y = linhaDivisoria(doc, yInicial) + 7;

  y = tituloSecao(doc, 'CLIENTE', y);

  const linhas: Array<[string, string]> = [
    ['Nome', order.customer.name],
    ['Telefone', order.customer.phone],
    ['Pagamento', rotuloPagamento(order)],
  ];

  if (order.type === 'delivery' && order.address) {
    linhas.push(['Endereço', formatarEndereco(order.address)]);
  } else {
    linhas.push(['Retirada', order.settings.address]);
  }

  for (const [rotulo, valor] of linhas) {
    y = linhaRotuloValor(doc, rotulo, valor, y);
  }

  return y + 2;
}

function desenharItens(doc: jsPDF, order: OrderDocument, yInicial: number): number {
  let y = linhaDivisoria(doc, yInicial) + 7;
  y = tituloSecao(doc, 'ITENS DO PEDIDO', y);

  // Cabeçalho da tabela
  const colQtd = MARGIN;
  const colItem = MARGIN + 12;
  const colUnit = RIGHT_EDGE - 46;
  const colSub = RIGHT_EDGE;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COR_SUAVE);
  doc.text('QTD', colQtd, y);
  doc.text('PRODUTO', colItem, y);
  doc.text('UNIT.', colUnit, y, { align: 'right' });
  doc.text('SUBTOTAL', colSub, y, { align: 'right' });
  y += 2.5;
  y = linhaDivisoria(doc, y) + 5;

  doc.setTextColor(...COR_TEXTO);

  for (const item of order.items) {
    y = garantirEspaco(doc, y, 14);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`${item.quantity}x`, colQtd, y);

    // O nome pode quebrar em várias linhas sem invadir a coluna de preços.
    const larguraNome = colUnit - colItem - 8;
    const nomeLinhas = doc.splitTextToSize(item.name, larguraNome) as string[];
    doc.text(nomeLinhas[0] ?? item.name, colItem, y);

    doc.setFont('helvetica', 'normal');
    doc.text(formatCurrency(itemUnitTotal(item)), colUnit, y, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(itemTotal(item)), colSub, y, { align: 'right' });

    y += 4.5;

    for (const linhaExtra of nomeLinhas.slice(1)) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(linhaExtra, colItem, y);
      y += 4.5;
    }

    y = desenharDetalhesDoItem(doc, item, colItem, larguraNome, y);
    y += 2;
  }

  return y;
}

function desenharDetalhesDoItem(
  doc: jsPDF,
  item: CartItem,
  x: number,
  largura: number,
  yInicial: number,
): number {
  let y = yInicial;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COR_SUAVE);

  for (const addon of item.addons) {
    y = garantirEspaco(doc, y, 6);
    const quantidade = addon.quantity > 1 ? ` (${addon.quantity}x)` : '';
    const preco = addon.price > 0 ? ` — ${formatCurrency(addon.price * addon.quantity)}` : '';
    doc.text(`+ ${addon.name}${quantidade}${preco}`, x + 2, y);
    y += 4;
  }

  if (item.notes) {
    const linhas = doc.splitTextToSize(`Obs.: ${item.notes}`, largura) as string[];
    for (const linha of linhas) {
      y = garantirEspaco(doc, y, 6);
      doc.text(linha, x + 2, y);
      y += 4;
    }
  }

  doc.setTextColor(...COR_TEXTO);
  return y;
}

function desenharTotais(doc: jsPDF, order: OrderDocument, yInicial: number): number {
  let y = garantirEspaco(doc, yInicial, 42);
  y = linhaDivisoria(doc, y) + 7;

  const { totals, type, couponCode } = order;

  y = linhaTotal(doc, 'Subtotal', formatCurrency(totals.subtotal), y);

  if (type === 'delivery') {
    y = linhaTotal(
      doc,
      'Taxa de entrega',
      totals.deliveryFee === 0 ? 'Grátis' : formatCurrency(totals.deliveryFee),
      y,
    );
  } else {
    y = linhaTotal(doc, 'Retirada no balcão', 'Sem taxa', y);
  }

  if (totals.discount > 0) {
    y = linhaTotal(
      doc,
      `Desconto${couponCode ? ` (${couponCode})` : ''}`,
      `- ${formatCurrency(totals.discount)}`,
      y,
    );
  }

  // Total destacado numa faixa.
  y += 2;
  doc.setFillColor(245, 241, 227);
  doc.rect(MARGIN, y, CONTENT_WIDTH, 12, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COR_TEXTO);
  doc.text('TOTAL', MARGIN + 4, y + 8);
  doc.setFontSize(14);
  doc.setTextColor(...COR_DOURADO);
  doc.text(formatCurrency(totals.total), RIGHT_EDGE - 4, y + 8, { align: 'right' });

  y += 14;

  if (order.payment.method === 'cash' && order.payment.changeFor) {
    const troco = order.payment.changeFor - totals.total;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...COR_TEXTO);
    doc.text(
      `Troco para ${formatCurrency(order.payment.changeFor)}` +
        (troco > 0 ? ` — levar ${formatCurrency(troco)}` : ''),
      RIGHT_EDGE,
      y + 4,
      { align: 'right' },
    );
    y += 7;
  }

  if (order.payment.method === 'pix') {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...COR_SUAVE);
    doc.text(`Chave PIX: ${order.settings.pixKey}`, RIGHT_EDGE, y + 4, { align: 'right' });
    y += 7;
  }

  return y;
}

function desenharObservacoes(doc: jsPDF, order: OrderDocument, yInicial: number): number {
  if (!order.notes) return yInicial;

  let y = garantirEspaco(doc, yInicial + 4, 24);
  y = linhaDivisoria(doc, y) + 7;
  y = tituloSecao(doc, 'OBSERVAÇÕES', y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COR_TEXTO);

  const linhas = doc.splitTextToSize(order.notes, CONTENT_WIDTH) as string[];
  for (const linha of linhas) {
    y = garantirEspaco(doc, y, 8);
    doc.text(linha, MARGIN, y);
    y += 5;
  }

  return y;
}

function desenharRodape(doc: jsPDF, order: OrderDocument): void {
  const totalPaginas = doc.getNumberOfPages();

  for (let pagina = 1; pagina <= totalPaginas; pagina += 1) {
    doc.setPage(pagina);

    doc.setDrawColor(...COR_LINHA);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, PAGE_BOTTOM - 8, RIGHT_EDGE, PAGE_BOTTOM - 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COR_SUAVE);
    doc.text('Pedido gerado automaticamente pelo sistema.', MARGIN, PAGE_BOTTOM - 3);

    if (totalPaginas > 1) {
      doc.text(`Página ${pagina} de ${totalPaginas}`, RIGHT_EDGE, PAGE_BOTTOM - 3, {
        align: 'right',
      });
    } else {
      doc.text(order.settings.name, RIGHT_EDGE, PAGE_BOTTOM - 3, { align: 'right' });
    }
  }
}

/* ---------------------------------------------------------------- auxiliares */

function linhaDivisoria(doc: jsPDF, y: number): number {
  doc.setDrawColor(...COR_LINHA);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, RIGHT_EDGE, y);
  return y;
}

function tituloSecao(doc: jsPDF, texto: string, y: number): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COR_DOURADO);
  doc.text(texto, MARGIN, y);
  return y + 6;
}

function linhaRotuloValor(doc: jsPDF, rotulo: string, valor: string, yInicial: number): number {
  let y = garantirEspaco(doc, yInicial, 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COR_SUAVE);
  doc.text(`${rotulo}:`, MARGIN, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COR_TEXTO);

  const x = MARGIN + 26;
  const linhas = doc.splitTextToSize(valor, CONTENT_WIDTH - 26) as string[];

  for (const [indice, linha] of linhas.entries()) {
    if (indice > 0) y = garantirEspaco(doc, y, 8);
    doc.text(linha, x, y);
    y += 5;
  }

  return y;
}

function linhaTotal(doc: jsPDF, rotulo: string, valor: string, y: number): number {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COR_TEXTO);
  doc.text(rotulo, MARGIN, y);
  doc.text(valor, RIGHT_EDGE, y, { align: 'right' });
  return y + 5.5;
}

/** Abre nova página quando o bloco não cabe no espaço restante. */
function garantirEspaco(doc: jsPDF, y: number, alturaNecessaria: number): number {
  if (y + alturaNecessaria <= PAGE_BOTTOM - 12) return y;
  doc.addPage();
  return MARGIN;
}

function rotuloPagamento(order: OrderDocument): string {
  const base = PAYMENT_LABELS[order.payment.method];
  if (order.payment.method !== 'cash') return base;
  return order.payment.changeFor
    ? `${base} — troco para ${formatCurrency(order.payment.changeFor)}`
    : `${base} — não precisa de troco`;
}

function formatarEndereco(address: DeliveryAddress): string {
  return [`${address.street}, ${address.number}`, address.neighborhood, address.city].join(' · ');
}

interface LogoCarregada {
  dataUrl: string;
  formato: 'JPEG';
}

/** A logo é exibida a 24 mm; ~300 DPI nesse tamanho dá cerca de 280 px. */
const LOGO_PX = 280;

/**
 * Converte a logo em data URL para embutir no PDF, reduzindo a resolução.
 * Embutir o arquivo original (1254px) deixaria o PDF em centenas de KB sem
 * ganho visual nenhum. Falha silenciosa: sem logo o cabeçalho centraliza o nome.
 */
async function carregarLogo(url: string): Promise<LogoCarregada | null> {
  try {
    const imagem = await carregarImagem(url);

    const canvas = document.createElement('canvas');
    canvas.width = LOGO_PX;
    canvas.height = LOGO_PX;

    const contexto = canvas.getContext('2d');
    if (!contexto) return null;

    // JPEG não tem transparência, então o fundo acompanha o tema escuro da marca.
    contexto.fillStyle = '#111111';
    contexto.fillRect(0, 0, LOGO_PX, LOGO_PX);

    // Mantém a proporção original dentro do quadrado.
    const escala = Math.min(LOGO_PX / imagem.width, LOGO_PX / imagem.height);
    const largura = imagem.width * escala;
    const altura = imagem.height * escala;
    contexto.drawImage(
      imagem,
      (LOGO_PX - largura) / 2,
      (LOGO_PX - altura) / 2,
      largura,
      altura,
    );

    return { dataUrl: canvas.toDataURL('image/jpeg', 0.82), formato: 'JPEG' };
  } catch {
    return null;
  }
}

function carregarImagem(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const imagem = new Image();
    imagem.crossOrigin = 'anonymous';
    imagem.onload = () => resolve(imagem);
    imagem.onerror = () => reject(new Error(`falha ao carregar ${url}`));
    imagem.src = url;
  });
}
