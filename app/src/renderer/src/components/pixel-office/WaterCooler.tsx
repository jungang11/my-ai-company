// 식수기 sprite — 위 푸른 통 + 아래 회색 본체 + 컵 받침.
// 출처: docs/skills/pixel-office-design.md 가구 디테일 - 식수기.

type Props = {
  x: number;
  y: number;
};

export function WaterCooler({ x, y }: Props) {
  return (
    <div
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
    >
      <svg viewBox="0 0 8 14" width="32" height="56" shapeRendering="crispEdges">
        {/* 위 푸른 통 (물) */}
        <rect x="1" y="0" width="6" height="5" fill="#bae6fd" />
        <rect x="1" y="0" width="6" height="1" fill="#7dd3fc" />
        <rect x="0" y="4" width="8" height="1" fill="#0ea5e9" />
        {/* 본체 */}
        <rect x="1" y="5" width="6" height="7" fill="#cbd5e1" />
        <rect x="1" y="5" width="6" height="1" fill="#94a3b8" />
        {/* 꼭지 */}
        <rect x="3" y="7" width="2" height="1" fill="#1e293b" />
        {/* 컵 받침 */}
        <rect x="0" y="12" width="8" height="2" fill="#94a3b8" />
      </svg>
    </div>
  );
}
