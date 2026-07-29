/**
 * Gera os ícones do PWA e o favicon a partir da logo do estabelecimento.
 *
 *   node scripts/generate-icons.mjs
 *
 * Basta trocar `public/logo.jpg` e rodar de novo quando a marca mudar.
 */
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const publicDir = path.resolve(fileURLToPath(new URL('../public', import.meta.url)));
const source = path.join(publicDir, 'logo.jpg');
const iconsDir = path.join(publicDir, 'icons');

const BACKGROUND = { r: 17, g: 17, b: 17, alpha: 1 };

const targets = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'favicon-96.png', size: 96 },
];

await mkdir(iconsDir, { recursive: true });

for (const { file, size } of targets) {
  await sharp(source)
    .resize(size, size, { fit: 'contain', background: BACKGROUND })
    .flatten({ background: BACKGROUND })
    .png({ compressionLevel: 9, palette: true, quality: 92 })
    .toFile(path.join(iconsDir, file));

  console.log(`✓ icons/${file} (${size}x${size})`);
}

// Ícone maskable: o Android recorta as bordas, então a arte fica dentro da zona segura (80%).
const MASKABLE_SIZE = 512;
const safeArt = await sharp(source)
  .resize(Math.round(MASKABLE_SIZE * 0.78), Math.round(MASKABLE_SIZE * 0.78), { fit: 'contain', background: BACKGROUND })
  .toBuffer();

await sharp({
  create: { width: MASKABLE_SIZE, height: MASKABLE_SIZE, channels: 4, background: BACKGROUND },
})
  .composite([{ input: safeArt, gravity: 'center' }])
  .png({ compressionLevel: 9, palette: true, quality: 92 })
  .toFile(path.join(iconsDir, 'icon-maskable-512.png'));

console.log('✓ icons/icon-maskable-512.png (512x512, zona segura)');

// Marca reduzida (só as canecas) para uso em tamanhos pequenos, como o header.
// O recorte é fixo para a arte atual — reveja estes valores se a logo mudar.
const MARK_CROP = { left: 288, top: 318, width: 684, height: 492 };

await sharp(source)
  .extract(MARK_CROP)
  .resize(256, 256, { fit: 'contain', background: BACKGROUND })
  .png({ compressionLevel: 9, palette: true, quality: 92 })
  .toFile(path.join(publicDir, 'logo-mark.png'));

console.log('✓ logo-mark.png (256x256, apenas o emblema)');
