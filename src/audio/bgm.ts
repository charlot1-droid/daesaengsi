/**
 * 배경음악 — public/audio/bgm-<이름>.mp3 를 반복 재생하고, 곡이 바뀌면 부드럽게 넘겨요(크로스페이드).
 * 브라우저는 사용자가 한 번 누르기 전엔 소리를 막을 수 있어요 → 첫 클릭·키 입력 때 다시 시도해요.
 * 곡은 tools/music.py로 직접 만든 원곡이에요. 다른 곡으로 바꾸려면 같은 이름의 mp3로 덮어쓰면 돼요.
 */
import type { Bgm } from '../scenario/schema';

const VOLUME = 0.42;
const FADE_MS = 1200;

let want: Bgm | null = null;
let muted = false;
let duck = 1;
const players = new Map<Bgm, HTMLAudioElement>();
let current: { name: Bgm; el: HTMLAudioElement } | null = null;

function el(name: Bgm) {
  let a = players.get(name);
  if (!a) {
    a = new Audio(`/audio/bgm-${name}.mp3`);
    a.loop = true;
    a.preload = 'auto';
    a.volume = 0;
    players.set(name, a);
  }
  return a;
}

function fade(a: HTMLAudioElement, to: number, ms = FADE_MS, then?: () => void) {
  const from = a.volume;
  const start = performance.now();
  const step = (now: number) => {
    const k = Math.min(1, (now - start) / ms);
    a.volume = Math.max(0, Math.min(1, from + (to - from) * k));
    if (k < 1) requestAnimationFrame(step);
    else then?.();
  };
  requestAnimationFrame(step);
}

const target = () => (muted ? 0 : VOLUME * duck);

function apply() {
  if (!want) {
    if (current) { const c = current; fade(c.el, 0, FADE_MS, () => c.el.pause()); current = null; }
    return;
  }
  if (current?.name === want) { fade(current.el, target(), 400); return; }
  const prev = current;
  const next = el(want);
  current = { name: want, el: next };
  if (prev) fade(prev.el, 0, FADE_MS, () => prev.el.pause());
  next.currentTime = 0;
  next.play().then(() => fade(next, target()), () => { /* 아직 막혀 있으면 첫 입력 때 다시 */ });
}

/** 이 곡을 틀어 주세요 (같은 곡이면 그대로 이어서) */
export function setBgm(name: Bgm | null) {
  if (name === want) return;
  want = name;
  apply();
}

export function setBgmMuted(m: boolean) {
  muted = m;
  if (current) fade(current.el, target(), 300);
}

/** 대사·효과음 위로 잠깐 작게 (0~1) */
export function duckBgm(level: number) {
  duck = level;
  if (current) fade(current.el, target(), 300);
}

// 자동 재생이 막혔으면 첫 입력 때 다시 틀어요
if (typeof window !== 'undefined') {
  const unlock = () => {
    if (current && current.el.paused) current.el.play().then(() => fade(current!.el, target()), () => {});
  };
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);
}
