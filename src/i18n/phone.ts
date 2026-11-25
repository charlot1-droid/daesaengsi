/**
 * 휴대폰 화면 언어 (한국어 / English).
 * - 화면 문구는 UI 표에서, 대본 문장(대사·질문·선택지)은 scenario/en.ts 번역 사전에서 찾아요.
 * - 고른 언어는 휴대폰에 저장돼요. 처음엔 휴대폰 언어 설정을 따라요.
 */
import { useCallback, useEffect, useState } from 'react';
import { EN } from '../scenario/en';

export type Lang = 'ko' | 'en';
const KEY = 'daesaengsi.lang';

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'ko' || saved === 'en') return saved;
  } catch { /* 저장소를 못 쓰면 기본값 */ }
  return (navigator.language || 'ko').toLowerCase().startsWith('ko') ? 'ko' : 'en';
}

let current: Lang = typeof window === 'undefined' ? 'ko' : initialLang();
const listeners = new Set<(l: Lang) => void>();

export function useLang() {
  const [lang, set] = useState<Lang>(current);
  useEffect(() => {
    listeners.add(set);
    document.documentElement.lang = current;
    return () => { listeners.delete(set); };
  }, []);
  const setLang = useCallback((l: Lang) => {
    current = l;
    try { localStorage.setItem(KEY, l); } catch { /* 무시 */ }
    document.documentElement.lang = l;
    listeners.forEach((f) => f(l));
  }, []);
  return { lang, setLang };
}

/** 대본 문장 번역 (영어에서 사전에 없으면 원문) */
export const tr = (ko: string | undefined, lang: Lang) => (!ko ? '' : lang === 'en' ? EN[ko] ?? ko : ko);

type Dict = Record<string, { ko: string; en: string }>;
const UI = {
  join_title: { ko: '게임에 들어가기', en: 'Join the game' },
  join_body: { ko: '무대 화면의 입장 번호를 적어 주세요. 로그인은 필요 없어요.', en: 'Enter the room number shown on the stage screen. No login needed.' },
  pin: { ko: '입장 번호', en: 'Room number' },
  name: { ko: '이름 ({n}자까지)', en: 'Name (up to {n} characters)' },
  joining: { ko: '들어가는 중', en: 'Joining…' },
  join: { ko: '입장하기', en: 'Join' },
  err_pin6: { ko: '입장 번호 6자리를 적어 주세요.', en: 'Please enter the 6-digit room number.' },
  err_pin: { ko: '열린 게임이 없어요. 번호를 다시 확인해 주세요.', en: 'No open game with that number. Please check it again.' },
  err_taken: { ko: '이미 있는 이름이에요. 다른 이름을 써 주세요.', en: 'That name is taken. Please use another one.' },
  err_name: { ko: '다른 이름을 써 주세요.', en: 'Please use a different name.' },
  err_net: { ko: '연결이 불안정해요. 다시 눌러 주세요.', en: 'The connection is unstable. Please tap again.' },
  connecting: { ko: '연결하는 중', en: 'Connecting…' },
  me: { ko: '나는', en: "I'm" },
  joined: { ko: '입장 완료!', en: "You're in!" },
  joined_body: { ko: '곧 시작해요. 무대 화면을 봐 주세요.', en: 'Starting soon. Please watch the stage screen.' },
  watch: { ko: '무대를 봐 주세요', en: 'Watch the stage' },
  now_line: { ko: '지금 대사', en: 'Now on stage' },
  narration: { ko: '나레이션', en: 'Narration' },
  notice: { ko: '안내', en: 'Notice' },
  alert: { ko: '알림', en: 'Alert' },
  soon_choice: { ko: '곧 선택지가 열려요', en: 'The choices open soon' },
  checkpoint: { ko: '곧 다시 고를 수 있어요', en: "You'll get to choose again soon" },
  bad_watch: { ko: '배드 엔딩! 무대를 봐 주세요', en: 'Bad ending! Watch the stage' },
  retry: { ko: '다시 투표! 이번엔 잘 골라 봐요.', en: 'Vote again! Choose wisely this time.' },
  paused: { ko: '잠깐 멈췄어요', en: 'Paused' },
  closed: { ko: '마감', en: 'Closed' },
  sec_left: { ko: '{n}초 남음', en: '{n}s left' },
  sending: { ko: '전송 중', en: 'Sending…' },
  sent: { ko: '{n}번 선택 완료', en: 'You picked {n}' },
  sent_sub: { ko: '마감 전에는 바꿀 수 있어요', en: 'You can change it until voting closes' },
  failed: { ko: '전송 실패, 다시 눌러 주세요', en: 'Failed to send — tap again' },
  vote_closed: { ko: '투표 마감', en: 'Voting closed' },
  counting: { ko: '결과를 세고 있어요', en: 'Counting the votes' },
  i_picked: { ko: '나는 {n}번 "{label}"을 골랐어요.', en: 'You picked {n}: "{label}".' },
  no_pick: { ko: '이번에는 고르지 않았어요.', en: "You didn't vote this time." },
  path: { ko: '이야기가 고른 길 ({p}%)', en: 'The story goes with ({p}%)' },
  tie: { ko: '동률이라 추첨으로 정했어요', en: 'It was a tie, so it was decided by a draw' },
  bad_end: { ko: '배드 엔딩!', en: 'Bad ending!' },
  goes_on: { ko: '이야기가 이어져요', en: 'The story continues' },
  me_too: { ko: '나도 {n}번을 골랐어요.', en: 'You picked {n} too.' },
  me_other: { ko: '나는 {n}번을 골랐어요.', en: 'You picked {n}.' },
  look_stage: { ko: '무대 화면을 봐 주세요.', en: 'Please watch the stage screen.' },
  affinity: { ko: '남주 호감도', en: "Namju's affection" },
  share: { ko: '팀 나눔', en: 'Team sharing' },
  share_do: { ko: '무대를 보고 함께해요', en: 'Follow along with the stage' },
  share_talk: { ko: '팀과 이야기 나눠 주세요', en: 'Talk it over with your team' },
  thanks: { ko: '함께해 줘서 고마워요', en: 'Thanks for playing with us' },
  thanks_body: { ko: '오늘 고른 답들이 모여 여주의 대학 생활이 됐어요.', en: "Together, your choices today became Yeoju's college life." },
  lang: { ko: '언어', en: 'Language' },
} satisfies Dict;

export type UiKey = keyof typeof UI;
export function t(key: UiKey, lang: Lang, vars?: Record<string, string | number>) {
  let s: string = UI[key][lang];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

/** 진행자가 보내는 고정 안내 문구(한국어) → UI 키 */
export const NOTE_KEYS: Record<string, UiKey> = {
  '곧 선택지가 열려요': 'soon_choice',
  '곧 다시 고를 수 있어요': 'checkpoint',
  '배드 엔딩! 무대를 봐 주세요': 'bad_watch',
};
