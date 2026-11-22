# 프로젝트 구조 (제안 · 컨펌 대기)

## 1. 왜 이 구성인가

카훗처럼 관객이 **로그인 없이** PIN과 닉네임만으로 들어와야 해요. 하지만 Claude 아티팩트의 실시간 기능은 claude.ai에 로그인한 사람만 쓸 수 있어서, 게임을 아티팩트로 만들면 고3 관객이 참여할 수 없어요. 그래서 게임은 **별도 웹앱**으로 만들고, 이미 연결돼 있는 두 서비스를 써요.

| 역할 | 서비스 | 하는 일 |
| --- | --- | --- |
| 웹 호스팅 | **Vercel** | 무대 화면(`/host`)과 관객 화면(`/`)을 한 주소로 배포 |
| 실시간 + DB | **Supabase** | 게임 방(PIN), 참가자, 투표 저장 · 진행 상태 실시간 전송 |
| 일러스트 | ChatGPT (Chrome) | 아트 디렉션 섹션의 바이블대로 생성 |

## 2. 화면과 흐름

```
[진행자 노트북 → 프로젝터]                [관객 휴대폰 × N]
/host  ── 방 만들기(PIN 482913) ─────────▶ /  PIN + 닉네임 입력 (게스트)
   │  로비: QR·참여자 목록                     │  대기: "무대를 봐 주세요"
   │  대사 진행 (클릭·스페이스)                  │
   │  선택지 열기 ── state: voting ──────────▶ │  버튼 ①②③ 활성 + 타이머
   │  ◀────────── 투표 insert ──────────────── │  (마감 전엔 변경 가능)
   │  마감 → 결과 막대 → 분기                    │  결과: "정답!" / "BAD ENDING…"
   │  BAD → 체크포인트 → 15초 재투표 ─────────▶ │  "다시 투표!"
   ▼  … TRUE ENDING → QR                       ▼  마지막: 감사 + 안내 순장 링크
```

- **진행자가 기준(authority)**: 장면 진행, 투표 열기·마감, 분기 결정은 모두 `/host`에서만 일어나요. 관객 휴대폰은 상태를 받아 보여 주고 투표만 보내요.
- **투표 단위**: 기본은 1인 1표, 팀 정보 없이 전체 집계. (팀 단위로 바꾸는 옵션은 아래 질문 참고)
- **비상 모드**: Wi-Fi가 끊기면 진행자가 1·2·3 키로 직접 고르는 '팻말 모드'로 그대로 진행할 수 있어요 (지금 초안과 같은 방식).

## 3. 저장소 폴더 구조

```
daesaengsi/
├─ src/
│  ├─ routes/
│  │  ├─ Host.tsx            무대 화면 (로비 → 게임 → 엔딩)
│  │  ├─ Join.tsx            관객 입장 (PIN·닉네임)
│  │  └─ Play.tsx            관객 투표·대기·결과
│  ├─ engine/
│  │  ├─ runner.ts           장면 진행 상태 기계 (대사, 선택, 체크포인트, 뒤로가기)
│  │  └─ affinity.ts         호감도 규칙
│  ├─ scenario/
│  │  ├─ schema.ts           대본 데이터 타입
│  │  └─ daesaengsi.ts       ← 대본(docx)을 옮긴 데이터 (컨펌 후 작성)
│  ├─ realtime/
│  │  ├─ supabase.ts         클라이언트
│  │  ├─ room.ts             방 만들기·입장·상태 방송
│  │  └─ votes.ts            투표 보내기·집계
│  ├─ ui/
│  │  ├─ host/               DialogueBox(+상단 칩), ChoiceBoard(투표·결과), Timer, Toast,
│  │  │                      PhoneDM, Notice, StageSplash, Checkpoint, QuestionCard, Lobby
│  │  └─ player/             JoinForm, VotePad, Waiting, Result
│  ├─ styles/
│  │  ├─ tokens.css          이 디자인 시스템에서 생성
│  │  └─ components.css      이 디자인 시스템의 bundle.css
│  └─ audio/sfx.ts           WebAudio 효과음
├─ public/art/
│  ├─ backgrounds/  sprites/  cg/  reactions/   (WebP)
├─ supabase/migrations/001_init.sql
└─ docs/prompts.md           이미지 프롬프트 바이블 (아트 디렉션 섹션과 동일)
```

컴퓨터의 `대생시` 폴더는 **원본 이미지 보관함**(ChatGPT에서 받은 PNG)으로 쓰고, 코드 저장소에는 변환한 WebP만 넣어요.

## 4. 대본 데이터 모양

대본은 장면(node) 단위로 옮겨요. 대사를 고칠 때 이 파일의 문장만 바꾸면 돼요.

```ts
type Speaker = 'N' | 'yeoju' | 'namju' | 'friend' | 'captain';
type Line =
  | { say: Speaker; text: string; face?: Face; sfx?: Sfx; fx?: 'shake' | 'spot' | 'flyers' }
  | { screen: 'banner' | 'toast' | 'note'; text: string; affinity?: number }
  | { dm: 'out' | 'in' | 'read'; text: string; from?: string }
  | { share: string; seconds: 40; skippable?: boolean };

interface Scene {
  id: string;                 // 's2c'
  stage: string;              // 'STAGE 2 · 두근두근 첫 메시지'
  bg: BgId; night?: boolean; splash?: boolean;
  lines: Line[];
  choice?: { q: string; seconds: 30 | 20; options: [Option, Option, Option] };
  bad?: { title: string; back: string; face: Face };   // BAD ENDING → 체크포인트
  next?: string;
}
interface Option { label: string; go: string; correct?: boolean }
```

## 5. 데이터베이스 (Supabase)

| 테이블 | 열 | 메모 |
| --- | --- | --- |
| `rooms` | id, pin(6자리), host_key, state(json), created_at | state = 현재 장면·단계·선택지·마감 시각 |
| `players` | id, room_id, nickname, joined_at | 닉네임 금칙어 필터 |
| `votes` | room_id, round, player_id, option(1–3), updated_at | (room, round, player) 하나만 — 변경은 덮어쓰기 |

- 관객은 익명 키로 `votes`에 쓰기만, 진행자만 `rooms.state`를 바꿀 수 있게 보안 규칙(RLS)을 걸어요.
- 진행 상태는 Realtime 방송으로 보내고, 늦게 들어온 관객은 `rooms.state`를 읽어 따라와요.
- 투표 수는 진행자 화면이 0.5초마다 집계 함수로 받아 와요 (메시지 폭주 방지).

## 6. 용량과 비용

Supabase 무료 플랜의 실시간 동시 접속은 **200명**, Pro($25/월)는 500명이에요. 관객이 200명을 넘고 1인 1표로 하려면 행사 달만 Pro로 올리거나, 팀당 휴대폰 한 대로 투표해야 해요. Vercel은 무료 플랜으로 충분해요.
