/**
 * PM(또는 다른 상위 직원)이 sub 세션을 부르기 위한 파일 기반 프로토콜.
 *
 * 흐름:
 *  1. PM이 `workspace/spawn-request/<id>.json`을 작성 (SpawnRequest 형식)
 *  2. app(main process)이 chokidar로 그 폴더를 watch → 새 파일 감지
 *  3. 정의된 직원(`core/employees/<employeeId>.json`)을 `claude` CLI로 spawn
 *  4. sub 세션은 `workspace/sessions/<sessionId>/output.log`에 출력 append
 *  5. 종료 시 `workspace/sessions/<sessionId>/done` 마커 파일 생성
 *  6. PM은 이 output/done을 read해서 사장에게 보고 (PR7)
 */

export const SPAWN_REQUEST_DIR = 'workspace/spawn-request';
export const SESSIONS_DIR = 'workspace/sessions';
export const DONE_MARKER_NAME = 'done';
export const OUTPUT_LOG_NAME = 'output.log';

export type SpawnRequest = {
  /** 요청 식별자 (생성 시 PM이 UUID로 채움). 세션 디렉토리 이름으로도 사용. */
  id: string;

  /** core/employees/<employeeId>.json 의 employeeId */
  employeeId: string;

  /** 그 직원에게 시킬 일감 (user 메시지로 들어감) */
  prompt: string;

  /** PM이 작성한 시각 (ISO 8601). 디버깅용. */
  createdAt: string;
};

export function spawnRequestSchemaHint(): string {
  return [
    '{',
    '  "id": "<uuid>",',
    '  "employeeId": "dev-1",',
    '  "prompt": "<일감 한 문단>",',
    '  "createdAt": "<ISO 8601>"',
    '}',
  ].join('\n');
}
