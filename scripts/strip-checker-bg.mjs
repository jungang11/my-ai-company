// gpt-image-2가 투명 배경 대신 흰/체커보드 픽셀을 박아줄 때 벗기는 후처리.
// 테두리에서 BFS flood-fill — 밝고 채도 낮은(흰/회색 체커) 연결 픽셀만 alpha 0.
// 사용: node scripts/strip-checker-bg.mjs <png> [tolerance=30]
import { readFileSync, writeFileSync } from 'node:fs';
import { PNG } from '../app/node_modules/pngjs/lib/png.js';

const [, , path, tolArg] = process.argv;
if (!path) {
  console.error('사용법: node scripts/strip-checker-bg.mjs <png> [tolerance]');
  process.exit(1);
}
const tol = Number(tolArg ?? 30);

const png = PNG.sync.read(readFileSync(path));
const { width: w, height: h, data } = png;

// 배경 후보: 밝고(max 채널 높음) 채도 낮음(채널 간 차 작음) — 흰색 + 체커 두 톤 커버
function isBgTone(o) {
  const r = data[o], g = data[o + 1], b = data[o + 2];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max >= 255 - 2 * tol && max - min <= tol / 2;
}

const visited = new Uint8Array(w * h);
const stack = [];
for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
for (let y = 0; y < h; y++) stack.push(y * w, y * w + (w - 1));

let removed = 0;
while (stack.length > 0) {
  const idx = stack.pop();
  if (visited[idx]) continue;
  visited[idx] = 1;
  const o = idx * 4;
  const a = data[o + 3];
  if (a !== 0 && !isBgTone(o)) continue; // 객체 경계에서 멈춤
  if (a !== 0) {
    data[o + 3] = 0;
    removed++;
  }
  const x = idx % w;
  const y = (idx / w) | 0;
  if (x > 0) stack.push(idx - 1);
  if (x < w - 1) stack.push(idx + 1);
  if (y > 0) stack.push(idx - w);
  if (y < h - 1) stack.push(idx + w);
}

writeFileSync(path, PNG.sync.write(png));
const corner = (x, y) => data[(y * w + x) * 4 + 3];
console.log(
  `removed ${removed}px → ${path} | corner alpha: ${corner(5, 5)}/${corner(w - 6, h - 6)}`,
);
