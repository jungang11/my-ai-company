import type { RateLimitInfo, StatusSnapshot } from '../shared/ipc.js';

/**
 * PR5 한도 임계 알림 — 거친 휴리스틱 버전.
 *
 * claude CLI stream-json은 정확한 사용률(%)을 주지 않으므로 quotaUsedRatio ≥ 0.8 대신
 * rate_limit_event의 status 전이를 임계 신호로 사용:
 *   allowed → allowed_warning(≈80% 임계) / limited / rejected 류.
 * 같은 (rateLimitType, status, reset 윈도우)에 대해 1회만 알림 — PM 응답이 다시
 * 같은 이벤트를 emit해도 재알림 안 됨. reset이 지나 새 윈도우가 열리면 다시 알림 가능.
 *
 * openai(Codex) 쪽 한도 추적은 PR4(vendor별 정밀 추적)에서 — Plus 한도는 헤더가 없어
 * 메시지 count 휴리스틱이 필요함.
 */
const alertedByType = new Map<string, string>();

export function detectQuotaAlert(snapshot: StatusSnapshot): string | null {
  for (const rl of snapshot.rateLimits) {
    if (rl.status === 'allowed' || rl.status === 'unknown') continue;
    const key = `${rl.status}::${rl.resetsAtMs}`;
    if (alertedByType.get(rl.type) === key) continue;
    alertedByType.set(rl.type, key);
    return buildAlertMessage(rl);
  }
  return null;
}

/** 테스트/재시작 시나리오용 — dedupe 상태 초기화. */
export function resetQuotaAlertState(): void {
  alertedByType.clear();
}

function typeLabel(type: string): string {
  if (type === 'five_hour') return '5h';
  if (type === 'seven_day') return '7d';
  return type;
}

function buildAlertMessage(rl: RateLimitInfo): string {
  const reset =
    rl.resetsAtMs > 0
      ? new Date(rl.resetsAtMs).toLocaleString('ko-KR', {
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '미상';
  return (
    `[system 알림: Claude 한도 경고]\n` +
    `rateLimitType=${typeLabel(rl.type)}, status=${rl.status}, reset=${reset}\n\n` +
    `사장에게 한 줄로 알려라: "Claude ${typeLabel(rl.type)} 한도 경고(${rl.status}) — reset ${reset}. ` +
    `무거운 위임은 보류 권장." catalog 전환(비상용)은 사장이 결정한다 — 네가 임의로 바꾸지 마라. ` +
    `사장이 직접 보낸 메시지가 아니라 app이 자동 주입한 신호다.`
  );
}
