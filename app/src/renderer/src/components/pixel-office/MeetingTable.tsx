// 회의 테이블 sprite — 큰 wood 사각, 둘레 4개 의자 dot, 가운데 문서 더미.
// 출처: docs/skills/pixel-office-design.md 가구 디테일 - 회의 테이블.

type Props = {
  x: number;
  y: number;
};

export function MeetingTable({ x, y }: Props) {
  return (
    <div
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
    >
      <svg viewBox="0 0 24 18" width="100" height="75" shapeRendering="crispEdges">
        {/* 의자 4개 (둘레) */}
        <rect x="10" y="0" width="4" height="2" rx="0.5" fill="#1e293b" />
        <rect x="10" y="16" width="4" height="2" rx="0.5" fill="#1e293b" />
        <rect x="0" y="7" width="2" height="4" rx="0.5" fill="#1e293b" />
        <rect x="22" y="7" width="2" height="4" rx="0.5" fill="#1e293b" />

        {/* 테이블 wood */}
        <rect x="3" y="3" width="18" height="12" fill="#a16207" />
        <rect x="3" y="14" width="18" height="1" fill="#78350f" />
        <rect x="3" y="3" width="18" height="1" fill="#fbbf24" opacity="0.35" />

        {/* 가운데 문서 더미 + 펜 */}
        <rect x="9" y="7" width="4" height="3" fill="#fef3c7" />
        <rect x="9" y="7" width="4" height="1" fill="#94a3b8" />
        <rect x="14" y="9" width="3" height="1" fill="#1e293b" />
      </svg>
    </div>
  );
}
