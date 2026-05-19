// 휴게실 소파 sprite — 가죽 or 그린 패브릭, 등받이 1px highlight.
// 출처: docs/skills/pixel-office-design.md 가구 디테일 - 휴게실 소파.

type Props = {
  x: number;
  y: number;
};

export function Sofa({ x, y }: Props) {
  return (
    <div
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
    >
      <svg viewBox="0 0 20 8" width="80" height="32" shapeRendering="crispEdges">
        {/* 등받이 */}
        <rect x="0" y="0" width="20" height="2" fill="#15803d" />
        <rect x="0" y="0" width="20" height="1" fill="#22c55e" opacity="0.5" />
        {/* 시트 */}
        <rect x="0" y="2" width="20" height="5" fill="#166534" />
        <rect x="6" y="2" width="1" height="5" fill="#15803d" />
        <rect x="13" y="2" width="1" height="5" fill="#15803d" />
        {/* 다리 */}
        <rect x="1" y="7" width="1" height="1" fill="#0f172a" />
        <rect x="18" y="7" width="1" height="1" fill="#0f172a" />
      </svg>
    </div>
  );
}
