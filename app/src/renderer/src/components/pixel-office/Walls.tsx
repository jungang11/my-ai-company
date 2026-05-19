import { WALL } from './palette';

// 우드 패널 벽 + 우측에 입구(door gap). 출처: skill 패턴 (가구 디테일 - 벽).
export function Walls() {
  return (
    <>
      <div
        className="absolute left-0 right-0 top-0 h-3"
        style={{ background: WALL.base, boxShadow: `inset 0 -1px 0 ${WALL.accent}88` }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-3"
        style={{ background: WALL.base, boxShadow: `inset 0 1px 0 ${WALL.accent}66` }}
      />
      <div
        className="absolute bottom-0 left-0 top-0 w-3"
        style={{ background: WALL.base }}
      />
      <div
        className="absolute right-0 top-0 w-3"
        style={{ background: WALL.base, height: '40%' }}
      />
      <div
        className="absolute bottom-0 right-0 w-3"
        style={{ background: WALL.base, height: '40%' }}
      />
      <div
        className="absolute right-3 flex items-center text-[8px] font-medium text-amber-900"
        style={{ top: '45%' }}
      >
        ← 입구
      </div>
    </>
  );
}
