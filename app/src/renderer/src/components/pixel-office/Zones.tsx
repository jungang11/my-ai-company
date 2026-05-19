// 바닥 zone overlay — 회의실(yellow 따뜻한 톤) + 휴게실(green 액센트).
// 출처: docs/skills/pixel-office-design.md 패턴 D.
export function Zones() {
  return (
    <>
      <div
        className="pointer-events-none absolute rounded-sm"
        style={{
          left: '72%',
          top: '14%',
          width: '23%',
          height: '30%',
          background: '#fef9c3',
          opacity: 0.55,
          boxShadow: 'inset 0 0 0 1px #fbbf24aa',
        }}
        aria-label="회의실"
      />
      <div
        className="pointer-events-none absolute text-[9px] font-medium text-amber-800"
        style={{ left: '74%', top: '15%' }}
      >
        회의실
      </div>

      <div
        className="pointer-events-none absolute rounded-sm"
        style={{
          left: '72%',
          top: '56%',
          width: '23%',
          height: '30%',
          background: '#dcfce7',
          opacity: 0.55,
          boxShadow: 'inset 0 0 0 1px #10b98199',
        }}
        aria-label="휴게실"
      />
      <div
        className="pointer-events-none absolute text-[9px] font-medium text-emerald-800"
        style={{ left: '74%', top: '57%' }}
      >
        휴게실
      </div>
    </>
  );
}
