import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

/**
 * Armazenamento das fotos dos produtos no Cloudinary.
 *
 * Antes as fotos iam para o disco do servidor, que no Render é efêmero: cada
 * deploy apagava tudo e os produtos ficavam com imagem quebrada. O Cloudinary
 * guarda o arquivo fora da aplicação e ainda entrega a imagem redimensionada e
 * em WebP, o que importa para o cliente que abre o cardápio no 4G.
 *
 * O banco guarda apenas a URL — nunca o binário.
 */

if (env.cloudinaryConfigurado) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/** Todas as fotos ficam sob esta pasta, separadas por empresa. */
const PASTA_BASE = 'cardapio';

export interface ImagemEnviada {
  url: string;
  /** Identificador no Cloudinary, usado para apagar a imagem antiga. */
  identificador: string;
}

export async function enviarImagem(
  arquivo: Buffer,
  empresaId: string,
): Promise<ImagemEnviada> {
  if (!env.cloudinaryConfigurado) {
    throw new AppError(
      'O armazenamento de imagens não está configurado. Avise o suporte.',
      503,
    );
  }

  const resultado = await new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      const fluxo = cloudinary.uploader.upload_stream(
        {
          folder: `${PASTA_BASE}/${empresaId}`,
          resource_type: 'image',
          // Fotos de celular chegam com 4000px; 1200 é mais do que suficiente
          // para o card e o modal, e corta o peso do arquivo.
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (erro, resposta) => {
          if (erro || !resposta) {
            reject(new AppError('Não conseguimos salvar a imagem. Tente de novo.', 502));
            return;
          }
          resolve({ secure_url: resposta.secure_url, public_id: resposta.public_id });
        },
      );

      fluxo.end(arquivo);
    },
  );

  return { url: resultado.secure_url, identificador: resultado.public_id };
}

/**
 * Remove a foto anterior ao trocar a imagem de um produto.
 * Falha silenciosa: uma imagem órfã no Cloudinary não pode impedir a
 * atualização do cardápio.
 */
export async function removerImagem(url: string | null): Promise<void> {
  if (!env.cloudinaryConfigurado || !url) return;

  const identificador = extrairIdentificador(url);
  if (!identificador) return;

  try {
    await cloudinary.uploader.destroy(identificador);
  } catch (erro) {
    console.error('[cloudinary] não foi possível remover a imagem antiga', erro);
  }
}

/**
 * Recupera o `public_id` a partir da URL salva no banco.
 * Ex.: https://res.cloudinary.com/conta/image/upload/v123/cardapio/empresa/abc.jpg
 *      -> cardapio/empresa/abc
 */
function extrairIdentificador(url: string): string | null {
  const partes = url.split('/upload/');
  if (partes.length < 2) return null;

  return (
    partes[1]!
      // Remove a versão (v1234567890/) quando presente.
      .replace(/^v\d+\//, '')
      // Remove a extensão do arquivo.
      .replace(/\.[a-zA-Z0-9]+$/, '')
  );
}
