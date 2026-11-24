/** 진행 상태(RunState) → 휴대폰에 보낼 RoomState */
import { CONFIG } from '../config';
import { clampAffinity, shares } from '../engine/affinity';
import { currentFrame, isCheckpoint, story, timeLeft, winningOption, type RunState, type Story } from '../engine/runner';
import { txt } from '../scenario/text';
import type { RoomState } from './types';

type Unseq<T> = T extends unknown ? Omit<T, 'seq'> : never;
export type RoomDraft = Unseq<RoomState>;

export function deriveRoom(run: RunState, now: number, st: Story = story): RoomDraft {
  if (run.mode === 'lobby') return { phase: 'lobby' };
  const sc = st.scene(run.scene);
  const night = currentFrame(run, st).night;

  if (run.mode === 'beats') {
    if (sc.end) return { phase: 'end', link: CONFIG.endLink || undefined };
    const b = currentFrame(run, st).beat;
    if (b?.t === 'share') {
      const items = b.items?.map((it) => ({ q: txt(it.q), hint: it.hint ? txt(it.hint) : undefined }));
      return { phase: 'share', q: txt(b.q), label: b.label ? txt(b.label) : undefined, items, night };
    }
    return { phase: 'wait', stage: sc.stage ? `${sc.stage.n} · ${txt(sc.stage.name)}` : undefined, night };
  }

  if (run.mode === 'bad') {
    return { phase: 'wait', note: isCheckpoint(run, st) ? '곧 다시 고를 수 있어요' : '배드 엔딩! 무대를 봐 주세요', night };
  }

  const v = run.vote!;
  const ch = sc.choice!;
  const q = txt(ch.q);
  const options = ch.options.map((o) => txt(o.phone ?? o.label)) as [string, string, string];

  switch (v.phase) {
    case 'reveal':
      return { phase: 'wait', note: '곧 선택지가 열려요', night };
    case 'open':
      return { phase: 'vote', round: v.round, q, options, seconds: v.seconds, leftMs: timeLeft(v, now), paused: v.pausedLeft != null, retry: v.retry, night };
    case 'closed':
      return { phase: 'closed', round: v.round, q, options, night };
    case 'result': {
      const opt = winningOption(run, st);
      if (!opt || !v.win) return { phase: 'closed', round: v.round, q, options, night };
      return {
        phase: 'result', round: v.round, q, options, win: v.win, pct: shares(v.counts),
        verdict: opt.verdict ? txt(opt.verdict) : undefined, bad: !!opt.bad,
        affinity: clampAffinity(run.affinity + (opt.affinity ?? 0), st.scenario.hearts), hearts: st.scenario.hearts, night,
      };
    }
  }
}

/** 같은 내용인지 비교할 열쇠 (남은 시간은 빼고) */
export function roomKey(d: RoomDraft): string {
  const { leftMs: _ignored, ...rest } = d as RoomDraft & { leftMs?: number };
  return JSON.stringify(rest);
}
