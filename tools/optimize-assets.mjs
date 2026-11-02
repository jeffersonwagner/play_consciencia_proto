// Converte as imagens-mestre (assets-src/, PNG) para WebP em public/assets/,
// preservando a estrutura de pastas. Rode com `npm run assets` sempre que
// adicionar ou alterar arte. Arquivos já atualizados são pulados.
import { readdir, mkdir, stat } from 'node:fs/promises';
import { join, dirname, relative, extname } from 'node:path';
import sharp from 'sharp';

const SRC = 'assets-src';
const OUT = 'public/assets';

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

let converted = 0, skipped = 0;
for await (const file of walk(SRC)) {
  if (!['.png', '.jpg', '.jpeg'].includes(extname(file).toLowerCase())) continue;
  const out = join(OUT, relative(SRC, file)).replace(/\.(png|jpe?g)$/i, '.webp');
  const srcTime = (await stat(file)).mtimeMs;
  const outTime = await stat(out).then(s => s.mtimeMs, () => 0);
  if (outTime > srcTime) { skipped++; continue; }

  await mkdir(dirname(out), { recursive: true });
  // Sprites (com transparência) precisam de alphaQuality alto para não
  // gerar serrilhado nas bordas; fundos toleram compressão maior.
  const isCharacter = relative(SRC, file).split(/[\\/]/)[0] === 'characters';
  await sharp(file)
    .webp(isCharacter ? { quality: 85, alphaQuality: 95 } : { quality: 80 })
    .toFile(out);
  converted++;
  console.log('✓', out);
}
console.log(`\n${converted} convertida(s), ${skipped} já atualizada(s).`);
