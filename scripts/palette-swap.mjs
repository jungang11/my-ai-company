// 캐릭터 베이스(셔츠=마젠타 마커)의 셔츠만 직군 색으로 치환 — 실루엣 100% 동일 보장.
// 마젠타 계열(고R·고B·저G) 픽셀을 밝기에 따라 shirt/shirtDark 두 톤으로 매핑.
// 색 출처: app/src/renderer/src/components/pixel-office/palette.ts ROLE_PALETTE — 변경 시 동기화.
// 사용: node scripts/palette-swap.mjs <base.png> [outDir]
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { PNG } from '../app/node_modules/pngjs/lib/png.js';

const ROLES = {
  pm: { shirt: '#f59e0b', shirtDark: '#b45309' }, // amber
  engineer: { shirt: '#3b82f6', shirtDark: '#1d4ed8' }, // blue
  architect: { shirt: '#a855f7', shirtDark: '#7e22ce' }, // violet
  planner: { shirt: '#10b981', shirtDark: '#047857' }, // emerald
  qa: { shirt: '#f43f5e', shirtDark: '#be123c' }, // rose
  utility: { shirt: '#94a3b8', shirtDark: '#64748b' }, // slate
};

const [, , basePath, outDirArg] = process.argv;
if (!basePath) {
  console.error('사용법: node scripts/palette-swap.mjs <base.png> [outDir]');
  process.exit(1);
}
const outDir = outDirArg ?? path.dirname(basePath);

function hex(c) {
  return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
}

function isMagenta(r, g, b) {
  return r > 120 && b > 120 && g < r * 0.62 && g < b * 0.62;
}

const baseBuf = readFileSync(basePath);

// 1pass: 마젠타 픽셀 밝기 범위 측정 (두 톤 경계 = 중간값)
const probe = PNG.sync.read(baseBuf);
let lumMin = 255, lumMax = 0, count = 0;
for (let o = 0; o < probe.data.length; o += 4) {
  if (probe.data[o + 3] === 0) continue;
  const [r, g, b] = [probe.data[o], probe.data[o + 1], probe.data[o + 2]];
  if (!isMagenta(r, g, b)) continue;
  const lum = 0.3 * r + 0.3 * g + 0.4 * b;
  lumMin = Math.min(lumMin, lum);
  lumMax = Math.max(lumMax, lum);
  count++;
}
if (count === 0) {
  console.error('마젠타 마커 픽셀 0개 — 베이스 이미지 확인 필요');
  process.exit(1);
}
const mid = (lumMin + lumMax) / 2;

for (const [role, colors] of Object.entries(ROLES)) {
  const png = PNG.sync.read(baseBuf);
  const light = hex(colors.shirt);
  const dark = hex(colors.shirtDark);
  let swapped = 0;
  for (let o = 0; o < png.data.length; o += 4) {
    if (png.data[o + 3] === 0) continue;
    const [r, g, b] = [png.data[o], png.data[o + 1], png.data[o + 2]];
    if (!isMagenta(r, g, b)) continue;
    const lum = 0.3 * r + 0.3 * g + 0.4 * b;
    const target = lum >= mid ? light : dark;
    png.data[o] = target[0];
    png.data[o + 1] = target[1];
    png.data[o + 2] = target[2];
    swapped++;
  }
  const out = path.join(outDir, `char-${role}.png`);
  writeFileSync(out, PNG.sync.write(png));
  console.log(`char-${role}.png — ${swapped}px 치환`);
}
console.log(`마젠타 ${count}px, 밝기 ${lumMin.toFixed(0)}~${lumMax.toFixed(0)} (경계 ${mid.toFixed(0)})`);
