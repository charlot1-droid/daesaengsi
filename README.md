# 대생시: 대학 생활 시뮬레이션

고3 초청채플 레크리에이션용 미연시. 무대(프로젝터)에 장면이 나오고, 관객은 휴대폰으로 1·2·3 중 하나를 골라 이야기를 움직여요.
디자인은 `대생시 Design System`을 그대로 옮겼어요 (`src/styles/tokens.css`, `src/styles/ds.css`).

## 주소 세 개

| 주소 | 누가 | 무엇 |
| --- | --- | --- |
| `/host` | 진행자 노트북 → 프로젝터 | 로비(PIN·QR) → 대사 → 선택지·투표 → 결과 → 배드 엔딩·재투표 → 엔딩 |
| `/` | 관객 휴대폰 | 입장 번호 + 이름(로그인 없음) → 투표 |
| `/script` | 대본 작업할 때 | 모든 장면·화면을 한 페이지에 미리보기 + 대본 검사 결과 |

## 실행

```bash
npm install
npm run dev          # http://localhost:5173/host  과  http://localhost:5173/
```

- **Supabase 없이도 돌아가요.** `.env`가 비어 있으면 *리허설 모드*: 같은 브라우저에서 `/host` 탭 하나 + `/` 탭 여러 개로 투표까지 전부 확인할 수 있어요.
- **실제 행사:** Supabase 프로젝트에 `supabase/migrations/001_init.sql`과 `002_phone_sync.sql`을 차례로 실행하고 `.env`(→ Vercel 환경 변수)에 URL·anon key를 넣어요.
- **팻말 모드:** `/host?link=offline` — 와이파이가 죽어도 진행자가 1·2·3 키로 골라 진행.
- 그 밖에: `/host?scene=s3` 그 장면부터 · `/host?fresh` 새 방 번호.

## 진행자 단축키

| 키 | 동작 |
| --- | --- |
| 스페이스 · → · PageDown · 클릭 | 다음 (리모컨 OK). 대사가 드러나는 중이면 먼저 전체 표시 |
| ← · PageUp · Backspace | 뒤로 (투표 중이면 투표 취소) |
| Enter | 투표 지금 마감 |
| 1 · 2 · 3 | 직접 고르기 (팻말 모드, 동점·결과 뒤집기) |
| T / P | 타이머 처음부터 / 멈춤·계속 |
| S | 무대 모드: 배우가 직접 말하는 여주·나레이터 대사 숨김 |
| M / F / H | 소리 / 전체 화면 / 도움말·장면 이동 |

## 대본 고치기 (구조는 그대로, 문장만)

대본은 **`src/scenario/daesaengsi.ts` 한 파일**이에요. 지금은 「대생시_대본_수정본 1.docx」를 옮겨 둔 상태예요 (대본과 다르게 한 곳은 파일 맨 위에 적혀 있어요).
아직 못 정한 문장은 앞에 `[대본]`을 붙여 두면 무대에는 안 보이고, `npm run check`가 남은 개수를 알려 줘요.

```ts
{ t: 'say', who: 'namju', text: '혹시 새내기예요? 반가워요!', face: 'smile' }   // 대사 (+ 남주 표정)
{ t: 'notice', text: '여주의 심장 BPM 180', sub: '…', tone: 'heart' }            // 공지
{ t: 'notify', text: '남주 선배가 팔로우 요청을 보냈어요', affinity: 1 }           // 알림 + 호감도
{ t: 'phone', title: '김남주', msgs: [{ from: 'me', text: '…' }, …] }            // DM (메시지마다 한 번씩 넘김)
{ t: 'prop', art: 'pr-napkin', hand: 'pen', text: '…' }                         // 소품 + 글씨
{ t: 'bg', art: 'cg-band-spotlight' }  { t: 'sprite', face: 'cool', outfit: 'b' } // 배경·스탠딩만 바꾸기
{ t: 'splash' } { t: 'share' } { t: 'screen' }                                   // 표지 / 팀 나눔 / 화면 속 화면
{ t: 'share', label: '관객 참여', q: '다 같이 율동 따라 하기!', seconds: 15 }    // 팀 나눔 대신 '다 같이 하는 활동' (타이머만)
{ from: 'note', text: '팀원B 님이 채팅방을 나갔습니다.' }                         // phone 메시지 중 가운데 안내 줄 (읽음·나감)
{ t: 'share', label: '팀 나눔 · 총 10분', q: '제목', seconds: 600, items: [{ q: '질문 1' }, { q: '질문 2', hint: '작은 글씨' }] }  // 질문 여러 개를 한 판에 (타이머 하나, 휴대폰에도 목록)
{ t: 'prop', art: 'pr-cheer-captain', hand: 'print', text: '', frame: true }      // 글자 없는 인물 컷인 (둥근 판 안에)
```

선택지는 장면의 `choice`에, 답마다 `go`(갈 장면) 또는 `bad`(배드 엔딩 → 같은 선택지로 15초 재투표).
타입 설명은 `src/scenario/schema.ts`.

고친 뒤:

```bash
npm run check      # 장면 연결 · 한 줄 28자 · 2줄 넘는 대사 · 남은 [대본] 개수
npm run simulate   # Stage 1의 세 갈래를 모두 처음부터 끝까지 자동 진행 (배드 → 재투표 포함)
```

## 이미지 (ChatGPT로 나중에 생성)

`src/art/manifest.ts`에 모든 그림이 `ready` / `needed`로 적혀 있어요. **`needed`인 그림은 무대에 '이미지 필요 · 파일명' 자리 표시**가 뜨고, 리액션 컷처럼 대신 쓸 그림이 있으면 그걸 쓰면서 작은 표시를 달아요.

```bash
npm run art        # 필요한 그림 목록 → docs/ART-STATUS.md
```

그림을 만들면: `docs/prompts.md`(아트 디렉션) 규칙으로 생성 → WebP로 변환 → `public/art/…`에 같은 이름으로 → manifest에서 `status: 'ready'`.
스탠딩 위치는 `app.css`의 `--sprite-top`, `--sprite-h`로 맞춰요(실제 그림이 들어오면 조정).

## 폴더

```
src/
  routes/      Host.tsx (무대) · Player.tsx (휴대폰) · Script.tsx (대본 미리보기)
  engine/      runner.ts (진행 상태 기계, 순수 함수) · frames.ts (비트 → 화면) · affinity.ts (승자·비율)
  scenario/    schema.ts (대본 타입) · daesaengsi.ts (대본) · validate.ts (검사)
  realtime/    types.ts · derive.ts (진행 상태 → 휴대폰 상태) · local.ts (리허설) · supabase.ts (행사) · index.ts (선택)
  ui/stage/    DialogueBox · ChoiceBoard · Panels(Notice, Notify, PhoneDM, Prop, StageSplash, Checkpoint, QuestionCard, 수강신청 화면) · Lobby · Fx(스탠딩, 전단지) · StageScreen
  ui/player/   입장 · 대기 · 투표 · 마감 · 결과 · 팀 나눔 · 끝
  art/         manifest.ts (이미지 목록)
  audio/       sfx.ts (WebAudio 효과음, 파일 없음)
  styles/      tokens.css · ds.css (디자인 시스템) · app.css (앱 껍데기만)
supabase/migrations/001_init.sql, 002_phone_sync.sql
docs/  architecture.md · prompts.md (아트 디렉션) · ART-STATUS.md
```

## 행사 전에 채울 것 (`TODO` 검색)

- 전단지에 적힐 동아리 이름(`Fx.tsx`), 마지막 화면의 수원 CCC 로고
- 효과음: 대본의 꼬르륵·드럼롤은 아직 소리가 없어요 (`audio/sfx.ts`에 추가 → 대본에서 `sfx`로 연결)
- 대본이 바뀌면: `src/scenario/daesaengsi.ts`만 고치고 `npm run check`
- 닉네임 금칙어 (`realtime/nickname.ts` + SQL `join_room`)
- 마지막 안내 링크 (`config.ts` → `endLink`)
- 관객 200명 넘으면 Supabase Pro (무료 실시간 동시 접속 200)

## 디자인 시스템과 다른 점 (DS에도 반영 권장)

- `bundle.css`의 `:root { --line: 'Gowun Dodum'… }`(대사 글꼴)이 `tokens.css`의 `--line`(판 테두리 색)과 **이름이 겹쳐요**. 한쪽이 다른 쪽을 덮어서 테두리나 대사 글꼴이 깨질 수 있어서, 여기서는 글꼴 쪽을 `--font-line`으로 바꿨어요(`ds.css` 13·39·122·123행).
