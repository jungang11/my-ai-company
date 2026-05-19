// 카이로 톤 색 팔레트. 출처: docs/skills/pixel-office-design.md
// PR2.1은 PM만 사용. PR2.2에서 5색 모두 활성화.

export type Role = 'PM' | 'Engineer' | 'Designer' | 'QA' | 'Ops';

export const ROLE_PALETTE: Record<Role, { shirt: string; shirtDark: string; hair: string }> = {
  PM: { shirt: '#f59e0b', shirtDark: '#b45309', hair: '#451a03' },
  Engineer: { shirt: '#3b82f6', shirtDark: '#1d4ed8', hair: '#1e293b' },
  Designer: { shirt: '#ec4899', shirtDark: '#be185d', hair: '#7c2d12' },
  QA: { shirt: '#10b981', shirtDark: '#047857', hair: '#374151' },
  Ops: { shirt: '#a855f7', shirtDark: '#7e22ce', hair: '#1e3a8a' },
};

export const SKIN = '#fde68a';
export const SKIN_SHADE = '#fbbf24';

export const FLOOR = {
  light: '#fef3c7',
  dark: '#fde68a',
  grout: '#fbbf24',
};

export const WALL = {
  base: '#92400e',
  accent: '#fbbf24',
};

export const DESK = {
  wood: '#a16207',
  woodDark: '#78350f',
  monitorFrame: '#1e293b',
  monitorScreen: '#0f172a',
  monitorText: '#34d399',
  keyboard: '#cbd5e1',
  keyboardKey: '#94a3b8',
  mouse: '#1e293b',
  cup: '#fef3c7',
  coffee: '#78350f',
  postit: '#fcd34d',
  postitAlt: '#f9a8d4',
};
