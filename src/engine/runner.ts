/**
 * 장면 진행 상태 기계 (진행자 화면이 유일한 기준).
 *
 *  lobby ─START→ beats ─NEXT…→ choice[reveal→open→closed→result] ─RESOLVE→ beats(다음 장면)
 *                                                   └─(배드 답)→ bad[화면…→체크포인트] ─RETRY→ choice(15초)
 *
 * 순수 함수라서 테스트·되감기가 쉬워요. 시간(now)은 밖에서 넣어 줘요.
 */
import { scenario as defaultScenario } from '../scenario/daesaengsi';
import type { Option, Scenario, Scene } from '../scenario/schema';
import { clampAffinity, type Counts, type Pick, winner } from './affinity';
import { compileScene, type CompiledScene, type Frame } from './frames';

export type Mode = 'lobby' | 'beats' | 'choice' | 'bad';
export type VotePhase = 'reveal' | 'open' | 'closed' | 'result';

export interface VoteState {
  round: number;
  retry: boolean;
  seconds: number;
  phase: VotePhase;
  /** 마감 시각(ms). 멈춤 중이면 null */
  endsAt: number | null;
  /** 멈춤 중 남은 시간(ms) */
  pausedLeft: number | null;
  counts: Counts;
  voters: number;
  win: Pick | null;
  /** 진행자가 1·2·3으로 직접 골랐는지 (팻말 모드) */
  manual: boolean;
}

export interface RunState {
  mode: Mode;
  scene: string;
  frame: number;
  affinity: number;
  /** 호감도가 마지막으로 오른 순간 (하트 애니메이션 키) */
  affinityUp: number;
  round: number;
  vote: VoteState | null;
  bad: { option: Pick; frame: number } | null;
  history: Omit<RunState, 'history'>[];
}

export type Action =
  | { type: 'START' }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'JUMP'; scene: string }
  | { type: 'OPEN'; now: number }
  | { type: 'CLOSE' }
  | { type: 'TALLY'; counts: Counts; voters: number }
  | { type: 'RESULT'; counts?: Counts; voters?: number }
  | { type: 'PICK'; n: Pick }
  | { type: 'RESOLVE' }
  | { type: 'RETRY' }
  | { type: 'RESTART_TIMER' }
  | { type: 'PAUSE'; now: number }
  | { type: 'RESUME'; now: number };

/* ---------------- 대본 컴파일 캐시 ---------------- */

export class Story {
  readonly byId = new Map<string, CompiledScene>();
  constructor(readonly scenario: Scenario = defaultScenario) {
    for (const s of scenario.scenes) this.byId.set(s.id, compileScene(s));
  }
  get(id: string): CompiledScene {
    const c = this.byId.get(id);
    if (!c) throw new Error(`장면이 없어요: ${id}`);
    return c;
  }
  scene(id: string): Scene {
    return this.get(id).scene;
  }
}

export const story = new Story();

export function initial(st: Story = story): RunState {
  return { mode: 'lobby', scene: st.scenario.start, frame: 0, affinity: 0, affinityUp: 0, round: 0, vote: null, bad: null, history: [] };
}

/* ---------------- 조회 ---------------- */

export function currentFrame(s: RunState, st: Story = story): Frame {
  const c = st.get(s.scene);
  if (s.mode === 'bad' && s.bad) {
    const bf = c.bad[s.bad.option] ?? [];
    if (s.bad.frame < bf.length) return bf[s.bad.frame];
    return { bg: c.end.bg, night: c.end.night, sprite: null, beat: null, key: `${s.scene}:checkpoint` };
  }
  if (s.mode === 'choice') return { bg: c.end.bg, night: c.end.night, sprite: c.end.sprite, beat: null, key: `${s.scene}:choice` };
  return c.frames[Math.min(s.frame, c.frames.length - 1)];
}

export function isCheckpoint(s: RunState, st: Story = story): boolean {
  if (s.mode !== 'bad' || !s.bad) return false;
  return s.bad.frame >= (st.get(s.scene).bad[s.bad.option]?.length ?? 0);
}

export function winningOption(s: RunState, st: Story = story): Option | null {
  const ch = st.scene(s.scene).choice;
  const w = s.vote?.win;
  return ch && w ? ch.options[w - 1] : null;
}

export function timeLeft(v: VoteState, now: number): number {
  if (v.pausedLeft != null) return v.pausedLeft;
  if (v.endsAt == null) return v.seconds * 1000;
  return Math.max(0, v.endsAt - now);
}

/* ---------------- 리듀서 ---------------- */

function snap(s: RunState): RunState {
  const { history, ...rest } = s;
  return { ...s, history: [...history.slice(-200), rest] };
}

function enterFrame(s: RunState, st: Story): RunState {
  const f = st.get(s.scene).frames[s.frame];
  if (f?.affinity) {
    return { ...s, affinity: clampAffinity(s.affinity + f.affinity, st.scenario.hearts), affinityUp: f.affinity > 0 ? s.affinityUp + 1 : s.affinityUp };
  }
  return s;
}

function goto(s: RunState, id: string | undefined, st: Story): RunState {
  if (!id) return s;
  return enterFrame({ ...s, mode: 'beats', scene: id, frame: 0, vote: null, bad: null }, st);
}

function newVote(s: RunState, st: Story, retry: boolean): RunState {
  const ch = st.scene(s.scene).choice!;
  const round = s.round + 1;
  return {
    ...s,
    mode: 'choice',
    round,
    bad: null,
    vote: {
      round, retry, seconds: retry ? ch.retrySeconds ?? 15 : ch.seconds, phase: 'reveal',
      endsAt: null, pausedLeft: null, counts: [0, 0, 0], voters: 0, win: null, manual: false,
    },
  };
}

export function reduce(s: RunState, a: Action, st: Story = story): RunState {
  const c = st.get(s.scene);
  const sc = c.scene;

  switch (a.type) {
    case 'START':
      return s.mode === 'lobby' ? enterFrame({ ...snap(s), mode: 'beats', frame: 0 }, st) : s;

    case 'JUMP':
      return st.byId.has(a.scene) ? goto(snap(s), a.scene, st) : s;

    case 'BACK': {
      const prev = s.history[s.history.length - 1];
      if (!prev) return s;
      return { ...prev, history: s.history.slice(0, -1) };
    }

    case 'NEXT': {
      if (s.mode === 'lobby') return reduce(s, { type: 'START' }, st);
      if (s.mode === 'beats') {
        if (s.frame < c.frames.length - 1) return enterFrame({ ...snap(s), frame: s.frame + 1 }, st);
        if (sc.choice) return newVote(snap(s), st, false);
        if (sc.end) return s;
        return goto(snap(s), sc.next, st);
      }
      if (s.mode === 'choice') {
        if (s.vote?.phase === 'result' && s.vote.win) return reduce(s, { type: 'RESOLVE' }, st);
        return s; // 투표 중에는 스페이스 무시 (실수 방지). 마감은 Enter.
      }
      if (s.mode === 'bad' && s.bad) {
        if (!isCheckpoint(s, st)) return { ...snap(s), bad: { ...s.bad, frame: s.bad.frame + 1 } };
        return reduce(s, { type: 'RETRY' }, st);
      }
      return s;
    }

    case 'OPEN':
      if (s.mode !== 'choice' || !s.vote || s.vote.phase !== 'reveal') return s;
      return { ...s, vote: { ...s.vote, phase: 'open', endsAt: a.now + s.vote.seconds * 1000, pausedLeft: null } };

    case 'PAUSE':
      if (s.vote?.phase !== 'open' || s.vote.pausedLeft != null) return s;
      return { ...s, vote: { ...s.vote, pausedLeft: timeLeft(s.vote, a.now), endsAt: null } };

    case 'RESUME':
      if (s.vote?.phase !== 'open' || s.vote.pausedLeft == null) return s;
      return { ...s, vote: { ...s.vote, endsAt: a.now + s.vote.pausedLeft, pausedLeft: null } };

    case 'RESTART_TIMER':
      if (s.mode !== 'choice' || !s.vote || s.vote.phase === 'result') return s;
      return newVote(s, st, s.vote.retry);

    case 'CLOSE':
      if (s.vote?.phase !== 'open') return s;
      return { ...s, vote: { ...s.vote, phase: 'closed', endsAt: null, pausedLeft: null } };

    case 'TALLY':
      if (!s.vote || s.vote.manual || s.vote.phase === 'result') return s;
      return { ...s, vote: { ...s.vote, counts: a.counts, voters: a.voters } };

    case 'RESULT': {
      if (!s.vote || s.vote.manual) return s;
      const counts = a.counts ?? s.vote.counts;
      return { ...s, vote: { ...s.vote, phase: 'result', counts, voters: a.voters ?? s.vote.voters, win: winner(counts) } };
    }

    case 'PICK':
      if (s.mode !== 'choice' || !s.vote) return s;
      return { ...s, vote: { ...s.vote, phase: 'result', win: a.n, manual: s.vote.phase !== 'result' || s.vote.manual, endsAt: null, pausedLeft: null } };

    case 'RESOLVE': {
      const opt = winningOption(s, st);
      if (!opt || !s.vote?.win) return s;
      if (opt.bad) return { ...snap(s), mode: 'bad', bad: { option: s.vote.win, frame: 0 } };
      const gained = opt.affinity ?? 0;
      const next: RunState = {
        ...snap(s),
        affinity: clampAffinity(s.affinity + gained, st.scenario.hearts),
        affinityUp: gained > 0 ? s.affinityUp + 1 : s.affinityUp,
      };
      return goto(next, opt.go ?? sc.next, st);
    }

    case 'RETRY':
      if (s.mode !== 'bad' || !sc.choice) return s;
      return newVote(snap(s), st, true);
  }
}
