#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const publicDir = resolve(root, 'public');

const SVG_PATH = resolve(publicDir, 'icon.svg');

const SIZES = [
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'icon-512x512-maskable.png', size: 512 },
  { name: 'apple-icon-120x120.png', size: 120 },
  { name: 'apple-icon-152x152.png', size: 152 },
  { name: 'apple-icon-167x167.png', size: 167 },
  { name: 'apple-icon-180x180.png', size: 180 },
];

async function main() {
  const sharp = (await import('sharp')).default;
  const svgBuffer = readFileSync(SVG_PATH);

  for (const { name, size } of SIZES) {
    const outPath = resolve(publicDir, name);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outPath);
    console.log(`Generated ${name} (${size}x${size})`);
  }

  console.log('\nDone — all PWA icons generated.');
}

main().catch((err) => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});
