/**
 * 효과음 (WebAudio로 즉석 합성 — 파일 없음).
 * 나중에 실제 효과음 파일로 바꾸려면 play()에서 Audio 객체를 재생하면 돼요.
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

const RECIPES: Record<Sfx | 'tick' | 'open', () => void> = {
  pop: () => tone(880, 0, 0.08, 'triangle'),
  open: () => { tone(660, 0, 0.1, 'triangle'); tone(990, 0.1, 0.14, 'triangle'); },
  tick: () => tone(1200, 0, 0.04, 'square', 0.06),
  reveal: () => [523, 659, 784].forEach((f, i) => tone(f, i * 0.09, 0.25, 'triangle')),
  heart: () => { tone(784, 0, 0.12); tone(1047, 0.12, 0.25); },
  dm: () => { tone(1320, 0, 0.06, 'sine', 0.12); tone(1760, 0.07, 0.08, 'sine', 0.12); },
  bad: () => { tone(330, 0, 0.18, 'sawtooth', 0.1); tone(247, 0.18, 0.32, 'sawtooth', 0.1); },
  whoosh: () => tone(220, 0, 0.3, 'sawtooth', 0.05),
};

export function play(name: keyof typeof RECIPES) {
  if (muted) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    RECIPES[name]();
  } catch { /* 소리를 못 내도 진행은 계속 */ }
}
