---
name: audio-design
description: 카이로소프트 게임 톤 BGM/SFX 디자인 가이드 — 사무실 ambient, 분기 시작/회고/일감 spawn SFX, 라이센스 안전 audio 자료, Electron audio API 패턴
status: research
applies_to: app/src/renderer/src/components/pixel-office/* (audio overlay), Phase 6+ (사장 결정 후 실제 audio 도입)
last_updated: 2026-05-19
---

# Audio Design

## 컨셉

payroll-os 사무실의 카이로소프트 톤 audio. 시각(`pixel-office-design`)이 카이로의 외형이라면, audio는 카이로의 정체성을 완성. Game Dev Story / Manga Works의 BGM은 사장 직접 경험을 결정짓는 요소.

## 핵심 원칙

> 본문은 리서치 agent가 채워 넣음. 현재 status=research, 본문 미완.

## 리서치 항목 (agent 작업 분해)

### 1. 카이로소프트 BGM 톤 분석
- Game Dev Story / Manga Works / Hot Springs Story 등 시리즈별 BGM 분위기
- 공통 톤: 칩튠? 8-bit? 16-bit?
- 사무실/시설 ambient vs 회의/이벤트 시 곡 차이
- BPM 범위, 키, 악기 구성

### 2. 카이로 SFX 분류
- 일감 완료 (직원 작업 끝) SFX
- 분기 시작/종료 SFX
- 회의 모드 진입 SFX
- 알림 (사장 메시지 도착) SFX
- 직원 spawn SFX
- 화이트보드/책상 등 환경 sfx

### 3. 라이센스 안전 영역
- **카이로 게임 원본 BGM/SFX**: 저작권. 직접 사용 절대 금지. 톤만 참고.
- **CC0 audio 자료**: freesound.org (CC0 필터), Kenney audio kit, OpenGameArt CC0
- **CC-BY audio**: NOTICE 필수
- **본인 작곡 chiptune**: 라이센스 자유. BeepBox / OpenMPT 같은 tracker.

### 4. 오픈소스 audio 자료
- Kenney Game Audio (CC0): https://kenney.nl/assets?q=audio
- freesound.org (CC0 필터)
- itch.io 무료 chiptune 팩
- OpenGameArt audio (CC0/CC-BY 필터)
- ZapSplat (회원가입 필요, 무료 plan)

### 5. Electron audio 구현 패턴
- HTML5 `<audio>` 태그 vs Web Audio API
- BGM loop (gapless)
- SFX overlay (즉시 재생)
- 볼륨 컨트롤 + mute 토글
- 파일 위치 (`app/src/renderer/public/audio/`?)
- 메모리 사용량 (preload vs lazy)

### 6. 사용자 UX 고려사항
- 첫 시작 시 audio 자동 재생 X (사장이 토글)
- 볼륨 슬라이더 (StatusBar 또는 모달)
- 회의 모드 전환 시 BGM 곡 변경 (또는 페이드)
- 분기 시작/회고 시 짧은 SFX cue

### 7. 작곡 vs 차용 결정
- 카이로 톤 직접 작곡 (BeepBox 같은 web 도구 또는 trackers) — 시간 비용 큼, 라이센스 자유
- CC0 자료 차용 — 빠름, 톤 일관성 낮음, NOTICE 가능
- 하이브리드: BGM은 작곡, SFX는 CC0

### 8. payroll-os에 도입 시 우선순위
- BGM ambient (사무실 idle 시) — 가장 분위기 결정적
- 일감 완료 SFX (`done` 시점) — 즉시 만족감
- 분기 시작/종료 SFX — 사이클 cue
- 회의/회고 모드 진입 SFX — 모드 전환 강조

## 리서치 요약

> agent 리서치 완료 후 채움.

## 적용 패턴

> agent 리서치 완료 후 채움. Electron audio API 코드 예시 포함.

## 라이센스 / 출처

> agent 리서치 완료 후 채움.

## 알려진 한계

- 본 skill은 audio 톤/SFX 분류만 다룬다. 실제 도입은 사장 결정 후 별도 PR.
- 카이로 BGM 직접 차용 X — 톤 분석/작곡 가이드만.

## 다음 라운드 후보 (skill stable 이후)

- payroll-os에 실제 BGM/SFX 도입 (PR1 ambient → PR2 SFX → PR3 볼륨 컨트롤)
- audio asset 작곡 또는 차용 결정
- accessibility (mute 강제, prefers-reduced-motion 같은 OS 신호 존중)
