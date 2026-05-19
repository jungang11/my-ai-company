// 화이트보드 sprite — 회의실 위쪽에 부착. 흰 면 + 프레임 + 텍스트 dot.
// 출처: docs/skills/pixel-office-design.md 가구 디테일 - 화이트보드.

type Props = {
  x: number;
  y: number;
};

export function Whiteboard({ x, y }: Props) {
  return (
    <div
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
    >
      <svg viewBox="0 0 28 8" width="90" height="26" shapeRendering="crispEdges">
        <rect x="0" y="0" width="28" height="8" fill="#94a3b8" />
        <rect x="1" y="1" width="26" height="6" fill="#f8fafc" />
        {/* 텍스트 dot — 두 줄 */}
        <rect x="3" y="3" width="3" height="1" fill="#1e293b" />
        <rect x="7" y="3" width="2" height="1" fill="#3b82f6" />
        <rect x="10" y="3" width="4" height="1" fill="#1e293b" />
        <rect x="15" y="3" width="2" height="1" fill="#f43f5e" />
        <rect x="3" y="5" width="5" height="1" fill="#1e293b" />
        <rect x="9" y="5" width="3" height="1" fill="#10b981" />
        <rect x="13" y="5" width="2" height="1" fill="#1e293b" />
      </svg>
    </div>
  );
}
