/**
 * Genera el icono de la aplicación a partir del símbolo oficial de Ardeno.
 *
 * Determinista: mismas entradas, mismo PNG. No dibuja nada nuevo — toma el
 * canal alfa de `public/logos/ardeno-symbol.png` como silueta y lo pinta en
 * hueso sobre el navy del hero, que es la expresión "sobre oscuro" del manual.
 *
 *   node scripts/generate-icon.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(root, "public/logos/ardeno-symbol.png");
const TARGET = path.join(root, "src/app/icon.png");

const SIZE = 512;
// Los trazos del símbolo son muy finos; a menos del 60% de la caja se pierden
// en un favicon de 16px, y a más rozan los bordes.
const MARK_HEIGHT = Math.round(SIZE * 0.62);
const BONE = { r: 0xf7, g: 0xf4, b: 0xeb, alpha: 1 };
const NAVY = { r: 0x08, g: 0x0c, b: 0x10, alpha: 1 };

const silhouette = await sharp(readFileSync(SOURCE))
  .resize({
    height: MARK_HEIGHT,
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .toBuffer({ resolveWithObject: true });

// El PNG solo aporta la silueta: el color lo manda la marca, no el archivo.
const mark = await sharp({
  create: {
    width: silhouette.info.width,
    height: silhouette.info.height,
    channels: 4,
    background: BONE,
  },
})
  .composite([{ input: silhouette.data, blend: "dest-in" }])
  .png()
  .toBuffer();

const icon = await sharp({
  create: { width: SIZE, height: SIZE, channels: 4, background: NAVY },
})
  .composite([{ input: mark, gravity: "center" }])
  .png({ compressionLevel: 9, palette: false })
  .toBuffer();

writeFileSync(TARGET, icon);
console.log(`icon.png escrito: ${SIZE}x${SIZE} desde ${path.basename(SOURCE)}`);
