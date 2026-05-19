---
name: pixel-office-design
description: 카이로소프트 게임 톤(Game Dev Story / 만지작 만지작 류) 탑다운 픽셀 사무실 디자인 가이드 — sprite 비례, 색 팔레트, 가구 디테일, 애니메이션 패턴, 오픈소스 자료
status: research
applies_to: app/src/renderer/src/components/PixelOffice.tsx, Phase 4 PR2 이상 (5명 책상 배치 / 회의실 / 휴게실 / walk cycle)
last_updated: 2026-05-19
---

# Pixel Office Design

## 컨셉

payroll-os의 사무실 뷰는 **카이로소프트(Kairosoft) 게임 톤**을 따른다. 본 skill은 그 톤을 본인 SVG/CSS 코드로 재현하기 위한 리서치 기반 가이드.

## 핵심 원칙

> 본문은 리서치 agent가 채워 넣음. 현재 status=research, 본문 미완. 1차 갈아엎기(`176c3bb`)는 감 기반 베이스라 정밀 적용은 본 skill stable 이후 PR2에서 진행.

## 리서치 항목 (agent 작업 분해)

리서치 agent는 다음 항목을 채워야 한다:

### 1. 카이로소프트 시리즈 톤 분석
- Game Dev Story
- 만지작 만지작 (Cafeteria Nipponica)
- 도쿄 미인 (Beastie Bay)
- 더 라멘 (Ramen Sensei)
- Manga Works
- Pocket Academy / Pocket Stables
- 게임별 공통 톤 / 차이 / 사무실/시설 시점 차이

### 2. 탑다운 픽셀 sprite 비례
- 머리 vs 몸통 비율 (SD 비례)
- sprite 사이즈 표준 (16×16 / 24×24 / 32×32 / 48×48)
- 머리카락 표현 방식 (위에서 본 시점)
- 어깨/팔/다리 가시성 (탑다운에선 다리 보통 안 보임)

### 3. 색 팔레트
- 따뜻한 cream/베이지 floor 색
- wood brown desk
- 캐릭터 skin / hair / shirt 채도 범위
- 명도/채도 한계 (너무 vivid X, 너무 dull X)

### 4. 사무실 가구 디테일
- 책상 (모니터, 키보드, 마우스, 컵)
- 의자 (스윙체어, 회의 의자)
- 회의 테이블 (회의 prefix 시 모이는 위치)
- 화이트보드, 책장
- 식수기 / 휴게실 / 정수기
- 출입문 / 벽 / 창문

### 5. 캐릭터 애니메이션 패턴
- idle (앉아 있음 — 미세 호흡 / 깜빡임)
- working (타이핑 — 머리 미세 bobbing 또는 손 깜빡임 또는 모니터 텍스트)
- walk (책상 ↔ 회의실 ↔ 휴게실 이동)
- thinking (머리 위 ? 풍선)
- talking (회의 시 말풍선)
- sit-stand 전환

### 6. 오픈소스 sprite 자료
- Kenney.nl (CC0 픽셀 자료)
- OpenGameArt.org (CC-BY / CC0 라이센스 필터)
- itch.io 무료 픽셀 sprite 팩
- RPG Maker 호환 자료 (라이센스 주의)
- LPC (Liberated Pixel Cup) base sprite

### 7. 라이센스 안전 영역
- CC0 → 자유 사용 + NOTICE 불필요
- CC-BY → NOTICE 필요
- 비상업 라이센스 → 본 프로젝트는 개인용이지만 GitHub public이면 회피
- 카이로 게임 sprite **직접 복제 금지** (저작권). 톤만 참고.
- 본인 생성 sprite (SVG path 또는 CSS shape)는 라이센스 자유

### 8. SVG vs sprite sheet 비교
- SVG 장점: React 컴포넌트화 쉬움, vector라 scale 자유
- SVG 단점: 진짜 픽셀 아트 톤은 sprite sheet(PNG)가 더 자연
- 현 구현은 SVG. sprite sheet 도입 시 비용/이득 분석

## 적용 패턴

> agent 리서치 완료 후 채움.

## 라이센스 / 출처

> agent 리서치 완료 후 채움.

## 알려진 한계

- 본 skill은 **시각·정적 톤**만 다룬다. 게임 mechanic(시간 경과, 직원 성장, 자원 관리)은 별도 skill.
- walk cycle 애니메이션은 sprite sheet 도입 시점에 다시 검토 (SVG keyframe으로 충분한지).

## 1차 갈아엎기 회고 (`176c3bb`)

본인 감으로 만든 1차의 약점:
- 캐릭터 비례 — 카이로식 SD 비례 미달 가능 (머리 vs 몸통 비율 검증 필요)
- 색 팔레트 — amber 단색 + slate. 카이로는 더 alive한 다채로움
- 책상 detail — 모니터/키보드만. 컵/마우스/포스트잇 등 카이로 사무실 디테일 부재
- 애니메이션 — translateY -2px bobbing만. 카이로 톤은 더 활기참
- 사운드/음악 — 카이로 게임의 BGM/SFX 무시 (별도 skill 대상)

리서치 결과로 PR2에서 위 5개 영역 정밀 손댐.
