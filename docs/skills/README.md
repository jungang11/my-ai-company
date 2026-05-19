# Skills

이 폴더는 payroll-os 개발 시 **시각·디자인·UX·domain-specific 영역**에서 깊이가 필요한 작업을 위한 **리서치 기반 재사용 가이드** 모음입니다.

## 왜 skills인가

본인 감으로 흉내내면 표면적 모방에 머무름. 깊은 리서치 + 정착 문서가 있어야:
- 다음 PR/세션이 같은 영역을 다룰 때 처음부터 다시 리서치 안 함
- 톤·패턴·라이센스 안전 영역이 한 곳에 모임
- 사장 review 비용 절감 (한 번 OK 받은 skill은 다음에 재참조)

## 언제 skill을 만드는가

**모든 PR에 skill 필요 X.** 다음 조건 중 하나일 때만 신규:

1. 사장이 명시적으로 "리서치 → 정착" 지시.
2. 같은 영역(시각/디자인/특정 domain)을 **두 번 이상** 다룰 예정.
3. 본인이 1회 시도 후 "감 부족"이라 판단 + 사장 검토에서 NG/약함 평가.

조건 안 맞으면 그냥 PR 직진. skill 남발 X.

## 형식

```markdown
---
name: <kebab-case-name>
description: <한 줄 요약 — 다음 세션이 skill 찾을 때 쓰는 신호>
status: draft | research | stable
applies_to: <어떤 영역/컴포넌트/PR에 적용되는지>
last_updated: YYYY-MM-DD
---

# <Title>

## 핵심 원칙
<3~5개 bullet — skill의 본질>

## 리서치 요약
<출처별 핵심 발췌>

## 적용 패턴
<코드/디자인/디테일 패턴들>

## 라이센스 / 출처
<자료 출처 + 라이센스 안전 영역>

## 알려진 한계
<이 skill로 못 푸는 영역, 다음 라운드 후보>
```

## 인덱스

| skill | 상태 | 적용 영역 | 마지막 갱신 |
|---|---|---|---|
| [pixel-office-design](pixel-office-design.md) | stable | `app/src/renderer/src/components/pixel-office/*`, Phase 4 PR2.1~2.4 적용 완료 | 2026-05-19 |
| [audio-design](audio-design.md) | research-complete | 카이로 톤 BGM/SFX, Electron audio API. agent 리서치 완료, 사장 검토 도장. Phase 6+ 도입 안건 | 2026-05-19 |

## 사용 흐름

1. **새 PR 시작** — 해당 영역의 skill 있는지 인덱스 확인.
2. **있으면** skill 본문을 읽고 적용 패턴 따름. 부족하면 한 번에 skill 갱신 + PR 진행.
3. **없으면** PR 우선 진행. 시각·디자인 깊이 부족하면 그때 skill 신규.
4. **status: research** = 리서치 진행 중. 본문 비어 있을 수 있음. agent/사장이 채울 때까지 PR 적용 보류 또는 1차 갈아엎기 베이스로만 사용.
5. **status: stable** = 본문 완성 + 한 번 PR 적용 성공. 그 이후 변경은 skill 갱신과 함께.
