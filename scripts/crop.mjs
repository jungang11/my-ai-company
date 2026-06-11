// PNG 크롭(+nearest 업스케일) 유틸 — visual QA 루프에서 스크린샷 특정 영역 확대 검토용.
// 사용: node scripts/crop.mjs <in.png> <out.png> <x> <y> <w> <h> [scale=1]
import { readFileSync, writeFileSync } from 'node:fs';
import { PNG } from '../app/node_modules/pngjs/lib/png.js';

const [, , inPath, outPath, xs, ys, ws, hs, ss] = process.argv;
if (!inPath || !outPath || !xs || !ys || !ws || !hs) {
  console.error('사용법: node scripts/crop.mjs <in> <out> <x> <y> <w> <h> [scale]');
  process.exit(1);
}
const [x, y, w, h] = [xs, ys, ws, hs].map(Number);
const scale = Number(ss ?? 1);

const src = PNG.sync.read(readFileSync(inPath));
const crop = new PNG({ width: w, height: h });
PNG.bitblt(src, crop, x, y, w, h, 0, 0);

let out = crop;
if (scale > 1) {
  out = new PNG({ width: w * scale, height: h * scale });
  for (let oy = 0; oy < h * scale; oy++) {
    for (let ox = 0; ox < w * scale; ox++) {
      const so = (((oy / scale) | 0) * w + ((ox / scale) | 0)) * 4;
      const oo = (oy * w * scale + ox) * 4;
      crop.data.copy(out.data, oo, so, so + 4);
    }
  }
}
writeFileSync(outPath, PNG.sync.write(out));
console.log(`cropped ${w}x${h}@(${x},${y}) x${scale} → ${outPath}`);
