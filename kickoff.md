# Phase 0 킥오프: 리서치 & 의사결정

이 문서는 my-ai-company 프로젝트의 **첫 번째 작업 지시서**다.
사장(사용자)이 너에게 안건만 던지고, 너는 리서치/판단/결정을 수행한다.

먼저 `README.md`와 `CLAUDE.md`를 읽고 컨셉을 완전히 이해한 다음 시작하라.

---

## 미션

> "여러 오픈소스 프로젝트들의 좋은 점만 쏙쏙 가져와서, my-ai-company의
> Phase 1 MVP를 위한 채택안을 결정한다."

너는 사장이 아니라 **수석 엔지니어** 역할이다. 사장에게 모든 옵션을
나열해서 고르라고 하지 말 것. **본인이 결정하고, 결정의 근거와 함께
보고**하라. 사장은 반대할 권리만 행사한다.

---

## 작업 절차

### Step 1. references 클론

```bash
mkdir -p references
cd references
git clone --depth 1 https://github.com/generalaction/emdash.git
git clone --depth 1 https://github.com/rustykuntz/clideck.git
git clone --depth 1 https://github.com/hummer98/cmux-team.git
git clone --depth 1 https://github.com/microsoft/conductor.git
cd ..
```

`.gitignore`에 `references/`가 포함되어 있는지 확인. 없으면 추가.

### Step 2. 각 reference 정독

각 repo에 대해 다음을 파악:

1. **무엇을 푸는 프로젝트인가** (1-2문장)
2. **핵심 아키텍처** — 어떤 언어/프레임워크, 디렉토리 구조, 진입점
3. **CLI subprocess 관리 방식** — pty? child_process? tmux? Docker?
   상태 감지(idle/working)는 어떻게 하는가?
4. **다중 세션 간 통신** — 어떻게 한 에이전트의 출력을 다른 에이전트에
   전달하는가? (파일? IPC? 메모리?)
5. **사용자 인터페이스** — Electron? Tauri? TUI? 웹?
6. **라이센스** — 정확히 확인 (MIT/Apache/기타)
7. **활동성** — 최근 커밋 날짜, 메인테이너 수 정도만

정독은 깊게 가지 말고, **README + 진입점 파일 1~2개 + 핵심 모듈 1개**
정도면 충분. 한 repo당 10~15분 이내.

### Step 3. 비교표 작성

`docs/references-comparison.md` 파일을 만들어 다음 표를 채워라:

| 항목 | emdash | clideck | cmux-team | conductor |
|---|---|---|---|---|
| 한 줄 요약 | | | | |
| 언어/스택 | | | | |
| GUI 방식 | | | | |
| pty 처리 | | | | |
| 상태 감지 | | | | |
| 세션 간 라우팅 | | | | |
| 라이센스 | | | | |
| my-ai-company에 가져올 만한 패턴 | | | | |
| 가져오지 않을 부분 | | | | |

### Step 4. 채택 결정

`docs/architecture-decision.md` 파일을 만들어 다음을 결정:

1. **기술 스택** (Electron vs Tauri, Node vs Python 백엔드, 등)
   - 결정 + 근거 3줄
2. **GUI 베이스로 어느 reference를 가장 많이 참고할지** (하나만 고를 것)
3. **CLI subprocess 관리: 어느 reference의 패턴을 차용할지**
4. **세션 간 라우팅(인수인계): 어느 reference의 패턴을 차용할지**
5. **공유 게시판/메시징: 파일 기반? SQLite? 둘 다?**
6. **Phase 1에서 안 가져올 것들** (예: 멀티 계정 분산은 나중에)

각 결정은 **단호하게 한 줄로**. "A 또는 B 중 사장이 선호하는 것" 같은
유보 금지.

### Step 5. Phase 1 작업 분해

`docs/phase1-plan.md` 파일을 만들어, Phase 1을 5~8개의 작은 PR 단위로
쪼개라. 각 PR은:

- 제목 (커밋 메시지 컨벤션 따름)
- 변경 파일 목록 (예상)
- 완료 기준 (1줄)
- 예상 작업량 (S/M/L)

첫 번째 PR은 반드시 **"빈 Electron(또는 Tauri) 앱이 떠서 'Hello, boss'가
화면에 보이는 것"** 수준의 가장 작은 단위로 시작.

### Step 6. 사장에게 보고

위 3개 문서가 만들어진 시점에서 작업을 멈추고, 사장에게 다음 형식으로
보고하라:

```
## 리서치 완료

### 비교 결과 요약 (3줄)
- ...

### 결정 사항 (5줄)
- 스택: ...
- GUI 베이스: ...
- subprocess: ...
- 라우팅: ...
- 보드: ...

### Phase 1 첫 PR
- 제목: ...
- 범위: ...
- 예상 작업량: ...

### 사장이 확인해줄 것
- (만약 사장 결정이 꼭 필요한 항목이 있다면 1~2개만)

이대로 진행할까요? (반대 없으면 첫 PR 작업 들어갑니다)
```

---

## 행동 규칙

- **사장에게 옵션을 늘어놓지 말 것.** 본인이 정해서 통보.
- **3개 이상 질문하지 말 것.** 사장은 PM 짓을 싫어함. 진짜 막혔을 때만
  질문하되 한 번에 최대 2개까지.
- **references 코드를 통째로 복붙하지 말 것.** 패턴만 이해하고 본인 손으로.
- **이 문서의 모든 Step을 끝낸 뒤 보고할 것.** 중간에 한 Step씩 보고하지
  말 것. 사장은 진행 중간보다 결과 보고를 선호.
- **모르는 게 있으면 추측하지 말고 web search.** 단, 사장에게 검색
  결과를 늘어놓지 말고 본인이 결론까지 내릴 것.

---

## 끝.

자, 시작.
