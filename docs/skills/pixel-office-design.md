---
name: pixel-office-design
description: 카이로소프트 게임 톤(Game Dev Story / 만지작 만지작 류) 탑다운 픽셀 사무실 디자인 가이드 — sprite 비례, 색 팔레트, 가구 디테일, 애니메이션 패턴, 회의 모드, 오픈소스 자료
status: stable
applies_to: app/src/renderer/src/components/pixel-office/*, Phase 4 PR2.1~2.9 (6직군+사장 / 회의 모드 walk+말풍선 / 시간 흐름 overlay)
last_updated: 2026-05-19
---

# Pixel Office Design

## 컨셉

payroll-os의 사무실 뷰는 **카이로소프트(Kairosoft) 게임 톤**을 따른다. 본 skill은 그 톤을 본인 SVG/CSS 코드로 재현하기 위한 리서치 기반 가이드.

## 핵심 원칙

카이로 톤의 본질은 "픽셀 해상도 자체"가 아니라 **밀도 + 따뜻한 채도 + 캐릭터의 행동성**에 있다. 다음 5개가 흔들리면 카이로 톤이 무너진다.

1. **"두 가지 시점 동거"가 카이로의 정체성.** 캐릭터는 거의 정면(front-facing, 눈/입이 보이는 ¾ 뷰), 바닥과 가구는 탑다운에 가까운 약-쿼터뷰(quasi-quarter view). 진짜 top-down이 아니다. 시점 충돌을 의도적으로 받아들이고 "정보 가독성"을 우선한 결과. 본 프로젝트의 현 SVG도 사실상 같은 컨벤션을 따라야 한다 (캐릭터 얼굴 보임 + 책상 위 모니터/키보드가 위에서 보이는 이중 시점).
2. **SD 비례는 약 2~2.5 head.** 머리가 몸통 전체와 비슷하거나 약간 더 크다. 다리는 거의 안 보이거나 짧은 stub. 본 프로젝트 현 캐릭터(16×16, 머리 6px / 몸통 4px ≈ 1.5 head)는 머리가 너무 작다 — 머리를 1~2px 키워야 카이로 비례에 닿는다.
3. **팔레트는 "따뜻한 cream + 채도 살아있는 액센트" 조합.** 바닥/벽은 cream/베이지/연한 우드, 가구는 mid-tone wood, 그 위에 캐릭터 셔츠가 채도 높은 단색(빨강/노랑/파랑/초록 한 톤)으로 튀어나오게. 절대 monochrome amber로 통일하지 말 것 — 현 1차의 가장 큰 약점.
4. **"한 칸에 디테일 하나 더"가 카이로 사무실 룩.** 책상 = 모니터+키보드+커피잔+포스트잇+서류더미 중 최소 3개. 빈 책상은 카이로 톤이 아니다. 디테일은 1~3px 짜리 점/사각형이면 충분 — 양이 톤을 만든다.
5. **캐릭터는 "항상 뭔가 하는 중".** 진짜 idle은 거의 없다. 타이핑 시 어깨 1px 위아래, 가끔 깜빡임, 머리 위 작은 아이콘(!/?/♪) 풍선. SVG keyframe만으로 충분히 재현 가능.

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

## 리서치 요약

### 1. 카이로 시리즈 톤 분석

| 게임 | 카메라 | 캐릭터 시점 | 특징 |
|---|---|---|---|
| Game Dev Story | 약-쿼터 탑다운 | 정면(¾) | 사무실 책상 격자 + 작은 PC 모니터, 채도 살아있는 셔츠. 카이로 톤의 원형 |
| Cafeteria Nipponica (만지작 만지작) | 쿼터뷰 | 정면 | 주방/홀 분리, 식기/요리 1~3px 디테일 풍부, 컬러 액센트가 음식 |
| Hot Springs Story | 쿼터뷰 (거의 isometric) | 정면 | 시설 타일이 게임에서 가장 강한 요소, 캐릭터는 조연 |
| Pocket Academy | 약-쿼터 탑다운 | 정면 | 교실 격자, 학생 머리 색으로 캐릭터 식별 |
| Pocket Stables | 쿼터뷰 | 정면 | 야외 + 시설 혼합, 자연 채도 추가 |
| Ramen Sensei | 쿼터뷰 | 정면 | 좁은 공간 + 디테일 밀도 최대치 |
| Manga Works | 약-탑다운 | 정면 | 사무실/스튜디오 환경 — payroll-os와 가장 유사한 톤 |

**공통점:** (a) 약-쿼터뷰 시점 통일 — 진짜 top-down도 진짜 iso도 아님, (b) 캐릭터는 항상 정면 ¾로 얼굴 보임, (c) 셔츠 색이 캐릭터 식별자, (d) 가구 디테일 밀도가 높음, (e) 시간 흐름이 시각에서 거의 느껴지지 않는 정적 화면 (캐릭터만 미세 애니메이션).
**차이점:** 시설형(Hot Springs, Cafeteria)은 시설 타일 자체가 주연, 사무실형(Game Dev, Manga Works, Pocket Academy)은 캐릭터+책상이 주연. payroll-os는 **사무실형**을 따라야 한다.

[Kairosoft Wiki](https://kairosoft.wiki.gg/), [TV Tropes: Kairosoft](https://tvtropes.org/pmwiki/pmwiki.php/Creator/Kairosoft), [Cafeteria Nipponica Review (TouchArcade)](https://toucharcade.com/2012/08/17/cafeteria-nipponica-review-a-deeper-flavor-from-kairosoft/), [Hot Springs Story (Pocket Gamer)](https://www.pocketgamer.com/hot-springs-story/hot-springs-story-android-iphone-ipad-29312/), [Pocket Academy (Pocket Gamer)](https://www.pocketgamer.com/pocket-academy/pocket-academy-review/), [Pixel Joint: Isometric Kairosoft-style sprite job](https://pixeljoint.com/forum/forum_posts.asp?TID=17047) — 외부에서도 "카이로 스타일"이 통용되는 명사임을 확인.

### 2. 탑다운 sprite 비례

- **카이로 표준 sprite는 대략 16×24 또는 16×20** (1 tile wide × 1.25~1.5 tile tall). 본 프로젝트 16×16은 사실 다리를 잘라낸 "상반신 카이로". 그대로 가도 사무실 톤은 성립 — 책상에 앉은 상태가 default이므로 다리 컷이 자연스러움.
- **머리 vs 몸 비율:** 약 1:1 ~ 1:1.5. SD/chibi 정의는 일반적으로 2~4 head ([CLIP STUDIO TIPS](https://tips.clip-studio.com/en-us/articles/4806)), 카이로는 그 중 가장 deformed한 2~2.5 head.
- **얼굴 디테일:** 눈만 1×1 또는 2×1px 두 개, 입은 보통 생략. 머리카락이 머리 둘레의 50% 이상 차지하며 색으로 캐릭터 구분.
- **어깨/팔:** 어깨는 머리보다 약간 넓거나 비슷, 팔은 양 옆 1~2px stub. 책상에 앉은 시점이면 손은 키보드 위 sprite로 합쳐도 됨.
- **다리:** 사무실 시점에선 거의 안 보임 (책상이 가림). 걷는 sprite에서만 stub 다리 2개 등장.

[Slynyrd Pixelblog 22 — Top Down Character Sprites](https://www.slynyrd.com/blog/2019/10/21/pixelblog-22-top-down-character-sprites): 탑다운에선 머리 위에 밝게, 다리/발 부근에 어둡게. 얼굴은 머리 아래쪽에 배치해 "정면감" 유지.
[Sandro Maglione — Top-down pixel art](https://www.sandromaglione.com/articles/pixel-art-top-down-game-sprite-design-and-animation): 1 tile wide × 2 tile tall이 표준.
[Pixnote — Game Assets](https://pixnote.net/en/learn/game-assets/): 16/24/32/64 중 16과 32가 산업 표준.

### 3. 색 팔레트

카이로 톤은 단일 공식 팔레트가 공개돼 있지 않지만, 다음 영역에서 추출할 수 있다:

| 역할 | 색 코드 (제안) | 근거 |
|---|---|---|
| Floor (light tile) | `#fef3c7` (cream) | 현 구현, 카이로 사무실 cream 톤과 부합 |
| Floor (dark tile) | `#fde68a` (light amber) | 체커보드 음영 |
| Floor grout | `#fbbf24` (amber-400, opacity 0.3) | 타일 경계 |
| Wall (top/bottom) | `#92400e` (amber-900) | 우드 패널 |
| Wall accent (창문 프레임) | `#fbbf24` | 따뜻한 액센트 |
| Desk wood | `#a16207` (yellow-700) | mid-tone wood |
| Desk edge | `#78350f` (amber-950) | 그림자 |
| Monitor frame | `#1e293b` (slate-800) | 채도 낮은 어두운 회색 |
| Monitor screen | `#0f172a` + `#34d399` (작업 시) | 카이로 모니터는 보통 어두운 화면 + 채도 높은 텍스트 |
| Keyboard | `#cbd5e1` (slate-300) | 밝은 회색 |
| Skin (light) | `#fde68a` | 현 구현 유지 OK |
| Skin shade | `#fbbf24` | 턱 그림자 |
| Hair (캐릭터별 다양화) | `#451a03` / `#7c2d12` / `#1e3a8a` / `#374151` | 갈색/적갈/네이비/검정 |
| Shirt 액센트 (역할별) | PM `#f59e0b` (amber), Eng `#3b82f6` (blue), Designer `#ec4899` (pink), QA `#10b981` (emerald), Ops `#a855f7` (violet) | 카이로의 "셔츠로 식별" 패턴 |

**원칙:**
- 명도 범위 약 30%~95% (HSL L 기준). 30% 아래는 음영용만, 95% 위는 highlight 1px만.
- 채도: 바닥/벽은 30~60% (warm), 셔츠/모니터 텍스트는 60~85%로 튀게. 90% 이상 vivid는 카이로 톤이 아님.
- 카이로는 절대 monochrome 아님. 본 프로젝트 1차의 amber 단색 통일은 실수.

참고: [Lospec Sweetie 16 (GrafxKid)](https://lospec.com/palette-list/sweetie-16) — 카이로와 가장 가까운 16색 팔레트, [Endesga Soft 16](https://lospec.com/palette-list/endesga-soft-16) — 채도 낮춘 16색, 카이로 톤의 정적 분위기에 잘 맞음.

### 4. 사무실 가구 디테일

각 가구의 "한 칸에 디테일 하나 더" 카이로 룰 적용 예 (모두 본 프로젝트가 SVG path로 직접 그릴 영역, 외부 sprite 복제 X):

- **책상 (top-down):** 24×16px 정도, wood plank 두 줄 (`#a16207` + `#92400e` 1px line). 위에:
  - 모니터: 6×4px frame (`#1e293b`) + 4×2px screen (`#0f172a`). working 시 `#34d399` 텍스트 1~2px.
  - 키보드: 8×1px (`#cbd5e1`) + key dot 1px 4개 (`#94a3b8`).
  - 마우스: 2×2px (`#1e293b`) + 1px wire to 모니터.
  - 커피잔: 2×3px (`#fef3c7` 잔 + `#78350f` 커피 1px). 현 구현 결정적으로 빠짐.
  - 포스트잇: 2×2px 노란/분홍 정사각형 1~2개 (`#fcd34d` / `#f9a8d4`).
- **의자:** 6×4px 둥근 사각 (`#1e293b` or `#7c2d12`). 책상 아래쪽으로 머리 위치를 1~2px 내리면 "앉아 있음"이 표현됨.
- **회의 테이블:** 16×24px 또는 24×16px 큰 wood 사각, 둘레 4~6개 의자 배치. 가운데 보드/문서 1~2px 더미.
- **화이트보드:** 24×4px `#f8fafc` 흰 사각 + `#94a3b8` 프레임 1px + `#1e293b` 텍스트 dot 5~8개. 벽 면에 부착.
- **책장:** 8×16px 세로 사각, 책등 1×3px 막대 6~8개 (`#7c2d12` / `#1e3a8a` / `#92400e` 등 채도 다른 색 교대).
- **식수기 (워터쿨러):** 4×8px, 위쪽 6×4px 푸른 통(`#bae6fd`), 아래 통(`#cbd5e1`), 컵 받침 1px (`#94a3b8`).
- **휴게실 소파:** 16×6px, `#7c2d12` (가죽) 또는 `#15803d` (그린 패브릭). 등받이 1px 위로 더.
- **문:** 6×8px 세로 사각, `#78350f` 우드 + `#fbbf24` 손잡이 1×1px.
- **창문:** 8×6px `#bae6fd` 하늘 + `#fbbf24` 프레임 + `#fef3c7` 살 십자 1px.
- **벽:** 우드 패널 + 위쪽 2px highlight `#fbbf24` opacity 0.3. 현 구현 amber-900 단색 너무 무거움.

### 5. 캐릭터 애니메이션 패턴

SVG keyframe만으로 충분히 카이로감 재현 가능. 모두 CSS `@keyframes` + `transform: translate/scale`:

| 상태 | 애니메이션 | 권장 duration |
|---|---|---|
| idle | translateY(0 ↔ -0.5px), 호흡 | 1800ms ease-in-out infinite |
| working (타이핑) | translateY(0 ↔ -1px) + 양 손 1px 좌우 jitter | 200ms infinite |
| thinking | 머리 위 `?` 풍선 fade-in/out + scale(0.9 ↔ 1.0) | 1500ms |
| talking | 말풍선 `...` 한 점씩 등장 | 800ms |
| walk (PR3+) | sprite swap (2-frame), 8-bit JRPG와 동일하게 idle/walk 공유 가능 | 400ms |
| sit-stand 전환 | translateY 4px (의자 위 → 옆에 서기) + scale 1.0 → 1.05 | 300ms |

[Slynyrd Pixelblog 8 — Intro to Animation](https://www.slynyrd.com/blog/2018/8/19/pixelblog-8-intro-to-animation): 1px 수직 이동 + 500ms 유지가 "살아 있는" 톤의 최소 비용. 2-frame walk + 8-bit JRPG식 idle 공유 패턴 ([Sprite-AI](https://www.sprite-ai.art/blog/sprite-animation-frames)).

### 6. 오픈소스 sprite 자료

| 자료 | URL | 라이센스 | 카이로 톤 적합도 |
|---|---|---|---|
| Kenney Furniture Kit | https://kenney.nl/assets/furniture-kit | CC0 | 중 (3D 톤 강함, 2D 톱다운 일부) |
| Kenney 전체 | https://kenney.nl/assets | CC0 | 참고용 |
| LPC Base Assets | https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles | CC-BY-SA 3.0 + GPL 3.0 | 중 (RPG 톤, 카이로는 SD라 비례 안 맞음) |
| LPC Character Bases | https://opengameart.org/content/lpc-character-bases | CC-BY-SA / OGA-BY | 위와 동일 |
| Pixel Office Asset Pack (2dPig) | https://2dpig.itch.io/pixel-office | CC0 | 중상 (사무실 가구 reference로 우수) |
| Pixel Life: Office Essentials (Chris Perich) | https://christianperich.itch.io/pixel-life-office-essentials | 무료, 상업 OK | 중상 |
| Cainos Pixel Art Top Down — Basic | https://cainos.itch.io/pixel-art-top-down-basic | 무료 | 하 (판타지 RPG 톤) |
| Spriters Resource — Hot Springs Story | https://www.spriters-resource.com/mobile/hotspringstory/ | **저작권 보호**, 참고만 (직접 복제 X) | 카이로 sprite 직접 — **사용 금지, 톤 reference만** |

**결론:** payroll-os는 본인이 SVG path로 다시 그리는 정책 유지. 외부 sprite는 reference / 디테일 idea만. 만약 sprite sheet 도입 시 (PR3 이후 walk cycle 필요) **Kenney CC0**가 가장 안전한 출발점.

### 7. 라이센스 안전 영역

- **CC0**: 자유 사용, NOTICE 의무 없음. Kenney 전체가 여기. 본 프로젝트의 1순위 외부 자료 영역. ([Creative Commons](https://creativecommons.org/share-your-work/cclicenses/))
- **CC-BY**: 사용 자유, **NOTICE 필수** — 작품명/저자/라이센스/원본 링크 4종 명기. ([OpenGameArt FAQ](https://opengameart.org/content/faq))
- **CC-BY-SA**: NOTICE + **본 프로젝트도 같은 SA 라이센스로 공개해야 함** → payroll-os가 폐쇄 또는 다른 라이센스라면 사실상 금지. LPC가 SA라 주의.
- **CC-NC**: 비상업. 본 프로젝트가 personal use라 OK이긴 하나 GitHub public이면 회피 권장.
- **카이로 게임 원본 sprite**: 저작권 보호. **직접 복제/추출/리믹스 절대 금지**. 톤/비례/색감/배치 idea만 추출 — 본 skill의 모든 코드 예시가 이 원칙을 따름.
- **본인 생성 SVG path / CSS shape**: 라이센스 자유. payroll-os의 거의 모든 sprite는 이 영역에 둘 것.

NOTICE 운영: 만약 외부 sprite를 도입하면 `app/NOTICE.md` 또는 `docs/Project/NOTICE.md`에 표 형식으로 한 번에 관리. CC0는 표에 적지 않아도 무방하나 "감사" 의미로 적어두면 깔끔. ([OpenGameArt: Best practices](https://opengameart.org/forumtopic/best-practices-on-crediting-a-large-amount-of-assets))

### 8. SVG vs sprite sheet 비교

| 기준 | SVG (현 구현) | PNG sprite sheet |
|---|---|---|
| 픽셀 톤 정확도 | `shape-rendering="crispEdges"`로 비슷하나 안티앨리어싱 잔재 가능 | 진짜 픽셀 (1:1) |
| 파일 크기 | 인라인 시 작음, but inline path 누적되면 커짐 | PNG 압축 우수, 5명 sprite ~3KB 수준 |
| 런타임 비용 | 브라우저 layout/paint 비용. 캐릭터 5명 + 가구 30+ 시 측정 필요 | 단순 image draw, 거의 무료 ([DEV: PNG vs SVG](https://dev.to/svaani/png-sprites-perform-a-lot-better-than-svg-reports-attached-5agl)) |
| 코드 표현력 | React 컴포넌트화 자연, props로 색 변경 자유 (역할별 셔츠 색) | sprite atlas + offset, 색 변경은 별도 sprite 또는 canvas filter |
| 애니메이션 | CSS keyframe / transform 자유 | frame swap 필요, walk cycle은 자연 |
| 확대/축소 | vector 자유 | 정수배 scale 외엔 흐림 |
| Retina | 자동 선명 ([Sprite-AI](https://www.sprite-ai.art/guides/sprite-export-formats)) | @2x sprite 별도 |
| 카이로 톤 적합 | 색 변경/단순 idle엔 충분 | walk cycle / 다방향 / 고밀도 가구엔 우월 |

**판단:** PR2(5명 책상 + 가구 밀도 증가)까지는 **SVG 유지**. 가구 디테일은 SVG path로 표현 가능, 색 변경 자유라 역할별 셔츠 등 카이로 핵심 패턴이 더 쉽다. PR3+에서 **walk cycle + 다방향 sprite** 필요 시 sprite sheet 도입 검토. 이 시점 비용: (a) Aseprite로 sprite 새로 그리거나 Kenney CC0 차용, (b) sprite atlas 로더 + 좌표 관리 코드, (c) `image-rendering: pixelated` CSS로 정수배 scale 보장.

[MDN — shape-rendering](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/shape-rendering): `crispEdges`는 안티앨리어싱을 끄고 픽셀 경계를 유지. 본 프로젝트가 이미 적용.

## 적용 패턴

PR2에서 위 리서치를 코드에 반영할 구체 패턴.

### 패턴 A — 캐릭터 비례 보정 (현 16×16 유지)

머리 1px 키우고 어깨 1px 좁힘 → 카이로 2~2.5 head에 접근.

```tsx
// 머리 (현 6px 높이 → 7px)
<rect x="4" y="2" width="8" height="7" fill={SKIN} />
<rect x="3" y="3" width="10" height="5" fill={SKIN} />
// 어깨 (현 12px → 10px)
<rect x="3" y="10" width="10" height="4" fill={c.shirt} />
<rect x="4" y="11" width="8" height="3" fill={c.shirt} />
```

### 패턴 B — 역할별 셔츠 팔레트 (카이로 식별성)

payroll-os 회사 6직군에 맞춰 6색으로 확장. PR2.2에서 적용 완료(`8bab430`).

```ts
export type Role = 'PM' | 'Engineer' | 'Architect' | 'Planner' | 'QA' | 'Utility';

export const ROLE_PALETTE: Record<Role, { shirt: string; shirtDark: string; hair: string }> = {
  PM:        { shirt: '#f59e0b', shirtDark: '#b45309', hair: '#451a03' }, // amber
  Engineer:  { shirt: '#3b82f6', shirtDark: '#1d4ed8', hair: '#1e293b' }, // blue
  Architect: { shirt: '#a855f7', shirtDark: '#7e22ce', hair: '#1e3a8a' }, // violet
  Planner:   { shirt: '#10b981', shirtDark: '#047857', hair: '#374151' }, // emerald
  QA:        { shirt: '#f43f5e', shirtDark: '#be123c', hair: '#7c2d12' }, // rose (신규)
  Utility:   { shirt: '#94a3b8', shirtDark: '#64748b', hair: '#1e293b' }, // slate
};

// 직원 id → Role 매핑
export const EMPLOYEE_TO_ROLE: Record<string, Role> = {
  pm: 'PM',
  'dev-1': 'Engineer',
  'dev-arch': 'Architect',
  'planner-1': 'Planner',
  'qa-1': 'QA',
  'utility-1': 'Utility',
};
```

skill 원안의 Designer/Ops는 회사 컨셉상 사용 X → Architect/Planner/Utility로 재배치. QA 색은 emerald → rose (Planner가 emerald 쓰므로 충돌 회피 + 검증/경고 톤).

### 패턴 C — 책상 디테일 밀도 ("한 칸에 하나 더")

```tsx
// 현 책상의 모니터/키보드 옆에 추가
{/* 커피잔 */}
<rect x="2" y="2" width="3" height="4" fill="#fef3c7" />
<rect x="2" y="2" width="3" height="1" fill="#78350f" />
{/* 포스트잇 */}
<rect x="20" y="3" width="3" height="3" fill="#fcd34d" />
{/* 마우스 */}
<rect x="18" y="20" width="3" height="4" rx="1" fill="#1e293b" />
```

CSS로 표현하기 어려운 1~3px 디테일은 모두 SVG `<rect>`로. 빈 공간 = 카이로 톤 미달.

### 패턴 D — 바닥 타일 패턴 다양화 (현 cream 체커 유지 + 액센트 추가)

```tsx
<pattern id="kairo-floor" width="48" height="48" patternUnits="userSpaceOnUse">
  <rect width="24" height="24" fill="#fef3c7" />
  <rect x="24" y="0" width="24" height="24" fill="#fde68a" />
  <rect x="0" y="24" width="24" height="24" fill="#fde68a" />
  <rect x="24" y="24" width="24" height="24" fill="#fef3c7" />
  {/* grout (현 패턴) */}
  <rect width="48" height="1" fill="#fbbf24" opacity="0.3" />
  <rect width="1" height="48" fill="#fbbf24" opacity="0.3" />
  {/* PR2 추가: 회의실/휴게실 zone은 다른 색 floor 사용 */}
</pattern>
{/* 회의실 zone: 따뜻한 그레이 floor */}
<rect x="60%" y="10%" width="30%" height="35%" fill="#fef9c3" opacity="0.7" />
{/* 휴게실 zone: 그린 액센트 */}
<rect x="60%" y="55%" width="30%" height="35%" fill="#dcfce7" opacity="0.7" />
```

### 패턴 E — 애니메이션 (CSS keyframe만)

```css
@keyframes kairo-idle {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-0.5px); }
}
@keyframes kairo-working {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-1px); }
}
@keyframes kairo-thought {
  0%, 100% { opacity: 0; transform: scale(0.9); }
  50%      { opacity: 1; transform: scale(1.0); }
}
.character-idle    { animation: kairo-idle    1800ms ease-in-out infinite; }
.character-working { animation: kairo-working  200ms linear         infinite; }
.thought-bubble    { animation: kairo-thought 1500ms ease-in-out infinite; }
```

현 `translateY(-2px)`는 너무 큼 — 1px 이하가 카이로감. working 시 200ms 빠른 사이클로 "타이핑 중" 표현.

### 패턴 F — 가구 컴포넌트 분리

```tsx
// PR2: components/pixel-office/ 디렉토리 신설
//   Character.tsx, Desk.tsx, MeetingTable.tsx, WaterCooler.tsx, Whiteboard.tsx,
//   Bookshelf.tsx, Window.tsx, Door.tsx, Floor.tsx, Walls.tsx
// 각 컴포넌트는 props로 (x, y, variant) 받는 SVG path 묶음.
// PixelOffice.tsx는 레이아웃만 — 절대 좌표 5명 + 가구 배치.
```

## 라이센스 / 출처

### 사용 가능 자료 (라이센스 정리)

| 자료 | 라이센스 | URL | 의무 |
|---|---|---|---|
| Kenney 전체 | CC0 | https://kenney.nl/assets | 없음 (감사 표기 권장) |
| Kenney Furniture Kit | CC0 | https://kenney.nl/assets/furniture-kit | 없음 |
| OpenGameArt CC0 자료 | CC0 | https://opengameart.org (필터: CC0) | 없음 |
| LPC Base Assets | CC-BY-SA 3.0 + GPL 3.0 | https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles | NOTICE + 같은 라이센스 공개 (SA 의무) |
| LPC Character Bases | CC-BY-SA / 일부 OGA-BY | https://opengameart.org/content/lpc-character-bases | NOTICE |
| 2dPig Pixel Office Pack | CC0 | https://2dpig.itch.io/pixel-office | 없음 |
| Pixel Life: Office Essentials | 무료 (상업 OK) | https://christianperich.itch.io/pixel-life-office-essentials | 라이센스 페이지 재확인 권장 |

### 금지 / 주의

- **카이로 게임 원본 sprite (Spriters Resource 포함)**: 저작권 보호. 직접 복제/리믹스 금지. 톤만 참고.
- **CC-BY-SA 자료**: payroll-os가 SA 호환 라이센스로 공개하지 않는 한 회피.

### 리서치 출처 (전체)

- [Kairosoft Wiki](https://kairosoft.wiki.gg/)
- [TV Tropes: Kairosoft](https://tvtropes.org/pmwiki/pmwiki.php/Creator/Kairosoft)
- [TouchArcade — Cafeteria Nipponica review](https://toucharcade.com/2012/08/17/cafeteria-nipponica-review-a-deeper-flavor-from-kairosoft/)
- [Pocket Gamer — Hot Springs Story](https://www.pocketgamer.com/hot-springs-story/hot-springs-story-android-iphone-ipad-29312/)
- [Pocket Gamer — Pocket Academy](https://www.pocketgamer.com/pocket-academy/pocket-academy-review/)
- [Pixel Joint Forum — Kairosoft-style sprite job](https://pixeljoint.com/forum/forum_posts.asp?TID=17047)
- [Spriters Resource — Hot Springs Story](https://www.spriters-resource.com/mobile/hotspringstory/) (reference only)
- [Slynyrd Pixelblog 22 — Top Down Character Sprites](https://www.slynyrd.com/blog/2019/10/21/pixelblog-22-top-down-character-sprites)
- [Slynyrd Pixelblog 8 — Intro to Animation](https://www.slynyrd.com/blog/2018/8/19/pixelblog-8-intro-to-animation)
- [Sandro Maglione — Top-down pixel art](https://www.sandromaglione.com/articles/pixel-art-top-down-game-sprite-design-and-animation)
- [Pixnote — Game Assets Guide](https://pixnote.net/en/learn/game-assets/)
- [Sprite-AI — Animation frames](https://www.sprite-ai.art/blog/sprite-animation-frames)
- [Sprite-AI — Sprite export formats](https://www.sprite-ai.art/guides/sprite-export-formats)
- [CLIP STUDIO TIPS — Chibi body ratio](https://tips.clip-studio.com/en-us/articles/4806)
- [MDN — shape-rendering](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/shape-rendering)
- [DEV — PNG vs SVG performance](https://dev.to/svaani/png-sprites-perform-a-lot-better-than-svg-reports-attached-5agl)
- [Lospec — Sweetie 16](https://lospec.com/palette-list/sweetie-16)
- [Lospec — Endesga Soft 16](https://lospec.com/palette-list/endesga-soft-16)
- [Creative Commons — License types](https://creativecommons.org/share-your-work/cclicenses/)
- [OpenGameArt FAQ](https://opengameart.org/content/faq)

## PR2 적용 추천 (요약)

리서치 결과 기반, 다음 PR2(5명 책상 + 회의실 + 휴게실)에서 적용할 추천:

1. **역할별 셔츠 팔레트 5색 도입** (패턴 B) — 카이로 식별성의 핵심. 현 amber 단색 통일 즉시 해소.
2. **책상 디테일 +3종** (패턴 C) — 커피잔/포스트잇/마우스. 1~3px SVG rect 추가만으로 카이로 톤 90% 도달.
3. **머리 1px 키우기 + 어깨 1px 좁히기** (패턴 A) — 캐릭터 비례 카이로 영역 진입.
4. **바닥 zone 분리** (패턴 D) — 회의실/휴게실은 다른 색 floor overlay. 공간감 즉시 생김.
5. **애니메이션 amplitude 1px 이하로** (패턴 E) — 현 `-2px`는 카이로 톤이 아님. working은 200ms 빠른 사이클.

가구 컴포넌트 분리(패턴 F)는 코드 정리 차원에서 PR2에서 같이 진행 권장 — 5명 + 회의실 + 휴게실 추가하면 PixelOffice.tsx 한 파일로 수습 불가.

## 알려진 한계

- 본 skill은 **시각·정적 톤**만 다룬다. 게임 mechanic(시간 경과, 직원 성장, 자원 관리)은 별도 skill.
- walk cycle 애니메이션은 sprite sheet 도입 시점에 다시 검토 (SVG keyframe으로 충분한지).

## 구현 회고 (Phase 4 PR1~PR2.4)

### 1차 갈아엎기 (`176c3bb`) — 감 기반 베이스
약점 5개:
- 캐릭터 비례 — 카이로식 SD 비례 미달 (머리 6px / 몸통 4px ≈ 1.5 head, 카이로 2~2.5 미달)
- 색 팔레트 — amber 단색 + slate. 카이로는 더 alive한 다채로움
- 책상 detail — 모니터/키보드만. 컵/마우스/포스트잇 부재
- 애니메이션 — translateY -2px bobbing 단일. 카이로 톤은 1px 이하 + working 시 빠른 사이클
- 사운드/음악 — 카이로 BGM/SFX 무시 (별도 skill 대상)

### PR2.1 (`e01dec6`) — 패턴 A/C/E/F 적용
- 캐릭터 비례 — 머리 6→7px, 어깨 12→10px (SD ~2 head)
- 책상 디테일 — 커피잔/포스트잇 2개/마우스 SVG rect 추가, 5종 완성
- 애니메이션 — kairo-idle 1800ms/-0.5px, kairo-working 200ms/-1px, kairo-thought, kairo-screen
- `components/pixel-office/` 디렉토리 신설 (Character/Desk/Floor/Walls/palette)

### PR2.2 (`8bab430`) — 패턴 B 적용 + 6직군
- 6 Role 확장 (Architect/Planner/Utility/QA 색 회사 직군 매핑)
- SEATS 상수 6개 좌석 — 위 row(Engineer/PM/Architect) + 아래 row(Planner/Utility/QA)
- workingMap: roster.status='working' 자동 매핑
- activeMap: 비활성 직원 opacity 0.35 흐릿하게 (사이드바 토글 연동)

### PR2.3 (`dd3a0e2`) — 패턴 D + 가구 디테일
- Zones.tsx (회의실 yellow + 휴게실 green overlay)
- MeetingTable / Whiteboard / Sofa / WaterCooler SVG 컴포넌트
- 좌석 좌표 미세 조정 (x=22/50/78 → 18/40/62, 우측 30% zone 영역 확보)

### PR2.4 (`6ef4561`) — 회의 모드 visual
- App.tsx에서 메시지 "회의:" prefix 감지 → meetingMode state
- Desk 단일 → DeskSprite + WorkerAtSeat 분리
- 캐릭터만 700ms transition으로 회의 테이블 둘레로 이동, 책상은 빈 의자로 자리에 남음
- header에 "● 회의 중" emerald 배지 + 회의실 zone border 강조

### PR2.6 (`9fdf467`) — 회의 말풍선
- WorkerAtSeat에 meetingMode + isPM prop
- PM: `💬` 발언 풍선 (meeting-speak 1.2s scale+translate)
- 나머지 5명: `···` 청취 풍선 (meeting-listen 2.5s opacity)
- meetingMode 시 ⌨️ working 풍선 자동 숨김 (충돌 회피)

### PR2.7 (`e874d39`) — walk cycle (SVG keyframe)
- Character에 walking prop 추가, 우선순위 walking > working > idle
- WorkerAtSeat가 meetingMode 전환 시 useState/useEffect로 700ms 동안 walking true
- `@keyframes character-walk` 280ms: translateY -1.5px + rotate ±0.8deg
- **sprite sheet 도입 보류** — skill 분석대로 SVG 2-frame keyframe으로 카이로 톤 walk 충분

### PR2.8 (`b045bc8`) — 사장 캐릭터
- palette Role 'Boss' 추가 (white #f8fafc shirt, gray #475569 hair)
- default x=88/y=50 (입구 옆), meetingMode 시 x=68/y=30 (회의실 입구 옆 합류)
- working=false 고정 (사장은 책상 X)

### PR2.9 (`9101ce1`) — 시간 흐름 overlay
- TimeOverlay.tsx 신규: morning/day/sunset/night 4단계
- 자동 시스템 시간 (1분 polling) + 사장 manual override 토글 (cycle + ↺ 복귀)
- mix-blend-mode: multiply로 floor + 캐릭터 + 가구 통일 분위기
- header에 `🌅 아침·자동` 형식 버튼

### 사장 검증 (2026-05-19)
PR2.2~PR2.4 시연 OK ("좋다 좋아", "쭉 진행" 반복). PR2.5~2.9 자율 라운드는 "어차피 전부 다 할 거잖아? 추천 순서대로만 진행하자" 일괄 OK. status: research → **stable**.

### 다음 라운드 후보 (사장 결정)
- **실제 sub-agent ↔ 풍선 연동**: PM이 Task tool spawn 시 해당 직원 말풍선 색/내용 변화 (현재는 단순 `···`)
- **sprite sheet 도입**: 다방향 walk(상하좌우) 또는 더 정밀한 frame이 필요해지면. 현재 SVG keyframe으로 충분이라 도입 보류.
- **BGM/SFX**: 카이로 게임의 결정적 톤. 별도 skill 후보(`pixel-office-audio`).
- **직원 성장 / 분기 게임 사이클**: 레벨/경험치/회고 — Phase 5 비전 영역.

---

## AI 생성 리소스 — GPT Image 2 / "덕테이프" (2026-06-11 추가, 사장 승인)

사장 결정: 가구·바닥·소품 PNG는 GPT 이미지 생성(덕테이프 모델)으로 제작해 도입.
캐릭터 7명은 **현행 SVG 유지** — walk cycle 프레임 일관성 + 셔츠 7색 fill 스왑을
이미지 생성이 못 지킴. 텍스트 들어가는 요소(말풍선/배지)도 코드 렌더 유지.

### 덕테이프 모델 특성 (프롬프트 튜닝 근거)
- GPT Image 2 추정 모델의 커뮤니티 별명 (2026-04 LM Arena의 maskingtape/gaffertape/packingtape-alpha).
- 강점: **정밀 텍스트 렌더링 / instruction-following / 디테일 일관성** — 구버전 대비
  "제약을 길게 줘도 지킨다"가 핵심. 그래서 프롬프트에 금지 조항을 명시적으로 다 적는 전략이 유효.
- 약점(픽셀아트 한정): 그리드 오프그리드 "유사 픽셀" + 장 간 스타일 drift → 아래 파이프라인으로 보정.

### 생성 파이프라인 (3단계)
1. **스타일 앵커 먼저**: 현재 "사무실 둘러보기" 모달 스크린샷을 찍어 매 요청에 첨부
   ("이 화면과 같은 팔레트/시점/명도"). 장 간 drift를 막는 가장 강한 수단.
2. **생성**: 아래 공용 템플릿 + 대상별 한 줄. 1024×1024로 받아서,
3. **정리**: 64px(타일)/96px(가구)로 **nearest-neighbor 다운스케일** + 배경 투명화 확인 →
   `app/src/renderer/assets/pixel-office/<name>.png` + CSS `image-rendering: pixelated`.

### 공용 프롬프트 템플릿 (영어가 fidelity 높음 — 복사용)

```
Pixel art game asset for a cozy office-management sim (Kairosoft-like tone).
[ATTACH: current office screenshot as style/palette reference]

Subject: {대상 한 줄 — 아래 대상 리스트}
View: 3/4 top-down (slightly angled bird's-eye), single object, centered.
Canvas: 1024x1024, object drawn as if on a {64|96}px pixel grid (large visible square pixels, strictly on-grid).
Palette: max 16 colors, warm and soft, match the attached reference screenshot.
Light: from top-left, soft single shadow below object only.
Background: fully transparent (alpha). No floor, no scene, no other props.
Strictly NO: anti-aliasing, gradients, blur, outline glow, text, watermark, off-grid pixels, photorealism.
```

### 대상 리스트 — 우선 5종 (사장 생성 → `assets/pixel-office/`에 저장)
| # | 파일명 | Subject 한 줄 | 규격 |
|---|---|---|---|
| 1 | `floor-wood.png` / `floor-carpet.png` | seamless wood plank floor tile / soft beige carpet tile (각각 별도 생성, **seamless tileable** 명시) | 64px 타일 |
| 2 | `desk-set.png` | office desk with CRT-style monitor, keyboard, coffee mug, sticky notes | 96px |
| 3 | `meeting-table.png` | large oval meeting table with 6 simple chairs around it | 128px |
| 4 | `sofa-cooler.png` | small cozy sofa + water cooler beside it (break room set) | 96px |
| 5 | `wall-window.png` | office wall segment with a window showing sky + a small poster | 96px |

### 통합 규칙
- 컴포넌트 치환은 **하나씩** (예: Desk.tsx의 SVG → `<img>` 교체 후 사장 확인, OK면 다음).
  기존 SVG는 즉시 삭제하지 말고 PR 통과 후 정리 — 톤 안 맞으면 롤백.
- 라이센스: OpenAI 약관상 산출물 사용자 소유 — 오픈소스 동봉 OK. NOTICE에 "일부 에셋 AI 생성" 한 줄.
- 시간 overlay(mix-blend multiply)는 PNG 위에도 동일하게 동작 — 별도 처리 불필요.
