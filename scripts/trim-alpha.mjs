// 투명 여백 자동 트림 — gpt-image-2 산출물은 캔버스 중앙에 작게 그려져 여백이 큼.
// alpha>0 bbox + padding으로 크롭해 덮어씀. 사용: node scripts/trim-alpha.mjs <png...>
import { readFileSync, writeFileSync } from 'node:fs';
import { PNG } from '../app/node_modules/pngjs/lib/png.js';

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('사용법: node scripts/trim-alpha.mjs <png> [png...]');
  process.exit(1);
}
const PAD = 8;

for (const f of files) {
  const png = PNG.sync.read(readFileSync(f));
  const { width: w, height: h, data } = png;
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) {
    console.error(`${f}: 불투명 픽셀 없음 — skip`);
    continue;
  }
  minX = Math.max(0, minX - PAD);
  minY = Math.max(0, minY - PAD);
  maxX = Math.min(w - 1, maxX + PAD);
  maxY = Math.min(h - 1, maxY + PAD);
  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  const out = new PNG({ width: cw, height: ch });
  PNG.bitblt(png, out, minX, minY, cw, ch, 0, 0);
  writeFileSync(f, PNG.sync.write(out));
  console.log(`${f}: ${w}x${h} → ${cw}x${ch}`);
}
