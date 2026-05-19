// 카이로 톤 색 팔레트. 출처: docs/skills/pixel-office-design.md
// 회사 6직군 매핑 — PR2.2에서 5명 추가하면서 skill 표준 5색을 회사 직군에 재배치 + 1색 신규(QA rose).

export type Role = 'PM' | 'Engineer' | 'Architect' | 'Planner' | 'QA' | 'Utility';

export const ROLE_PALETTE: Record<Role, { shirt: string; shirtDark: string; hair: string }> = {
  PM: { shirt: '#f59e0b', shirtDark: '#b45309', hair: '#451a03' }, // amber
  Engineer: { shirt: '#3b82f6', shirtDark: '#1d4ed8', hair: '#1e293b' }, // blue
  Architect: { shirt: '#a855f7', shirtDark: '#7e22ce', hair: '#1e3a8a' }, // violet
  Planner: { shirt: '#10b981', shirtDark: '#047857', hair: '#374151' }, // emerald
  QA: { shirt: '#f43f5e', shirtDark: '#be123c', hair: '#7c2d12' }, // rose
  Utility: { shirt: '#94a3b8', shirtDark: '#64748b', hair: '#1e293b' }, // slate
};

// 직원 id → Role 매핑. 좌석 배치는 PixelOffice.tsx의 SEATS 상수.
export const EMPLOYEE_TO_ROLE: Record<string, Role> = {
  pm: 'PM',
  'dev-1': 'Engineer',
  'dev-arch': 'Architect',
  'planner-1': 'Planner',
  'qa-1': 'QA',
  'utility-1': 'Utility',
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
