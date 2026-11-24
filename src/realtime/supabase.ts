/**
 * 실제 행사용: Supabase.
 *  - 진행 상태: 진행자가 RPC(host_set_state)로 rooms.state를 바꾸고, 휴대폰은 rooms 행 변경을 실시간 구독해요.
 *    (브로드캐스트 채널과 달리 관객이 가짜 상태를 보낼 수 없어요.)
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

  // 휴대폰에 바로 보내는 길: 실시간 방송 채널. DB 변경 알림(postgres_changes)이 막혀 있어도 이걸로 넘어가요.
  const live = sb().channel(`live-${pin}`, { config: { broadcast: { self: false, ack: false } } });
  let liveReady = false;
  let last: RoomState | null = null;
  live.subscribe((status) => {
    liveReady = status === 'SUBSCRIBED';
    if (liveReady && last) void live.send({ type: 'broadcast', event: 'state', payload: last });
  });

  return {
    kind: 'supabase',
    pin,
    async publish(state) {
      last = state;
      if (liveReady) void live.send({ type: 'broadcast', event: 'state', payload: state });
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
      const { data, error } = await sb().rpc('player_check', { p_player: me.playerId, p_secret: me.secret });
      return !error && data === true;
    },
    subscribe(me, cb) {
      // 진행 상태를 받는 길 세 가지 — 하나가 막혀도 나머지로 넘어가요.
      //  1) 방송 채널 (진행자가 바로 보냄, 가장 빠름)
      //  2) rooms 행 변경 알림 (postgres_changes)
      //  3) 2초마다 현재 상태 다시 읽기 (위 둘이 다 끊겨도, 화면이 꺼졌다 켜져도)
      let seq = -1;
      const take = (s: RoomState | null) => {
        if (s && typeof s.seq === 'number' && s.seq >= seq) { seq = s.seq; cb(s); }
      };
      const refetch = async () => {
        const r = await sb().rpc('room_state', { p_pin: me.pin });
        if (!r.error) return take((r.data as RoomState) ?? null);
        const t = await sb().from('rooms').select('state').eq('pin', me.pin).maybeSingle();
        if (!t.error) take((t.data?.state as RoomState) ?? null);
      };
      const live = sb()
        .channel(`live-${me.pin}`)
        .on('broadcast', { event: 'state' }, ({ payload }) => take(payload as RoomState))
        .subscribe((status) => { if (status === 'SUBSCRIBED') void refetch(); });
      const rows = sb()
        .channel(`room-${me.pin}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `pin=eq.${me.pin}` }, (p) => take((p.new as { state: RoomState }).state))
        .subscribe();
      void refetch();
      const timer = setInterval(() => { void refetch(); }, 2000);
      const onWake = () => { if (document.visibilityState === 'visible') void refetch(); };
      document.addEventListener('visibilitychange', onWake);
      return () => {
        clearInterval(timer);
        document.removeEventListener('visibilitychange', onWake);
        void sb().removeChannel(live);
        void sb().removeChannel(rows);
      };
    },
    async vote(me, round, option: Pick) {
      const { data, error } = await sb().rpc('cast_vote', { p_player: me.playerId, p_secret: me.secret, p_round: round, p_option: option });
      return !error && data === true;
    },
  };
}
