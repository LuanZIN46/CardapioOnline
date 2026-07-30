import type { GeneratedOrderPdf } from './orderPdf.service';
import type { StoreSettings } from '@/types';

/**
 * Como o pedido chega ao estabelecimento.
 *
 * Limitação do WhatsApp: links `wa.me` e `api.whatsapp.com/send` aceitam apenas o
 * parâmetro `text`. Não existe parâmetro para anexar arquivo, então é impossível
 * mandar o PDF só com um link.
 *
 * O caminho viável no navegador é a Web Share API nível 2 (`navigator.share` com
 * `files`): ela abre a folha de compartilhamento do sistema com o PDF já anexado,
 * e o usuário escolhe o WhatsApp. Funciona em Android/Chrome e iOS/Safari.
 * No desktop quase nenhum navegador aceita compartilhar arquivos, por isso existe
 * o plano B: baixar o PDF e abrir a conversa com um resumo em texto.
 */

export type CanalDeEnvio = 'compartilhar-arquivo' | 'baixar-e-abrir-conversa';

export function podeCompartilharArquivo(file: File): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [file] })
  );
}

export function canalDisponivel(file: File): CanalDeEnvio {
  return podeCompartilharArquivo(file) ? 'compartilhar-arquivo' : 'baixar-e-abrir-conversa';
}

export type ResultadoCompartilhamento = 'compartilhado' | 'cancelado' | 'nao-suportado';

/** Abre a folha de compartilhamento do sistema com o PDF anexado. */
export async function compartilharPdf(
  pdf: GeneratedOrderPdf,
  settings: StoreSettings,
  resumo: string,
): Promise<ResultadoCompartilhamento> {
  if (!podeCompartilharArquivo(pdf.file)) return 'nao-suportado';

  try {
    await navigator.share({
      files: [pdf.file],
      title: `Pedido ${settings.name}`,
      text: resumo,
    });
    return 'compartilhado';
  } catch (erro) {
    // O usuário fechar a folha de compartilhamento dispara AbortError e não é erro.
    if (erro instanceof DOMException && erro.name === 'AbortError') return 'cancelado';
    throw erro;
  }
}

export function baixarPdf(pdf: GeneratedOrderPdf): void {
  const link = document.createElement('a');
  link.href = pdf.objectUrl;
  link.download = pdf.fileName;
  document.body.append(link);
  link.click();
  link.remove();
}

export function abrirPdfEmNovaAba(pdf: GeneratedOrderPdf): void {
  window.open(pdf.objectUrl, '_blank', 'noopener');
}

interface ResumoParaConversa {
  orderCode: string;
  clienteNome: string;
  quantidadeItens: number;
  total: string;
  tipo: 'delivery' | 'pickup';
}

/**
 * Texto curto que acompanha o PDF (ou abre a conversa no plano B).
 * Mantém o essencial legível mesmo que o arquivo demore a ser anexado.
 */
export function montarResumoDaConversa(dados: ResumoParaConversa): string {
  return [
    `Olá! Segue meu pedido *#${dados.orderCode}* em PDF.`,
    '',
    `Cliente: ${dados.clienteNome}`,
    `Itens: ${dados.quantidadeItens}`,
    `Total: ${dados.total}`,
    `Tipo: ${dados.tipo === 'delivery' ? 'Entrega' : 'Retirada no balcão'}`,
  ].join('\n');
}

export function urlDaConversa(settings: StoreSettings, texto: string): string {
  return `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(texto)}`;
}
