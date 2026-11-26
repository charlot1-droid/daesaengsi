/**
 * 실제 행사용: Supabase.
 *  - 진행 상태: 진행자가 RPC(host_set_state)로 rooms.state를 바꾸고, 휴대폰은 1.5초마다 RPC(room_state)로 읽어요.
 *    (실시간 채널은 쓰지 않아요 — 무료 플랜 한도 때문에)
 *  - 투표: RPC(cast_vote) — 서버가 '지금 투표 중인 라운드인지' 확인하고 (방·라운드·사람)당 한 표로 덮어써요.
 *  - 집계: 진행자가 0.5초마다 RPC(host_poll)로 받아 와요.
 * 테이블·함수는 supabase/migrations/001_init.sql.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Pick } from '../engine/affinity';
import type { HostLink, JoinResult, PlayerLink, Poll, RoomState } from './types';

let client: SupabaseClient | null = null;
function sb(): SupabaseClient {
  if (!client) {
    client = createClient(import.meta.env.VITE_SUPABASE_URL!, import.meta.env.VITE_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false },
      realtime: { params: { eventsPerSecond: 5 } },
    });
  }
  return client;
}

const HOST_KEY = 'daesaengsi.host';
/** 휴대폰이 진행 상태를 읽는 주기 */
const POLL_MS = 1500;

/** 진행자 노트북을 새로고침해도 같은 방(PIN)을 이어 쓰도록 sessionStorage에 보관 */
function loadHost(): { pin: string; key: string } | null {
  try { return JSON.parse(sessionStorage.getItem(HOST_KEY) ?? 'null'); } catch { return null; }
}
function saveHost(v: { pin: string; key: string }) {
  try { sessionStorage.setItem(HOST_KEY, JSON.stringify(v)); } catch { /* 저장 못 해도 진행에는 문제 없음 */ }
}

export async function supabaseHost(fresh = false): Promise<HostLink> {
  let room = fresh ? null : loadHost();
  if (room) {
    const { error } = await sb().rpc('host_poll', { p_pin: room.pin, p_key: room.key, p_round: null });
    if (error) room = null;
  }
  if (!room) {
    const { data, error } = await sb().rpc('create_room');
    if (error || !data?.[0]) throw new Error(`방을 만들지 못했어요: ${error?.message}`);
    room = { pin: data[0].pin, key: data[0].host_key };
    saveHost(room);
  }
  const { pin, key } = room;

  // 휴대폰은 실시간 채널 없이 1.5초마다 rooms.state를 읽어 가요.
  // (무료 플랜 실시간 한도: 동시 접속 200 · 초당 메시지 100 — 관객 200명이면 넘어서 쓰지 않아요)

  return {
    kind: 'supabase',
    pin,
    async publish(state) {
      const { error } = await sb().rpc('host_set_state', { p_pin: pin, p_key: key, p_state: state });
      if (error) throw error;
    },
    async poll(round): Promise<Poll> {
      const { data, error } = await sb().rpc('host_poll', { p_pin: pin, p_key: key, p_round: round });
      if (error) throw error;
      return data as Poll;
    },
    close() {
      void sb().removeAllChannels();
    },
  };
}

export function supabasePlayer(): PlayerLink {
  return {
    kind: 'supabase',
    async join(pin, nickname): Promise<JoinResult> {
      const { data, error } = await sb().rpc('join_room', { p_pin: pin, p_nick: nickname });
      if (error) {
        const m = error.message;
        if (m.includes('NO_ROOM')) return { ok: false, reason: 'pin' };
        if (m.includes('NAME_TAKEN')) return { ok: false, reason: 'name-taken' };
        if (m.includes('NAME_BAD')) return { ok: false, reason: 'name-bad' };
        return { ok: false, reason: 'network' };
      }
      const row = data[0];
      return { ok: true, me: { pin, playerId: row.player_id, secret: row.secret, nickname } };
    },
    async resume(me) {
      // 화면이 막 켜졌을 땐 네트워크가 잠깐 끊겨 있을 수 있어요 → 서버가 '아니다'라고 할 때만 다시 입장
      try {
        const { data, error } = await sb().rpc('player_check', { p_player: me.playerId, p_secret: me.secret });
        return error ? true : data === true;
      } catch { return true; }
    },
    subscribe(me, cb) {
      // 실시간 채널 없이 1.5초마다 현재 상태를 읽어요 (관객 200명도 무료 플랜 실시간 한도와 상관없이).
      // 화면이 꺼졌다 켜지면 바로 한 번 더 읽어요.
      let seq = -1;
      let busy = false;
      const take = (s: RoomState | null) => {
        if (s && typeof s.seq === 'number' && s.seq >= seq) { seq = s.seq; cb(s); }
      };
      const refetch = async () => {
        if (busy) return;
        busy = true;
        try {
          const r = await sb().rpc('room_state', { p_pin: me.pin });
          if (!r.error) return take((r.data as RoomState) ?? null);
          const t = await sb().from('rooms').select('state').eq('pin', me.pin).maybeSingle();
          if (!t.error) take((t.data?.state as RoomState) ?? null);
        } catch { /* 다음 차례에 다시 */ } finally { busy = false; }
      };
      void refetch();
      const timer = setInterval(() => { void refetch(); }, POLL_MS);
      const onWake = () => { if (document.visibilityState === 'visible') void refetch(); };
      document.addEventListener('visibilitychange', onWake);
      return () => {
        clearInterval(timer);
        document.removeEventListener('visibilitychange', onWake);
      };
    },
    async vote(me, round, option: Pick) {
      const { data, error } = await sb().rpc('cast_vote', { p_player: me.playerId, p_secret: me.secret, p_round: round, p_option: option });
      return !error && data === true;
    },
  };
}
