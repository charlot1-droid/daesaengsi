/**
 * 리허설 모드: 같은 브라우저의 탭끼리 BroadcastChannel로 주고받아요.
 * Supabase 없이 진행자 탭 + 관객 탭 몇 개로 흐름 전체를 돌려 볼 수 있어요.
 * (다른 기기와는 연결되지 않아요 — 실제 행사는 Supabase.)
 */
import type { Pick } from '../engine/affinity';
import { nickProblem } from './nickname';
import type { HostLink, JoinMode, JoinResult, Me, PlayerLink, Poll, RoomState } from './types';

const CH = 'daesaengsi-local';

type Msg =
  | { k: 'state'; pin: string; state: RoomState }
  | { k: 'hello'; pin: string }
  | { k: 'join'; pin: string; nick: string; mode: JoinMode; req: string }
  | { k: 'resume'; pin: string; playerId: string; secret: string; req: string }
  | { k: 'vote'; pin: string; playerId: string; secret: string; round: number; option: Pick; req: string }
  | { k: 'reply'; req: string; ok: boolean; me?: Me; reason?: string };

const rid = () => Math.random().toString(36).slice(2, 10);

export function localHost(pin: string): HostLink {
  const ch = new BroadcastChannel(CH);
  const players = new Map<string, { nick: string; secret: string; at: number }>();
  const votes = new Map<number, Map<string, Pick>>();
  let last: RoomState | null = null;

  const reply = (req: string, ok: boolean, extra: Partial<Msg & { k: 'reply' }> = {}) => ch.postMessage({ k: 'reply', req, ok, ...extra } satisfies Msg);

  ch.onmessage = ({ data }: MessageEvent<Msg>) => {
    // 다른 방 번호는 대답하지 않아요 (응답이 없으면 휴대폰 쪽에서 '번호 확인'으로 처리)
    if (!('pin' in data) || data.pin !== pin) return;
    switch (data.k) {
      case 'hello':
        if (last) ch.postMessage({ k: 'state', pin, state: last } satisfies Msg);
        return;
      case 'join': {
        if (nickProblem(data.nick)) return reply(data.req, false, { reason: 'name-bad' });
        const same = [...players.entries()].filter(([, p]) => p.nick === data.nick).sort((a, b) => b[1].at - a[1].at);
        if (same.length && data.mode === 'ask') return reply(data.req, false, { reason: 'name-exists' });
        if (same.length && data.mode === 'claim') {
          const [playerId, p] = same[0];
          return reply(data.req, true, { me: { pin, playerId, secret: p.secret, nickname: data.nick } });
        }
        const playerId = rid(), secret = rid();
        players.set(playerId, { nick: data.nick, secret, at: Date.now() });
        return reply(data.req, true, { me: { pin, playerId, secret, nickname: data.nick } });
      }
      case 'resume':
        return reply(data.req, players.get(data.playerId)?.secret === data.secret);
      case 'vote': {
        const p = players.get(data.playerId);
        const open = last?.phase === 'vote' && last.round === data.round && !last.paused;
        if (!p || p.secret !== data.secret || !open) return reply(data.req, false);
        if (!votes.has(data.round)) votes.set(data.round, new Map());
        votes.get(data.round)!.set(data.playerId, data.option);
        return reply(data.req, true);
      }
    }
  };

  return {
    kind: 'local',
    pin,
    async publish(state) {
      last = state;
      ch.postMessage({ k: 'state', pin, state } satisfies Msg);
    },
    async poll(round): Promise<Poll> {
      const counts: [number, number, number] = [0, 0, 0];
      const r = round != null ? votes.get(round) : undefined;
      r?.forEach((o) => counts[o - 1]++);
      const list = [...players.values()].sort((a, b) => b.at - a.at);
      return { players: players.size, names: list.slice(0, 40).map((p) => p.nick), counts, voters: r?.size ?? 0 };
    },
    close() {
      ch.close();
    },
  };
}

export function localPlayer(): PlayerLink {
  const ch = new BroadcastChannel(CH);
  const waiting = new Map<string, (m: Msg & { k: 'reply' }) => void>();
  const listeners = new Set<(m: Msg) => void>();
  ch.onmessage = ({ data }: MessageEvent<Msg>) => {
    if (data.k === 'reply') waiting.get(data.req)?.(data);
    listeners.forEach((l) => l(data));
  };

  const ask = (m: Msg & { req: string }, ms = 1500) =>
    new Promise<(Msg & { k: 'reply' }) | null>((res) => {
      const t = setTimeout(() => { waiting.delete(m.req); res(null); }, ms);
      waiting.set(m.req, (r) => { clearTimeout(t); waiting.delete(m.req); res(r); });
      ch.postMessage(m);
    });

  return {
    kind: 'local',
    async join(pin, nick, mode = 'ask'): Promise<JoinResult> {
      const r = await ask({ k: 'join', pin, nick, mode, req: rid() });
      if (!r) return { ok: false, reason: 'pin' }; // 응답하는 진행자 탭이 없음
      return r.ok && r.me ? { ok: true, me: r.me } : { ok: false, reason: (r.reason as 'pin') ?? 'pin' };
    },
    async resume(me) {
      const r = await ask({ k: 'resume', pin: me.pin, playerId: me.playerId, secret: me.secret, req: rid() });
      return !!r?.ok;
    },
    subscribe(me, cb) {
      const l = (m: Msg) => { if (m.k === 'state' && m.pin === me.pin) cb(m.state); };
      listeners.add(l);
      ch.postMessage({ k: 'hello', pin: me.pin } satisfies Msg);
      return () => listeners.delete(l);
    },
    async vote(me, round, option) {
      const r = await ask({ k: 'vote', pin: me.pin, playerId: me.playerId, secret: me.secret, round, option, req: rid() });
      return !!r?.ok;
    },
  };
}
