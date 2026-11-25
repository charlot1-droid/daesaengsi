/**
 * 대본 데이터 모양.
 *
 * 대본은 장면(Scene) 단위로 쓰고, 장면 안은 비트(Beat)의 목록이에요.
 * 비트 하나 = 진행자가 스페이스를 한 번 누를 때 바뀌는 한 화면.
 * (DM처럼 여러 메시지가 하나의 비트에 들어 있으면 메시지마다 한 번씩 눌러요.)
 *
 * 대사를 고칠 때는 src/scenario/daesaengsi.ts의 문장만 바꾸면 돼요.
 * 바꾼 뒤 `npm run check`로 장면 연결·글자 수·이미지 이름을 검사해요.
 */
import type { ArtId } from '../art/manifest';

/** 남주 표정 (스탠딩 스프라이트 · 얼굴 컷 공용) */
export type Face = 'smile' | 'laugh' | 'cool' | 'serious' | 'flustered' | 'soft';
/** 새봄 표정 (스탠딩) */
export type SaebomFace = 'smile' | 'laugh' | 'surprised' | 'wave' | 'wink';
/** 남주 의상: A = 크림 니트(기본), B = 무대 */
export type Outfit = 'a' | 'b';

export type Sfx = 'pop' | 'heart' | 'bad' | 'dm' | 'reveal' | 'whoosh' | 'applause' | 'drumroll' | 'fanfare' | 'chime' | 'guitar' | 'cheer' | 'heartbeat' | 'coins';
/** 배경음악 (public/audio/bgm-<이름>.mp3) */
export type Bgm = 'title' | 'campus' | 'festival' | 'night' | 'tense' | 'emotional' | 'ending';
export type Fx = 'shake' | 'flyers';

/** 화자. cast에 이름을 등록해요. */
export type SpeakerId = 'narrator' | 'yeoju' | 'namju' | 'friend' | 'captain' | (string & {});

export interface CastMember {
  name: string;
  /** 이름 탭 옆 작은 글씨 (예: '밴드 동아리 선배', '나') */
  sub?: string;
  /** 이름 탭 모양: namju = 잉크 채움, yeoju = 잉크 테두리, narrator = 탭 없음 */
  tab: 'namju' | 'yeoju' | 'narrator';
}

/* ---------------- 비트 ---------------- */

interface BeatBase {
  sfx?: Sfx;
  fx?: Fx;
}

/** 대사. 지문은 괄호로: '(당황하며) 네, 네?' */
export interface SayBeat extends BeatBase {
  t: 'say';
  who: SpeakerId;
  text: string;
  /**
   * 말하는 사람의 스탠딩 표정 (남주: Face, 새봄: SaebomFace).
   * 한 번 정하면 다음 표정 지정 전까지 유지돼요. null이면 그 사람이 내려가요.
   * 둘 다 서 있으면 새봄은 왼쪽, 남주는 오른쪽.
   */
  face?: Face | SaebomFace | null;
}

/** 화면 위쪽 가운데 한 문장 (규칙, BPM, 차단 알림 등) */
export interface NoticeBeat extends BeatBase {
  t: 'notice';
  text: string;
  sub?: string;
  tone?: 'heart';
}

/** 대사창 아래로 잠깐 내려오는 알림. 관계가 바뀌는 순간에만. */
export interface NotifyBeat extends BeatBase {
  t: 'notify';
  text: string;
  face?: Face;
  /** 호감도 변화(+1 등). 이 알림이 보이는 순간 반영돼요. */
  affinity?: number;
}

export interface PhoneMsg {
  /** note = 말풍선이 아닌 가운데 안내 줄 ('○○ 님이 읽었습니다', '○○ 님이 나갔습니다') */
  from: 'me' | 'them' | 'note';
  text: string;
  /** 단톡방에서 받은 말풍선 위 보낸 사람 이름 */
  name?: string;
}

/** 이야기 속 휴대폰 DM/단톡방. msgs가 한 번에 하나씩 올라와요. */
export interface PhoneBeat extends BeatBase {
  t: 'phone';
  title: string;
  handle?: string;
  face?: Face;
  time?: string;
  /** 마지막 메시지 뒤 '읽음' 표시 */
  read?: boolean;
  msgs: PhoneMsg[];
  /** 이전 phone 비트의 메시지에 이어 붙이기 (같은 대화방) */
  continues?: boolean;
}

/** 소품 클로즈업. 그림은 글씨 없는 빈 물건, 글자는 화면에서 얹어요. */
export interface PropBeat extends BeatBase {
  t: 'prop';
  art: ArtId;
  hand: 'pen' | 'chalk' | 'print';
  text: string;
  /** 글자 위치 (%) · 기울기 · 크기(1080p px) — 물건마다 맞춰요 */
  place?: { x?: string; y?: string; w?: string; rot?: string; fs?: number };
  /**
   * 그림 속 표면의 네 모서리 (그림 크기 대비 %, 왼쪽 위 → 오른쪽 위 → 오른쪽 아래 → 왼쪽 아래).
   * 주면 글자를 그 면에 원근까지 맞춰 '인쇄된 것처럼' 붙여요. place 대신 씀.
   * top: 면 안에서 글자 위치(위에서 %), fs: 크기(px@1080p), raise: 살짝 올릴 글자, small: 작게 쓸 글자 (실제 표지 손글씨 리듬 흉내)
   */
  surface?: { quad: [[number, number], [number, number], [number, number], [number, number]]; aspect: number; top: number; fs: number; ink?: string; raise?: string; small?: string };
  size?: number;
  /** 인물 컷인처럼 가장자리에서 잘린 그림을 둥근 판 안에 넣어 보여 줘요 (글자 없는 그림용) */
  frame?: boolean;
}

/** 스테이지 표지 */
export interface SplashBeat extends BeatBase {
  t: 'splash';
  title: string;
  sub?: string;
}

/** 배경 바꾸기 (CG 포함). 다음 bg 비트 전까지 유지돼요. 화면이 따로 생기지 않아요. */
export interface BgBeat {
  t: 'bg';
  art: ArtId;
  night?: boolean;
}

/**
 * 스탠딩 바꾸기만 (화면이 따로 생기지 않아요).
 * who 없이 face: null이면 모두 내려가요. who: 'saebom'이면 새봄만.
 */
export interface SpriteBeat {
  t: 'sprite';
  who?: 'namju' | 'saebom';
  face: Face | SaebomFace | null;
  outfit?: Outfit;
}

/** 팀 나눔 질문. 휴대폰에는 '팀과 이야기 나눠 주세요'만 떠요. */
export interface ShareBeat extends BeatBase {
  t: 'share';
  q: string;
  hint?: string;
  seconds?: number;
  /**
   * 팀 나눔이 아니라 다 같이 하는 활동(율동 따라 하기 등)일 때 판 위 작은 글씨.
   * 있으면 '팀 나눔 질문 n / m' 대신 이 글씨가 뜨고, 휴대폰에는 '무대를 보고 함께해요'가 떠요.
   */
  label?: string;
  /**
   * 질문 여러 개를 한 판에 번호로 늘어놓기 (원하는 질문을 골라 자유롭게 나누는 방식, 타이머는 하나).
   * 있으면 q는 판의 제목이 되고, label은 그대로 작은 글씨로만 쓰여요. 휴대폰에도 같은 목록이 떠요.
   */
  items?: { q: string; hint?: string }[];
}

/** HTML로 그리는 '화면 속 화면' (수강신청 모니터 등) */
export interface ScreenBeat extends BeatBase {
  t: 'screen';
  view: 'sugang' | 'title' | 'reveal';
  text?: string;
  sub?: string;
}

export type Beat =
  | SayBeat
  | NoticeBeat
  | NotifyBeat
  | PhoneBeat
  | PropBeat
  | SplashBeat
  | BgBeat
  | SpriteBeat
  | ShareBeat
  | ScreenBeat;

/* ---------------- 선택지 ---------------- */

export interface BadEnding {
  /** 큰 결말 문장 (Checkpoint 제목) */
  title: string;
  /** '메뉴 고르기 전으로 돌아가요. 15초 안에 다시 고르세요.' */
  back: string;
  /** 왼쪽 리액션 컷 */
  react: ArtId;
  /** 체크포인트 판 전에 보여 줄 장면 (차단 공지, 통장 소품 등) */
  beats?: Beat[];
}

export interface Option {
  /** 무대 카드 문장 */
  label: string;
  /** 휴대폰 버튼 문장 (없으면 label) */
  phone?: string;
  /** 이 답이 이야기가 고른 길이 되면 갈 장면. 없으면 scene.next */
  go?: string;
  /** 이 답을 고르면 배드 엔딩 → 같은 선택지로 돌아와요 */
  bad?: BadEnding;
  /** 고르면 바로 반영할 호감도 변화 */
  affinity?: number;
  /** 휴대폰 결과 카드 제목 (예: '밥약 성공') */
  verdict?: string;
}

export interface Choice {
  q: string;
  /** 첫 선택 30, 일반 20 */
  seconds: number;
  /** 배드 엔딩 뒤 재선택 (기본 15) */
  retrySeconds?: number;
  options: [Option, Option, Option];
}

/* ---------------- 장면 ---------------- */

export interface Scene {
  id: string;
  /** 아래 모서리 칩: { n: 'Stage 2', name: '두근두근 첫 메시지' } */
  stage?: { n: string; name: string };
  bg: ArtId;
  night?: boolean;
  /** 배경음악. 없으면 앞 장면 곡을 이어서 틀어요 */
  bgm?: Bgm;
  beats: Beat[];
  choice?: Choice;
  /** 선택지가 없거나 option.go가 없을 때 다음 장면 */
  next?: string;
  /** 마지막 장면 */
  end?: boolean;
}

export interface Scenario {
  title: string;
  start: string;
  cast: Record<string, CastMember>;
  /** 호감도 칸 수 */
  hearts: number;
  scenes: Scene[];
}
