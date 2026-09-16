/**
 * Gera og-image.webp (1200x630) a partir do logo da marca.
 * Uso: node scripts/generate-og-image.mjs
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');

const WIDTH = 1200;
const HEIGHT = 630;
const BG = { r: 255, g: 248, b: 235, alpha: 1 };
const ACCENT = '#FFB84D';

const logoPath = path.join(publicDir, 'new_logo.png');
const outputPath = path.join(publicDir, 'og-image.webp');

const logo = await sharp(logoPath)
  .resize({ width: 520, withoutEnlargement: true })
  .png()
  .toBuffer();

const logoMeta = await sharp(logo).metadata();
const logoW = logoMeta.width ?? 520;
const logoH = logoMeta.height ?? 200;
const left = Math.round((WIDTH - logoW) / 2);
const top = Math.round((HEIGHT - logoH) / 2) - 20;

const svgOverlay = Buffer.from(`
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="${WIDTH}" height="8" fill="${ACCENT}"/>
  <text x="50%" y="${HEIGHT - 72}" text-anchor="middle"
    font-family="Nunito, Arial, sans-serif" font-size="28" font-weight="700"
    fill="#1a1a1a">Software para clínicas veterinárias</text>
  <text x="50%" y="${HEIGHT - 36}" text-anchor="middle"
    font-family="Nunito, Arial, sans-serif" font-size="20"
    fill="#666666">Pós-consulta · Vacinação · Retornos</text>
</svg>
`);

await sharp({
  create: {
    width: WIDTH,
    height: HEIGHT,
    channels: 4,
    background: BG,
  },
})
  .composite([
    { input: logo, left, top },
    { input: svgOverlay, left: 0, top: 0 },
  ])
  .webp({ quality: 85 })
  .toFile(outputPath);

console.log(`Gerado: ${outputPath}`);
