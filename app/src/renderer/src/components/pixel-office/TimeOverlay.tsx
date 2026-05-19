// 시간대별 사무실 분위기 overlay — 아침/낮/노을/밤.
// 출처: docs/skills/pixel-office-design.md 다음 라운드 후보 - 시간 흐름.

export type TimeOfDay = 'morning' | 'day' | 'sunset' | 'night';

const OVERLAY: Record<TimeOfDay, { color: string; opacity: number; label: string; emoji: string }> = {
  morning: { color: '#fef3c7', opacity: 0.18, label: '아침', emoji: '🌅' },
  day: { color: 'transparent', opacity: 0, label: '낮', emoji: '☀' },
  sunset: { color: '#f97316', opacity: 0.22, label: '노을', emoji: '🌇' },
  night: { color: '#0c1a3a', opacity: 0.4, label: '밤', emoji: '🌙' },
};

type Props = {
  timeOfDay: TimeOfDay;
};

export function TimeOverlay({ timeOfDay }: Props) {
  const o = OVERLAY[timeOfDay];
  return (
    <div
      className="pointer-events-none absolute inset-0 transition-all duration-1000"
      style={{ background: o.color, opacity: o.opacity, mixBlendMode: 'multiply' }}
      aria-hidden
    />
  );
}

export function timeOfDayLabel(t: TimeOfDay): string {
  return `${OVERLAY[t].emoji} ${OVERLAY[t].label}`;
}

export function fromHour(h: number): TimeOfDay {
  if (h >= 6 && h < 9) return 'morning';
  if (h >= 9 && h < 18) return 'day';
  if (h >= 18 && h < 21) return 'sunset';
  return 'night';
}

export const TIME_CYCLE: readonly TimeOfDay[] = ['morning', 'day', 'sunset', 'night'];
