/**
 * 효과음 — public/audio/<이름>.mp3 (tools/music.py로 만든 원본). 파일을 못 읽으면 WebAudio로 즉석 합성해요.
 * 다른 소리로 바꾸려면 같은 이름의 mp3로 덮어쓰면 돼요.
 */
import type { Sfx } from '../scenario/schema';

let ctx: AudioContext | null = null;
let muted = false;

export const setMuted = (m: boolean) => { muted = m; };
export const isMuted = () => muted;

function tone(freq: number, at: number, dur: number, type: OscillatorType = 'sine', gain = 0.18) {
  const c = ctx!;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, c.currentTime + at);
  g.gain.setValueAtTime(0, c.currentTime + at);
  g.gain.linearRampToValueAtTime(gain, c.currentTime + at + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + at + dur);
  o.connect(g).connect(c.destination);
  o.start(c.currentTime + at);
  o.stop(c.currentTime + at + dur + 0.05);
}

type Name = Sfx | 'tick' | 'open' | 'join' | 'vote';
const FILES: Name[] = ['pop', 'heart', 'bad', 'dm', 'reveal', 'whoosh', 'tick', 'open', 'join', 'applause', 'drumroll', 'fanfare', 'chime', 'vote'];
const cache = new Map<Name, HTMLAudioElement>();
const VOL: Partial<Record<Name, number>> = { tick: 0.5, applause: 0.8, join: 0.5 };

function playFile(name: Name): boolean {
  if (!FILES.includes(name)) return false;
  let base = cache.get(name);
  if (!base) { base = new Audio(`/audio/${name}.mp3`); base.preload = 'auto'; cache.set(name, base); }
  const a = base.cloneNode() as HTMLAudioElement;
  a.volume = VOL[name] ?? 0.85;
  a.play().catch(() => fallback(name));
  return true;
}

/** 미리 받아 두기 (첫 재생이 늦지 않게) */
export function preloadSfx() {
  FILES.forEach((n) => { if (!cache.has(n)) { const a = new Audio(`/audio/${n}.mp3`); a.preload = 'auto'; cache.set(n, a); } });
}

function fallback(name: Name) {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    (RECIPES[name] ?? RECIPES.pop)?.();
  } catch { /* 소리를 못 내도 진행은 계속 */ }
}

const RECIPES: Partial<Record<Name, () => void>> = {
  pop: () => tone(880, 0, 0.08, 'triangle'),
  open: () => { tone(660, 0, 0.1, 'triangle'); tone(990, 0.1, 0.14, 'triangle'); },
  tick: () => tone(1200, 0, 0.04, 'square', 0.06),
  reveal: () => [523, 659, 784].forEach((f, i) => tone(f, i * 0.09, 0.25, 'triangle')),
  heart: () => { tone(784, 0, 0.12); tone(1047, 0.12, 0.25); },
  dm: () => { tone(1320, 0, 0.06, 'sine', 0.12); tone(1760, 0.07, 0.08, 'sine', 0.12); },
  bad: () => { tone(330, 0, 0.18, 'sawtooth', 0.1); tone(247, 0.18, 0.32, 'sawtooth', 0.1); },
  whoosh: () => tone(220, 0, 0.3, 'sawtooth', 0.05),
};

export function play(name: Name) {
  if (muted) return;
  if (!playFile(name)) fallback(name);
}
