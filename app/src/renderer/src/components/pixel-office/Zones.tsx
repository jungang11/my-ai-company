// 바닥 zone overlay — 회의실(yellow 따뜻한 톤) + 휴게실(green 액센트).
// 출처: docs/skills/pixel-office-design.md 패턴 D.
type Props = {
  meetingMode: boolean;
};

export function Zones({ meetingMode }: Props) {
  return (
    <>
      <div
        className="pointer-events-none absolute rounded-sm transition-all duration-500"
        style={{
          left: '66%',
          top: '10%',
          width: '30%',
          height: '36%',
          background: '#fef9c3',
          opacity: meetingMode ? 0.85 : 0.55,
          boxShadow: meetingMode
            ? 'inset 0 0 0 2px #10b981cc'
            : 'inset 0 0 0 1px #fbbf24aa',
        }}
        aria-label="회의실"
      />
      <div
        className="pointer-events-none absolute text-[9px] font-medium text-amber-800"
        style={{ left: '68%', top: '11%' }}
      >
        회의실 {meetingMode && <span className="text-emerald-700">· 회의 중</span>}
      </div>

      <div
        className="pointer-events-none absolute rounded-sm"
        style={{
          left: '70%',
          top: '58%',
          width: '26%',
          height: '30%',
          background: '#dcfce7',
          opacity: 0.55,
          boxShadow: 'inset 0 0 0 1px #10b98199',
        }}
        aria-label="휴게실"
      />
      <div
        className="pointer-events-none absolute text-[9px] font-medium text-emerald-800"
        style={{ left: '72%', top: '59%' }}
      >
        휴게실
      </div>
    </>
  );
}
