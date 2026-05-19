---
name: audio-design
description: 카이로소프트 게임 톤 BGM/SFX 디자인 가이드 — 사무실 ambient, 분기 시작/회고/일감 spawn SFX, 라이센스 안전 audio 자료, Electron audio API 패턴
status: research-complete
applies_to: app/src/renderer/src/components/pixel-office/* (audio overlay), Phase 6+ (사장 결정 후 실제 audio 도입)
last_updated: 2026-05-19
---

# Audio Design

## 컨셉

payroll-os 사무실의 카이로소프트 톤 audio. 시각(`pixel-office-design`)이 카이로의 외형이라면, audio는 카이로의 정체성을 완성. Game Dev Story / Manga Works의 BGM은 사장 직접 경험을 결정짓는 요소.

## 핵심 원칙

카이로 audio 톤의 본질은 "기술적 정확도"가 아니라 **(a) 끊김 없는 background 존재감 + (b) 짧고 분명한 SFX 보상 + (c) 작업 흐름을 방해하지 않는 음량/멜로디 단순성**에 있다. 다음 4개가 흔들리면 카이로 audio 톤이 무너진다.

1. **"hummable ditty" 단순 멜로디.** 카이로 BGM은 외부 리뷰에서 일관되게 "catchy but repetitive chiptune"으로 묘사됨 ([TV Tropes: Kairosoft](https://tvtropes.org/pmwiki/pmwiki.php/Creator/Kairosoft)). 화성 1~2개, 30~60초 짧은 loop, 단조 톤 회피. 게임 진행 5분 후에도 "거슬리지 않음"이 합격선.
2. **칩튠/8-bit 음색, 16-bit급은 아님.** square + triangle + noise 3채널 + 가벼운 melodic lead. 제대로 된 16-bit FM 합성도 아니고, NES 4채널 한도도 아닌 그 사이. BeepBox `chip` instrument 톤이 거의 그 영역.
3. **BPM 100~130, 메이저 키, 4/4박.** 카페테리아/사무실/시설 ambient는 일관되게 활기차되 빠르지 않음. 작업 BGM이라 70 이하 ballad나 140 이상 액션 톤은 카이로 톤이 아님.
4. **SFX는 80~300ms, 한 사운드 = 한 의미.** 일감 완료 = 짧은 상승 아르페지오(coin/fanfare), 알림 = 단발 beep, 회의 모드 = chord stab, 분기 cue = 1~2초 jingle. UI 사운드의 일반 원칙([SFX Engine](https://sfxengine.com/blog/best-practices-for-game-ui-sounds))과 일치.
5. **자동 재생 금지 + 사장 토글 우선.** 데스크톱 앱에서 BGM이 첫 시작에 강제 재생되면 "tab/창을 못 찾는 distress" 패턴 발생([MDN Autoplay](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)). payroll-os는 첫 실행 시 mute default, StatusBar에 명시적 토글.

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

### 1. 카이로 시리즈 BGM 톤 분석

| 게임 | 사용처 | 톤 특징 (추정) | 카이로다움 |
|---|---|---|---|
| Game Dev Story | 사무실 ambient + 출시 jingle | square lead + bass + noise hihat, BPM ~115, 메이저 키, 40~60초 loop | ★★★ 카이로 원형. payroll-os 가장 가까운 reference |
| Manga Works (Anime Studio Story) | 스튜디오 ambient | Game Dev Story와 거의 동일 톤, 약간 더 잔잔 | ★★★ 사무실형이라 payroll-os 직결 |
| Cafeteria Nipponica (만지작) | 주방/홀 ambient + 손님 SFX | 약간 더 빠른 BPM(~125), 일본 풍 멜로디 5음계 가미 | ★★ 시설형, BGM idea 차용 가능 |
| Hot Springs Story | 시설 ambient + 손님 입장 SFX | 차분, BPM ~100, fluteish lead, 자연 SFX 섞임 | ★ ambient 톤은 회의/휴게실 BGM에 reference |
| Pocket Academy | 교실 ambient + chime SFX | 학교 종(school bell) 모티브 자주 등장 | ★ 분기 cue("종"-like)에만 reference |
| Pocket Stables | 야외 + 시설 혼합 | 자연음(말 울음) 등 환경음 다양 | ★ 환경 SFX의 다양화 idea |
| Ramen Sensei | 좁은 가게 ambient | 빠른 BPM, 일본 전통 악기 가미 | ★ payroll-os 직접 reference 아님 |

**공통 톤 추출** (외부 리뷰/SoundCloud 청취 기반 추정, 카이로 BGM 직접 추출 X):
- 악기: square lead 1, square sub 1, triangle bass 1, noise hihat 1 — NES 4채널 + α 영역.
- 멜로디: 짧은 motif 4~8마디 반복, 화성 I–V–vi–IV 또는 I–vi–IV–V 류 standard pop progression.
- 30~60초 loop, gapless. fade out 없이 마지막 마디 → 첫 마디 자연 연결.
- 사장이 듣기 좋다 = "neutral pleasant"이지 "emotional"이 아님. 작업 BGM이라 감정선이 약하다.

[Kairosoft Wiki — Game Dev Story](https://kairosoft.wiki.gg/wiki/Game_Dev_Story), [Khinsider — Kairosoft soundtracks](https://downloads.khinsider.com/game-soundtracks/developer/kairosoft), [SoundCloud — Paynekiller92 GDS OST playlist](https://soundcloud.com/paynekiller92/sets/game-dev-story-ost) (톤 참고만, 직접 차용 X).

### 2. 카이로 SFX 분류 → payroll-os 매핑

| payroll-os 이벤트 | SFX 타입 | 길이 | 톤 reference |
|---|---|---|---|
| 일감 완료 (직원 status: working → idle) | 짧은 상승 아르페지오 3~4 note | 200~400ms | Game Dev Story "버그 fix 완료" 톤. 코인/level up 류 |
| 분기 시작 (PR sprint kick-off) | 1~2초 fanfare jingle | 800~1500ms | Pocket Academy 학기 시작 종소리 |
| 분기 종료/회고 | 하강 아르페지오 + chord stab | 600~1200ms | 카페테리아 영업 종료 톤 |
| 회의 모드 진입 (App.tsx `meetingMode` 전환) | 짧은 chord stab (major 7th) | 300~500ms | Manga Works 회의 cue |
| 회의 모드 종료 | 동일 chord 한 옥타브 아래 | 300~500ms | mirror SFX |
| 사장 메시지 도착 (알림) | 단발 beep 2~3 note | 80~150ms | UI 표준 ([SFX Engine](https://sfxengine.com/blog/best-practices-for-game-ui-sounds)) |
| 직원 spawn (신규 채용) | 등장 jingle 4~6 note | 500~800ms | Game Dev Story 직원 채용 톤 |
| 사이드바 클릭 / 직원 선택 | 짧은 click/blip | 50~80ms | Kenney UI Audio click1.ogg |
| 모달 open/close (PixelOffice) | woosh 또는 swipe | 150~250ms | 시설 view 진입 톤 |
| 환경음 (사무실 ambient) | 키보드 타이핑 typing noise, 약간 muffled | continuous loop | optional, BGM과 동시 재생 시 mix 낮춤 |

**원칙 (UI 사운드 표준 적용):**
- click: 50~80ms, 200~500Hz 무게중심
- notification: 80~300ms, 1~5kHz 정보 톤
- 일감 완료/분기 cue: 300~1500ms, 멜로디 포함
- 한 화면 동시 SFX 2개 이상 trigger 시 우선순위 적용 (notification > click > ambient)

### 3. 라이센스 안전 영역

- **카이로 게임 원본 BGM/SFX**: 저작권 보호. **직접 추출/리믹스/사용 절대 금지**. 톤/idea/BPM 영역만 추출, 멜로디는 본인 작곡 또는 CC0 차용으로 새로 만듦.
- **CC0 (Creative Commons Zero)**: 자유 사용, NOTICE 의무 없음 (관습적 감사 표기 권장). Kenney 전체, OpenGameArt CC0 필터, freesound.org CC0 필터, ChipTone 생성물.
- **CC-BY**: NOTICE 필수 — 작품명/저자/라이센스/원본 링크 4종. 본 프로젝트는 GitHub public 가능성 있으므로 NOTICE 운영 부담 → 가급적 CC0 선호.
- **CC-BY-SA**: NOTICE + 본 프로젝트도 SA 호환 라이센스 공개 의무. payroll-os가 폐쇄 또는 비공개 라이센스라면 회피.
- **CC-NC (비상업)**: payroll-os가 개인용이라 OK이지만 GitHub public이면 회피 권장.
- **본인 작곡 (BeepBox/UltraBox/OpenMPT/ChipTone 생성물)**: 라이센스 자유. 가장 안전한 영역.

[Creative Commons License Types](https://creativecommons.org/share-your-work/cclicenses/), [OpenGameArt FAQ](https://opengameart.org/content/faq).

### 4. 오픈소스 audio 자료 (라이센스 우선순위 순)

| 자료 | 라이센스 | URL | 카이로 톤 적합 | 사용처 |
|---|---|---|---|---|
| Kenney UI Audio | CC0 | https://kenney.nl/assets/ui-audio | ★★★ | click/confirm/cancel SFX |
| Kenney Interface Sounds (100) | CC0 | https://kenney.nl/assets/interface-sounds | ★★★ | UI SFX 가장 안전 |
| Kenney Digital Audio (60) | CC0 | https://kenney.nl/assets/digital-audio | ★★ | 8-bit blip / 알림 |
| Kenney Impact Sounds (130) | CC0 | https://kenney.nl/assets/impact-sounds | ★ | 일부 일감 완료 톤 |
| Kenney RPG Audio | CC0 | https://kenney.nl/assets/rpg-audio | ★★ | jingle / spawn / fanfare |
| OpenGameArt CC0 Chiptunes | CC0 | https://opengameart.org/content/cc0-chiptunes | ★★★ | BGM loop 후보 |
| OpenGameArt 512 8-bit SFX | CC0 | https://opengameart.org/content/512-sound-effects-8-bit-style | ★★★ | SFX 라이브러리 |
| OpenGameArt CC0 Retro Music | CC0 | https://opengameart.org/content/cc0-retro-music | ★★ | ambient 후보 |
| ChipTone (SFBGames) | CC0 (생성물) | https://sfbgames.itch.io/chiptone | ★★★ | SFX **직접 생성**, 가장 안전 |
| freesound.org (CC0 필터) | CC0 (필터) | https://freesound.org → license: CC0 | ★★ | 보강 SFX, 파일별 라이센스 재확인 |
| LittleRobotSoundFactory 8-Bit | CC-BY 3.0 | https://freesound.org/people/LittleRobotSoundFactory/packs/16681/ | ★★ | NOTICE 필요 |
| Pixabay CC0 audio | CC0 (claim) | https://pixabay.com/sound-effects/search/cc0/ | ★ | 라이센스 신뢰도 낮음, fallback |
| ZapSplat | 무료 회원, 자체 라이센스 | https://www.zapsplat.com/ | ★ | NOTICE 의무, 회피 권장 |

**결론:** 1순위 Kenney CC0 (UI/Interface/Digital) + ChipTone CC0 생성. 2순위 OpenGameArt CC0 필터. CC-BY는 NOTICE 부담 있어 보강용으로만.

### 5. Electron audio 구현 패턴

**API 비교:**

| 기준 | HTML5 `<audio>` 태그 | Web Audio API |
|---|---|---|
| 코딩 비용 | 낮음 (1줄 `<audio src loop>`) | 중 (AudioContext + buffer + node 그래프) |
| BGM gapless loop | ★ (loop attribute에 silent gap 잔재) | ★★★ (buffer.loop + loopStart/loopEnd 정확) |
| 볼륨 컨트롤 | element.volume (0~1) | GainNode (정밀 ramp 가능) |
| 동시 재생 SFX | 여러 element clone 필요 | 1 AudioContext에서 source 다수 spawn |
| Crossfade BGM 전환 | 별도 element 2개 + 수동 setInterval | GainNode 2개 + linearRampToValueAtTime() |
| 메모리 | element 단위 | buffer cache 단위 |
| Electron 적합 | ★★ (간단 BGM만 OK) | ★★★ (BGM + SFX 동시, 회의 모드 crossfade) |

**판단:** payroll-os는 BGM + SFX 동시 + 회의 모드 BGM 전환 시 crossfade가 필요하므로 **Web Audio API**. SFX는 buffer 한 번 fetch 후 reuse. Howler.js 같은 wrapper도 후보지만 의존성 1개 추가 부담 — 본 프로젝트 size에서는 직접 Web Audio API 작성 권장 (대안: Howler.js 7KB, 검증된 라이브러리).

**파일 위치 (Electron + Vite 구조):**
- `app/src/renderer/public/audio/bgm/office_idle.ogg` (loop, ~600KB)
- `app/src/renderer/public/audio/bgm/office_meeting.ogg`
- `app/src/renderer/public/audio/sfx/work_done.ogg` (300ms, ~5KB)
- `app/src/renderer/public/audio/sfx/notification.ogg`
- `app/src/renderer/public/audio/sfx/sprint_start.ogg`
- `app/src/renderer/public/audio/sfx/meeting_in.ogg`
- `app/src/renderer/public/audio/sfx/meeting_out.ogg`
- `app/src/renderer/public/audio/sfx/employee_spawn.ogg`
- `app/src/renderer/public/audio/sfx/click.ogg`
- `app/NOTICE.md` (CC-BY 자료 NOTICE 누적)

**포맷:** OGG Vorbis (Electron Chromium 내장 지원, 압축 효율). MP3 fallback 필요 시 dual asset.

**메모리 전략:** BGM은 lazy load (사장 토글 시 fetch), SFX는 첫 사용 시 fetch 후 buffer cache. 전체 audio 자산 ~1.5MB 이내가 목표.

### 6. UX 고려사항

- **자동 재생 금지.** 첫 실행 mute default. StatusBar에 명시적 토글 (`♪ on` / `♪ off`).
- **볼륨 슬라이더 위치.** StatusBar 우측 (현재 사용량 패널 옆). BGM/SFX 분리 슬라이더 (BGM은 더 작은 음량 default, SFX는 항상 들리도록).
- **회의 모드 BGM 전환.** App.tsx `meetingMode` true 시 BGM crossfade (현 office_idle → office_meeting, 500ms linear ramp).
- **분기 시작/회고 SFX는 trigger 명확.** 사장이 의도한 액션 이후에만 (자동 detection 외 사장 클릭 시).
- **localStorage 영구화.** `audio-bgm-volume`, `audio-sfx-volume`, `audio-muted`, `audio-bgm-enabled` 4 키. 앱 재시작 시 복원.
- **prefers-reduced-motion 시 ambient BGM 비활성 옵션.** OS 신호 존중 ([WCAG 2.2 SC 2.2.2](https://www.w3.org/WAI/WCAG22/Techniques/css/C39), [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)).
- **창 비활성 시 BGM 페이드.** Electron `BrowserWindow` blur 이벤트 → BGM gain 50% 감쇠. focus 복귀 시 복원.
- **시스템 미디어 키 응답 (선택).** Electron `globalShortcut` 또는 MediaSession API로 Play/Pause 키 지원. v1 단계에서는 보류, Phase 6 후 도입.

### 7. 작곡 vs 차용 결정

| 옵션 | 시간 비용 | 톤 일관성 | 라이센스 | NOTICE | 결론 |
|---|---|---|---|---|---|
| A. 100% 자작 (BeepBox + ChipTone) | 높음 (BGM 1곡 2~6시간) | ★★★ 일관 | 자유 | 없음 | 카이로 톤 정확도 우선 시 |
| B. 100% CC0 차용 (Kenney + OpenGameArt) | 낮음 (1시간) | ★ 곡마다 톤 다름 | CC0 | 권장 | MVP 우선 시 |
| C. 하이브리드 (BGM 자작, SFX 차용) | 중 (3~8시간) | ★★ BGM 일관, SFX 잡음 | 혼합 | NOTICE 일부 | **권장** |

**결정 권장:** **C. 하이브리드.** BGM은 사무실 ambient 1곡, 회의 모드 1곡 — 본인이 BeepBox로 30~60초 loop 2개 작곡 (총 2~4시간). SFX는 Kenney CC0 + ChipTone CC0 생성으로 8~10개 큐레이션. BGM 톤이 결정적이므로 자작이 카이로감 결정.

[BeepBox](https://www.beepbox.co/), [UltraBox (BeepBox mod)](https://ultrabox.blog/), [ChipTone (SFBGames)](https://sfbgames.itch.io/chiptone).

### 8. payroll-os 도입 우선순위 (Phase 6 후보 PR)

1. **BGM ambient (사무실 idle)** — 가장 분위기 결정적. 카이로감 80%는 여기서 결정. 우선순위 1.
2. **일감 완료 SFX (`work_done`)** — 직원 status: working → idle 전환 시 즉시 보상. 사용자 만족감 직결.
3. **분기 시작 SFX (`sprint_start`)** — 사이클 cue. 사장이 가장 자주 trigger.
4. **회의 모드 BGM 전환 + meeting_in/out SFX** — 카이로 톤 차별화 요소. PixelOffice의 meetingMode와 연동.
5. **알림 SFX (`notification`)** — 사장 메시지 도착 시.
6. **사이드바 click SFX** — UI 풍미. 음량 매우 작게.
7. **직원 spawn SFX** — 신규 직원 추가 시. 빈도 낮아 우선순위 마지막.

## 적용 패턴

Phase 6 PR1+에서 위 리서치를 코드에 반영할 구체 패턴. 모든 코드는 현 프로젝트 구조 (`app/src/renderer/src/`) 가정.

### 패턴 A — AudioManager 싱글톤 (Web Audio API 직접)

별도 의존성 없이 Web Audio API로 BGM + SFX 관리. Howler.js 도입 보류 시 default 선택.

```ts
// app/src/renderer/src/audio/AudioManager.ts
type BgmKey = 'office_idle' | 'office_meeting';
type SfxKey =
  | 'work_done'
  | 'sprint_start'
  | 'sprint_end'
  | 'meeting_in'
  | 'meeting_out'
  | 'notification'
  | 'employee_spawn'
  | 'click';

const BGM_FILES: Record<BgmKey, string> = {
  office_idle: '/audio/bgm/office_idle.ogg',
  office_meeting: '/audio/bgm/office_meeting.ogg',
};

const SFX_FILES: Record<SfxKey, string> = {
  work_done: '/audio/sfx/work_done.ogg',
  sprint_start: '/audio/sfx/sprint_start.ogg',
  sprint_end: '/audio/sfx/sprint_end.ogg',
  meeting_in: '/audio/sfx/meeting_in.ogg',
  meeting_out: '/audio/sfx/meeting_out.ogg',
  notification: '/audio/sfx/notification.ogg',
  employee_spawn: '/audio/sfx/employee_spawn.ogg',
  click: '/audio/sfx/click.ogg',
};

class AudioManager {
  private ctx: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private currentBgm: { key: BgmKey; source: AudioBufferSourceNode; gain: GainNode } | null = null;
  private bufferCache = new Map<string, AudioBuffer>();

  // 첫 user gesture 이후에 init (자동 재생 정책 회피)
  init() {
    if (this.ctx) return;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.bgmGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();
    this.bgmGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
    // localStorage 복원
    this.masterGain.gain.value = Number(localStorage.getItem('audio-master-volume') ?? '0.7');
    this.bgmGain.gain.value = Number(localStorage.getItem('audio-bgm-volume') ?? '0.4');
    this.sfxGain.gain.value = Number(localStorage.getItem('audio-sfx-volume') ?? '0.8');
  }

  private async loadBuffer(url: string): Promise<AudioBuffer> {
    if (this.bufferCache.has(url)) return this.bufferCache.get(url)!;
    const res = await fetch(url);
    const arr = await res.arrayBuffer();
    const buf = await this.ctx!.decodeAudioData(arr);
    this.bufferCache.set(url, buf);
    return buf;
  }

  async playBgm(key: BgmKey, crossfadeMs = 500) {
    if (!this.ctx) return;
    if (this.currentBgm?.key === key) return; // 동일 곡 중복 재생 금지
    const buffer = await this.loadBuffer(BGM_FILES[key]);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true; // gapless loop (Web Audio buffer.loop은 정확)
    const gain = this.ctx.createGain();
    gain.gain.value = 0;
    source.connect(gain).connect(this.bgmGain!);
    source.start();
    const now = this.ctx.currentTime;
    gain.gain.linearRampToValueAtTime(1, now + crossfadeMs / 1000);
    // 이전 곡 페이드아웃
    if (this.currentBgm) {
      const prev = this.currentBgm;
      prev.gain.gain.cancelScheduledValues(now);
      prev.gain.gain.linearRampToValueAtTime(0, now + crossfadeMs / 1000);
      setTimeout(() => prev.source.stop(), crossfadeMs + 50);
    }
    this.currentBgm = { key, source, gain };
  }

  async playSfx(key: SfxKey) {
    if (!this.ctx) return;
    const buffer = await this.loadBuffer(SFX_FILES[key]);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.sfxGain!);
    source.start();
  }

  setMasterVolume(v: number) { this.persist('audio-master-volume', v); this.masterGain && (this.masterGain.gain.value = v); }
  setBgmVolume(v: number) { this.persist('audio-bgm-volume', v); this.bgmGain && (this.bgmGain.gain.value = v); }
  setSfxVolume(v: number) { this.persist('audio-sfx-volume', v); this.sfxGain && (this.sfxGain.gain.value = v); }

  stopBgm(fadeMs = 300) {
    if (!this.currentBgm || !this.ctx) return;
    const now = this.ctx.currentTime;
    const prev = this.currentBgm;
    prev.gain.gain.cancelScheduledValues(now);
    prev.gain.gain.linearRampToValueAtTime(0, now + fadeMs / 1000);
    setTimeout(() => prev.source.stop(), fadeMs + 50);
    this.currentBgm = null;
  }

  private persist(k: string, v: number) { localStorage.setItem(k, String(v)); }
}

export const audio = new AudioManager();
```

### 패턴 B — React 훅 + StatusBar 토글

```tsx
// app/src/renderer/src/audio/useAudio.ts
import { useEffect, useState } from 'react';
import { audio } from './AudioManager';

export function useAudio() {
  const [enabled, setEnabled] = useState(() => localStorage.getItem('audio-bgm-enabled') === 'true');
  const [masterVol, setMasterVol] = useState(() => Number(localStorage.getItem('audio-master-volume') ?? '0.7'));
  const [bgmVol, setBgmVol] = useState(() => Number(localStorage.getItem('audio-bgm-volume') ?? '0.4'));
  const [sfxVol, setSfxVol] = useState(() => Number(localStorage.getItem('audio-sfx-volume') ?? '0.8'));

  const toggleEnabled = () => {
    audio.init(); // 첫 user gesture 시 AudioContext 생성
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem('audio-bgm-enabled', String(next));
    if (next) audio.playBgm('office_idle');
    else audio.stopBgm();
  };

  return { enabled, toggleEnabled, masterVol, setMasterVol, bgmVol, setBgmVol, sfxVol, setSfxVol };
}
```

```tsx
// app/src/renderer/src/components/StatusBar.tsx (audio 영역 추가 예시)
const { enabled, toggleEnabled, bgmVol, setBgmVol } = useAudio();
// ...
<button onClick={toggleEnabled} title="배경음 토글">
  {enabled ? '♪ on' : '♪ off'}
</button>
{enabled && (
  <input
    type="range" min={0} max={1} step={0.05} value={bgmVol}
    onChange={e => { const v = Number(e.target.value); setBgmVol(v); audio.setBgmVolume(v); }}
  />
)}
```

### 패턴 C — 회의 모드 BGM 전환

App.tsx의 기존 `meetingMode` state에 useEffect 연결.

```tsx
// app/src/renderer/src/App.tsx (audio 연동)
import { audio } from './audio/AudioManager';

useEffect(() => {
  if (!audioEnabled) return;
  if (meetingMode) {
    audio.playSfx('meeting_in');
    audio.playBgm('office_meeting', 500); // 500ms crossfade
  } else {
    audio.playSfx('meeting_out');
    audio.playBgm('office_idle', 500);
  }
}, [meetingMode, audioEnabled]);
```

### 패턴 D — 일감 완료 SFX (roster status 전환 감지)

```tsx
// app/src/renderer/src/components/EmployeeRoster.tsx (또는 roster 관리 hook)
import { audio } from '../audio/AudioManager';

const prevStatus = useRef<Record<string, string>>({});
useEffect(() => {
  Object.entries(roster).forEach(([id, emp]) => {
    if (prevStatus.current[id] === 'working' && emp.status === 'idle') {
      audio.playSfx('work_done');
    }
    prevStatus.current[id] = emp.status;
  });
}, [roster]);
```

### 패턴 E — 첫 user gesture 자동 재생 정책 회피

Chromium은 user gesture 없이 AudioContext 시작 시 suspended 상태. 첫 클릭/키 입력 후 resume 필요.

```ts
// app/src/renderer/src/main.tsx (또는 App.tsx 최상단)
const unlockAudio = () => {
  audio.init();
  if (localStorage.getItem('audio-bgm-enabled') === 'true') {
    audio.playBgm('office_idle');
  }
  window.removeEventListener('click', unlockAudio);
  window.removeEventListener('keydown', unlockAudio);
};
window.addEventListener('click', unlockAudio);
window.addEventListener('keydown', unlockAudio);
```

### 패턴 F — 창 blur/focus 시 BGM 페이드

```ts
// app/src/renderer/src/audio/useFocusFade.ts
import { useEffect } from 'react';
import { audio } from './AudioManager';

export function useFocusFade() {
  useEffect(() => {
    const onBlur = () => audio.setMasterVolume(0.35);
    const onFocus = () => audio.setMasterVolume(Number(localStorage.getItem('audio-master-volume') ?? '0.7'));
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    return () => { window.removeEventListener('blur', onBlur); window.removeEventListener('focus', onFocus); };
  }, []);
}
```

### 패턴 G — NOTICE 운영

CC-BY 자료 도입 시 `app/NOTICE.md` 또는 `docs/Project/NOTICE.md`에 누적. CC0는 의무 아니지만 감사 표기.

```markdown
# NOTICE — Third-party Audio Assets

## CC0 (no attribution required, listed for thanks)
- Kenney UI Audio — https://kenney.nl/assets/ui-audio
- OpenGameArt 512 8-bit SFX Pack — https://opengameart.org/content/512-sound-effects-8-bit-style

## CC-BY (attribution required)
- (해당 시 작품명 / 저자 / 라이센스 / 원본 URL 4종 기재)

## Self-composed (license-free)
- bgm/office_idle.ogg — payroll-os 본인 작곡 (BeepBox)
- bgm/office_meeting.ogg — payroll-os 본인 작곡 (BeepBox)
```

### 패턴 H — 대안: Howler.js (의존성 추가 OK 시)

직접 Web Audio API 작성이 부담스러우면 Howler.js 7KB 추가. 코드량 1/3.

```ts
import { Howl, Howler } from 'howler';

const bgmIdle = new Howl({ src: ['/audio/bgm/office_idle.ogg'], loop: true, volume: 0.4 });
const sfxDone = new Howl({ src: ['/audio/sfx/work_done.ogg'], volume: 0.8 });

bgmIdle.play();
sfxDone.play();
Howler.volume(0.7); // master
```

**판단:** 본 프로젝트 의존성 최소 정책 + audio 로직이 단순(BGM 2개 + SFX 8개 수준)이라 **패턴 A 직접 작성 권장**. 향후 audio sprite 도입 또는 더 복잡한 mixing 필요해지면 Howler.js 전환.

## 라이센스 / 출처

### 사용 가능 자료 (라이센스 정리)

| 자료 | 라이센스 | URL | 의무 | 도입 추천 영역 |
|---|---|---|---|---|
| Kenney UI Audio | CC0 | https://kenney.nl/assets/ui-audio | 없음 | click, confirm, cancel SFX |
| Kenney Interface Sounds | CC0 | https://kenney.nl/assets/interface-sounds | 없음 | 알림, notification |
| Kenney Digital Audio | CC0 | https://kenney.nl/assets/digital-audio | 없음 | 8-bit blip, 직원 spawn |
| Kenney Impact Sounds | CC0 | https://kenney.nl/assets/impact-sounds | 없음 | 일부 분기 cue |
| Kenney RPG Audio | CC0 | https://kenney.nl/assets/rpg-audio | 없음 | jingle, fanfare |
| OpenGameArt CC0 Chiptunes | CC0 | https://opengameart.org/content/cc0-chiptunes | 없음 | BGM loop 후보 |
| OpenGameArt 512 8-bit SFX Pack | CC0 | https://opengameart.org/content/512-sound-effects-8-bit-style | 없음 | SFX 라이브러리 |
| OpenGameArt CC0 Retro Music | CC0 | https://opengameart.org/content/cc0-retro-music | 없음 | ambient 후보 |
| OpenGameArt CC0 8Bit-Chiptune | CC0 | https://opengameart.org/content/audio-cc0-8bit-chiptune | 없음 | SFX 보강 |
| ChipTone (SFBGames) | CC0 (생성물) | https://sfbgames.itch.io/chiptone | 없음 | SFX 직접 생성 (browser tool) |
| BeepBox | 생성물 자유 | https://www.beepbox.co/ | 없음 | BGM 직접 작곡 |
| UltraBox (BeepBox mod) | 생성물 자유 | https://ultrabox.blog/ | 없음 | BGM 고급 작곡 |
| freesound.org (CC0 필터) | 파일별 (필터 적용 시 CC0) | https://freesound.org/search/?f=license:%22Creative+Commons+0%22 | 파일별 라이센스 재확인 | SFX 보강 |
| Pixabay sound-effects | CC0 (claim) | https://pixabay.com/sound-effects/search/cc0/ | 라이센스 신뢰도 중 | 최후 fallback |
| LittleRobotSoundFactory 8-Bit | CC-BY 3.0 | https://freesound.org/people/LittleRobotSoundFactory/packs/16681/ | NOTICE 필수 | 우수하나 NOTICE 부담 |

### 금지 / 주의

- **카이로 게임 원본 BGM/SFX**: 저작권 보호. **직접 추출/리믹스/사용 절대 금지**. 톤/BPM/악기 구성 idea만 추출. khinsider 같은 archive 사이트 BGM은 reference 청취에 한해서만 — 코드/asset에 직접 포함 금지.
- **CC-BY-SA 자료**: payroll-os가 SA 호환 라이센스로 공개하지 않는 한 회피.
- **CC-NC 자료**: GitHub public 시 회피.
- **ZapSplat**: 자체 라이센스(무료 회원도 NOTICE 의무 + 일부 상업 제약). 회피 권장.
- **AI 음악 생성 서비스 (Suno, Udio 등)**: 라이센스 모호, 학습 데이터 출처 불명. 본 프로젝트에서는 회피.

### 리서치 출처 (전체)

**카이로 톤 분석:**
- [Kairosoft Wiki — Game Dev Story](https://kairosoft.wiki.gg/wiki/Game_Dev_Story)
- [Kairosoft Wiki](https://kairosoft.wiki.gg/)
- [TV Tropes — Kairosoft](https://tvtropes.org/pmwiki/pmwiki.php/Creator/Kairosoft)
- [Khinsider — Kairosoft soundtracks (reference only)](https://downloads.khinsider.com/game-soundtracks/developer/kairosoft)
- [SoundCloud — Paynekiller92 Game Dev Story OST playlist (reference only)](https://soundcloud.com/paynekiller92/sets/game-dev-story-ost)

**오픈소스 audio 자료:**
- [Kenney — Audio assets index](https://kenney.nl/assets/category:Audio)
- [Kenney — UI Audio (CC0)](https://kenney.nl/assets/ui-audio)
- [Kenney — Interface Sounds (CC0)](https://kenney.nl/assets/interface-sounds)
- [Kenney — Digital Audio (CC0)](https://kenney.nl/assets/digital-audio)
- [Kenney — Impact Sounds (CC0)](https://kenney.nl/assets/impact-sounds)
- [Kenney — RPG Audio (CC0)](https://kenney.nl/assets/rpg-audio)
- [OpenGameArt — CC0 Chiptunes](https://opengameart.org/content/cc0-chiptunes)
- [OpenGameArt — 512 8-bit SFX](https://opengameart.org/content/512-sound-effects-8-bit-style)
- [OpenGameArt — CC0 Retro Music](https://opengameart.org/content/cc0-retro-music)
- [OpenGameArt — CC0 8Bit Chiptune](https://opengameart.org/content/audio-cc0-8bit-chiptune)
- [ChipTone by SFBGames](https://sfbgames.itch.io/chiptone)
- [BeepBox](https://www.beepbox.co/)
- [UltraBox (BeepBox mod)](https://ultrabox.blog/)
- [freesound.org — 8-Bit by LittleRobotSoundFactory](https://freesound.org/people/LittleRobotSoundFactory/packs/16681/)

**Electron / Web Audio 구현:**
- [MDN — Autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)
- [MDN — AudioParam.linearRampToValueAtTime](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/linearRampToValueAtTime)
- [MDN — AudioParam.exponentialRampToValueAtTime](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/exponentialRampToValueAtTime)
- [web.dev — Getting started with Web Audio API](https://web.dev/articles/webaudio-intro)
- [Scott Logic — Web Audio API Part 2: Moving to Electron](https://blog.scottlogic.com/2016/07/05/audio-api-electron.html)
- [Jacky Efendi — Building an Audio-loop Player on the Web](https://jackyef.com/posts/building-an-audio-loop-player-on-the-web)
- [Gapless-5 (GitHub)](https://github.com/regosen/Gapless-5)
- [Howler.js](https://howlerjs.com/)
- [react-howler (npm)](https://www.npmjs.com/package/react-howler)

**UX / 접근성:**
- [SFX Engine — Best Practices for Game UI Sounds](https://sfxengine.com/blog/best-practices-for-game-ui-sounds)
- [W3C WCAG 2.2 — SC 2.2.2 Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Techniques/css/C39)
- [MDN — prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)

**라이센스:**
- [Creative Commons — License Types](https://creativecommons.org/share-your-work/cclicenses/)
- [OpenGameArt — FAQ](https://opengameart.org/content/faq)

## PR 도입 추천 (Phase 6 후보)

리서치 결과 기반, payroll-os에 실제 audio 도입 시 PR 분해 권장. 사장 결정 + asset 준비(차용 또는 자작) 후 진행.

### PR1 — AudioManager + StatusBar 토글 (audio 골격)
**범위:**
- `app/src/renderer/src/audio/AudioManager.ts` 신설 (패턴 A)
- `app/src/renderer/src/audio/useAudio.ts` 훅 (패턴 B)
- `StatusBar.tsx`에 `♪ on/off` 토글 + 볼륨 슬라이더 1개 (master)
- 첫 user gesture로 AudioContext unlock (패턴 E)
- localStorage 영구화 (`audio-bgm-enabled`, `audio-master-volume`)
- 이 PR은 audio asset 없이도 동작 — 토글 UI만 검증

**의존성:** 없음 (asset 없으면 토글만 noop)

### PR2 — BGM ambient 1곡 (`office_idle`)
**범위:**
- `app/src/renderer/public/audio/bgm/office_idle.ogg` 추가 (BeepBox 자작 또는 CC0 차용)
- AudioManager에 BGM 1곡 등록 + gapless loop 검증
- StatusBar에 BGM 볼륨 슬라이더 추가 (master와 분리)
- 첫 토글 시 office_idle 자동 재생, 토글 OFF 시 페이드아웃

**의존성:** asset 1개 (사장과 차용/자작 결정 합의 필요)
**우선순위:** **카이로감 80% 결정**. audio PR 중 가장 중요.

### PR3 — 일감 완료 SFX (`work_done`)
**범위:**
- `app/src/renderer/public/audio/sfx/work_done.ogg` 추가 (Kenney CC0 또는 ChipTone 생성)
- AudioManager.playSfx 동작 검증 (BGM 위에 overlay)
- `EmployeeRoster.tsx` (또는 roster 관리 영역)에서 직원 status: working → idle 전환 감지 시 trigger (패턴 D)
- StatusBar에 SFX 볼륨 슬라이더 추가
- SFX 볼륨 default 0.8 (BGM보다 크게 — 보상감 확보)

**의존성:** asset 1개

### PR4 — 회의 모드 BGM 전환 + meeting_in/out SFX
**범위:**
- `app/src/renderer/public/audio/bgm/office_meeting.ogg` 추가
- `app/src/renderer/public/audio/sfx/meeting_in.ogg`, `meeting_out.ogg` 추가
- App.tsx의 `meetingMode` state에 useEffect 연결 (패턴 C)
- 500ms linear crossfade 검증
- PR2.4의 회의 visual + audio 통합 → 카이로 톤 완성도 결정적 향상

**의존성:** asset 3개

### PR5 — 분기 cue + 알림 + click SFX (잡 SFX 묶음)
**범위:**
- `sprint_start.ogg`, `sprint_end.ogg`, `notification.ogg`, `click.ogg` 4종
- 사장 메시지 도착 시 notification (Chat 영역 메시지 추가 hook)
- 분기 시작/회고 액션에 sprint_start / sprint_end (현 워크플로 trigger 위치 확인 필요)
- 사이드바 직원 클릭 시 click (EmployeeCard 또는 EmployeeRoster onClick)
- `employee_spawn.ogg`는 신규 채용 흐름 정착 후 PR6로 분리

**의존성:** asset 4개

### PR6 (선택) — accessibility + 창 focus 페이드 + NOTICE 정리
**범위:**
- `prefers-reduced-motion` 시 BGM 자동 mute 옵션 (사장 명시 토글로 override 가능)
- 창 blur 시 master 0.35로 감쇠, focus 복귀 시 복원 (패턴 F)
- `app/NOTICE.md` 생성, CC-BY 자료 NOTICE 누적
- audio 토글 단축키 (예: Ctrl+M) — Electron globalShortcut

**의존성:** 없음, polish 단계

### 사장 결정 필요 항목

1. **BGM 작곡 vs 차용 결정.** 권장: 하이브리드 (BGM 2곡 자작 + SFX CC0 차용). 자작 비용 ~3~6시간.
2. **asset 도입 시점.** PR1(audio 골격)은 asset 없이 가능 — 골격 먼저 머지 후 asset 준비 병렬 진행 가능.
3. **Howler.js 의존성 추가 여부.** 기본 권장: 추가 X (직접 Web Audio API). 의존성 추가 OK이면 코드 1/3로.
4. **자동 재생 default.** 권장: OFF + 사장 토글. 카이로 게임처럼 ON default 원하면 변경 가능 (단, Chromium 정책으로 첫 클릭 전엔 어차피 재생 안 됨).

## 알려진 한계

- 본 skill은 audio 톤/SFX 분류 + 구현 패턴까지 다룬다. 실제 BGM 작곡 또는 asset 차용은 PR2~ 단계에서 사장 합의 후 진행.
- 카이로 BGM/SFX 직접 청취/추출 X — 외부 리뷰/SoundCloud playlist의 톤 묘사를 통해 reference 영역만 추출. 실제 BGM 작곡 시 본 skill의 BPM/악기 가이드와 BeepBox로 prototype 후 사장 청취 검증 필요.
- audio sprite (단일 파일 + 메타데이터 offset) 패턴은 SFX 8개 이하인 현 단계에선 oversized — sprite 도입은 SFX 20개+ 단계에서 재검토.
- 다국어 음성 (TTS / VO) 영역은 본 skill 범위 밖. 별도 skill 후보.

## 다음 라운드 후보 (skill stable 이후)

- payroll-os에 실제 BGM/SFX 도입 PR1~PR6 진행
- BGM 자작 시 BeepBox prototype 30~60초 loop × 2곡 (office_idle + office_meeting) 사장 청취 검증
- audio sprite 도입 (SFX 20개+ 시점)
- 시스템 미디어 키 (Play/Pause) 응답 (Electron globalShortcut)
- 직원별 spawn voice (각 직원이 고유 사운드 — 카이로 캐릭터 식별성 확장)
