/**
 * 이미지 목록 — 무엇이 준비됐고 무엇을 ChatGPT로 만들어야 하는지 한곳에서 관리해요.
 *
 * status
 *   'ready'  : public/art/... 에 파일이 있어요.
 *   'needed' : 아직 없어요. 무대에는 '이미지 필요' 자리 표시가 떠요.
 *
 * 새 그림을 만들면: docs/prompts.md 규칙대로 생성 → WebP로 변환 → file 경로에 넣고 → status를 'ready'로.
 * `npm run art` 로 필요한 그림 목록과 쓰이는 장면을 볼 수 있어요.
 */

export type ArtKind = 'kv' | 'bg' | 'sprite' | 'cg' | 'reaction' | 'prop' | 'face' | 'ref';

export interface ArtEntry {
  kind: ArtKind;
  file: string;
  status: 'ready' | 'needed';
  /** 어디에 쓰는지 · 무엇을 그리는지 (프롬프트 쓸 때 참고) */
  note: string;
  /** 없을 때 대신 쓸 준비된 그림 (ART의 이름) */
  fallback?: string;
}

const A = <K extends string>(m: Record<K, ArtEntry>) => m;

export const ART = A({
  /* 기준 · 완료 */
  'namju-sheet': { kind: 'ref', file: '/art/ref/namju-sheet.webp', status: 'ready', note: '남주 캐릭터 시트 (기준 이미지)' },
  'kv-title': { kind: 'kv', file: '/art/kv/kv-title.webp', status: 'ready', note: '타이틀 · 로비' },
  'bg-campus-gate': { kind: 'bg', file: '/art/backgrounds/bg-campus-gate.webp', status: 'ready', note: '오프닝, 프롤로그, Stage 1, 맞팔로우' },

  /* 얼굴 컷 (시트에서 잘라 냄) · 완료 */
  'face-smile': { kind: 'face', file: '/art/faces/face-smile.webp', status: 'ready', note: '얼굴 컷 · 미소' },
  'face-laugh': { kind: 'face', file: '/art/faces/face-laugh.webp', status: 'ready', note: '얼굴 컷 · 웃음' },
  'face-cool': { kind: 'face', file: '/art/faces/face-cool.webp', status: 'ready', note: '얼굴 컷 · 시크' },
  'face-serious': { kind: 'face', file: '/art/faces/face-serious.webp', status: 'ready', note: '얼굴 컷 · 진지' },
  'face-flustered': { kind: 'face', file: '/art/faces/face-flustered.webp', status: 'ready', note: '얼굴 컷 · 당황' },
  'face-soft': { kind: 'face', file: '/art/faces/face-soft.webp', status: 'ready', note: '얼굴 컷 · 다정' },

  /* 배경 16:9 */
  'bg-festival-night': { kind: 'bg', file: '/art/backgrounds/bg-festival-night.webp', status: 'needed', note: 'Stage 1 ① 축제 밤, 밴드 공연 무대' },
  'bg-club-fair': { kind: 'bg', file: '/art/backgrounds/bg-club-fair.webp', status: 'needed', note: 'Stage 1 ② 동아리 박람회 부스 거리 (낮)' },
  'bg-orientation-night': { kind: 'bg', file: '/art/backgrounds/bg-orientation-night.webp', status: 'needed', note: 'Stage 1 ③ 새터 장기자랑 강당 (밤)' },
  'bg-room-night': { kind: 'bg', file: '/art/backgrounds/bg-room-night.webp', status: 'needed', note: 'Stage 2 여주의 자취방 (밤, DM)' },
  'bg-restaurant': { kind: 'bg', file: '/art/backgrounds/bg-restaurant.webp', status: 'needed', note: 'Stage 3 밥약 식당 (메뉴판은 소품으로 얹음)' },
  'bg-pc-dawn': { kind: 'bg', file: '/art/backgrounds/bg-pc-dawn.webp', status: 'needed', note: 'Stage 4 수강신청 새벽 책상과 모니터' },
  'bg-desk-2am': { kind: 'bg', file: '/art/backgrounds/bg-desk-2am.webp', status: 'needed', note: 'Stage 5 조별과제 새벽 2시 책상' },
  'bg-bench-sunset': { kind: 'bg', file: '/art/backgrounds/bg-bench-sunset.webp', status: 'needed', note: 'Stage 5 끝, Stage 6 노을 벤치' },
  'bg-epilogue-night': { kind: 'bg', file: '/art/backgrounds/bg-epilogue-night.webp', status: 'needed', note: '에필로그 밤하늘과 벚꽃' },

  /* 남주 스탠딩 2:3 투명 */
  'sp-namju-a-smile': { kind: 'sprite', file: '/art/sprites/sp-namju-a-smile.webp', status: 'needed', note: '스탠딩 A · 미소' },
  'sp-namju-a-laugh': { kind: 'sprite', file: '/art/sprites/sp-namju-a-laugh.webp', status: 'needed', note: '스탠딩 A · 웃음' },
  'sp-namju-a-cool': { kind: 'sprite', file: '/art/sprites/sp-namju-a-cool.webp', status: 'needed', note: '스탠딩 A · 시크' },
  'sp-namju-a-serious': { kind: 'sprite', file: '/art/sprites/sp-namju-a-serious.webp', status: 'needed', note: '스탠딩 A · 진지' },
  'sp-namju-a-flustered': { kind: 'sprite', file: '/art/sprites/sp-namju-a-flustered.webp', status: 'needed', note: '스탠딩 A · 당황' },
  'sp-namju-a-soft': { kind: 'sprite', file: '/art/sprites/sp-namju-a-soft.webp', status: 'needed', note: '스탠딩 A · 다정' },
  'sp-namju-b-cool': { kind: 'sprite', file: '/art/sprites/sp-namju-b-cool.webp', status: 'needed', note: '스탠딩 B(무대 의상) · 시크' },
  'sp-namju-b-laugh': { kind: 'sprite', file: '/art/sprites/sp-namju-b-laugh.webp', status: 'needed', note: '스탠딩 B(무대 의상) · 웃음' },

  /* CG 16:9 */
  'cg-band-spotlight': { kind: 'cg', file: '/art/cg/cg-band-spotlight.webp', status: 'needed', note: '밴드 공연 기타 솔로, 스포트라이트' },
  'cg-bench-talk': { kind: 'cg', file: '/art/cg/cg-bench-talk.webp', status: 'needed', note: 'Stage 6 노을 벤치 깊은 대화' },
  'cg-true-ending': { kind: 'cg', file: '/art/cg/cg-true-ending.webp', status: 'needed', note: 'TRUE ENDING' },

  /* 리액션 1:1 (배드 엔딩) */
  'rx-namju-lol': { kind: 'reaction', file: '/art/reactions/rx-namju-lol.webp', status: 'needed', note: '배드 엔딩 · "ㅋㅋ 뭐래"', fallback: 'face-laugh' },
  'rx-namju-broke': { kind: 'reaction', file: '/art/reactions/rx-namju-broke.webp', status: 'needed', note: '배드 엔딩 · 텅 빈 통장', fallback: 'face-flustered' },
  'rx-namju-blocked': { kind: 'reaction', file: '/art/reactions/rx-namju-blocked.webp', status: 'needed', note: '배드 엔딩 · 차단', fallback: 'face-serious' },

  /* 소품 1:1 투명, 글씨 없음 */
  'pr-napkin': { kind: 'prop', file: '/art/props/pr-napkin.webp', status: 'ready', note: 'Stage 1 ② 냅킨 쪽지' },
  'pr-flyers': { kind: 'prop', file: '/art/props/pr-flyers.webp', status: 'needed', note: 'Stage 1 동아리 박람회 빈 전단지 (떨어지는 연출)' },
  'pr-menu-board': { kind: 'prop', file: '/art/props/pr-menu-board.webp', status: 'needed', note: 'Stage 3 식당 빈 칠판 메뉴판' },
  'pr-bankbook': { kind: 'prop', file: '/art/props/pr-bankbook.webp', status: 'needed', note: 'Stage 3 배드 엔딩 펼친 빈 통장' },
  'pr-timetable': { kind: 'prop', file: '/art/props/pr-timetable.webp', status: 'needed', note: 'Stage 4 배드 엔딩 빈 시간표 종이' },
  'pr-cheer-captain': { kind: 'prop', file: '/art/props/pr-cheer-captain.webp', status: 'needed', note: 'Stage 1 ① 응원단장 컷인 (인물 컷)' },
});

export type ArtId = keyof typeof ART;

export function isArtId(id: string): id is ArtId {
  return id in ART;
}

/** 쓸 수 있는 그림 경로. 없으면 fallback, 그것도 없으면 null (자리 표시). */
export function artSrc(id: ArtId): string | null {
  const a: ArtEntry = ART[id];
  if (a.status === 'ready') return a.file;
  if (a.fallback && isArtId(a.fallback)) return artSrc(a.fallback);
  return null;
}

export function isReady(id: ArtId): boolean {
  return ART[id].status === 'ready';
}

export const spriteId = (face: string, outfit: 'a' | 'b' = 'a'): ArtId | null => {
  const id = `sp-namju-${outfit}-${face}`;
  if (isArtId(id)) return id;
  const a = `sp-namju-a-${face}`;
  return isArtId(a) ? a : null;
};

export const faceId = (face: string): ArtId => (isArtId(`face-${face}`) ? (`face-${face}` as ArtId) : 'face-smile');
