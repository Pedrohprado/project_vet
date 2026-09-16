/**
 * Gera WebP otimizados a partir dos PNGs em public/.
 * Uso: node scripts/optimize-brand-images.mjs
 */
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');

/** Largura máx. alinhada ao uso real no CSS (retina ~2x). */
const MAX_WIDTH_BY_FILE = {
  'new_logo.png': 640,
  'new_logo_box.png': 320,
  'logo.png': 512,
  'bird.png': 384,
  'flybird.png': 384,
  'head_cat.png': 512,
  'cat.png': 560,
  'dog.png': 560,
  'sniff_dog.png': 560,
  'dog_cat_box.png': 1024,
  'open_box.png': 1024,
  'veterinary_women.png': 1024,
  'turtle.png': 768,
  'turtle_grass.png': 1024,
};

const WEBP_QUALITY = 82;

async function optimizePng(fileName) {
  const inputPath = path.join(publicDir, fileName);
  const outputPath = path.join(publicDir, fileName.replace(/\.png$/i, '.webp'));
  const maxWidth = MAX_WIDTH_BY_FILE[fileName] ?? 1024;

  const inputStat = await stat(inputPath);
  const pipeline = sharp(inputPath).rotate().resize({
    width: maxWidth,
    withoutEnlargement: true,
  });

  await pipeline.webp({ quality: WEBP_QUALITY, effort: 4 }).toFile(outputPath);

  const outputStat = await stat(outputPath);
  const savedPct = (
    (1 - outputStat.size / inputStat.size) *
    100
  ).toFixed(1);

  console.log(
    `${fileName} → ${path.basename(outputPath)} (${formatKb(inputStat.size)} → ${formatKb(outputStat.size)}, -${savedPct}%)`,
  );
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(0)} KB`;
}

const entries = await readdir(publicDir);
const pngs = entries.filter((name) => name.toLowerCase().endsWith('.png'));

if (pngs.length === 0) {
  console.log('Nenhum PNG em public/.');
  process.exit(0);
}

for (const fileName of pngs) {
  await optimizePng(fileName);
}

console.log(`\n${pngs.length} arquivo(s) processado(s).`);
