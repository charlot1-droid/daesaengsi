/**
 * 진행자 ↔ 관객 휴대폰 사이에 오가는 것.
 * 진행자만 RoomState를 쓰고, 휴대폰은 받아서 보여 주고 투표만 보내요.
 */
import type { Counts, Pick } from '../engine/affinity';

interface Base {
  /** 진행자가 보낸 순서 번호 (늦게 온 옛 상태 무시용) */
  seq: number;
  night?: boolean;
}

export type RoomState = Base &
  (
    | { phase: 'lobby' }
    | { phase: 'wait'; stage?: string; note?: string }
    | {
        phase: 'vote';
        round: number;
        q: string;
        options: [string, string, string];
        seconds: number;
        /** 보낸 순간 남은 시간 (받은 시각 기준으로 계산해서 시계 차이를 피해요) */
        leftMs: number;
        paused: boolean;
        retry: boolean;
      }
    | { phase: 'closed'; round: number; q: string; options: [string, string, string] }
    | {
        phase: 'result';
        round: number;
        q: string;
        options: [string, string, string];
        win: Pick;
        pct: Counts;
        verdict?: string;
        bad: boolean;
        affinity: number;
        hearts: number;
      }
    | { phase: 'share'; q: string }
    | { phase: 'end'; link?: string }
  );

export interface Poll {
  players: number;
  /** 최근 입장한 이름 (로비 표시용) */
  names: string[];
  /** 현재 라운드 답별 표 수 */
  counts: Counts;
  voters: number;
}

export type LinkKind = 'supabase' | 'local' | 'offline';

export interface HostLink {
  kind: LinkKind;
  pin: string;
  publish(state: RoomState): Promise<void>;
  poll(round: number | null): Promise<Poll>;
  close(): void;
}

export interface Me {
  pin: string;
  playerId: string;
  secret: string;
  nickname: string;
}

export type JoinResult = { ok: true; me: Me } | { ok: false; reason: 'pin' | 'name-taken' | 'name-bad' | 'network' };

export interface PlayerLink {
  kind: LinkKind;
  join(pin: string, nickname: string): Promise<JoinResult>;
  /** 이미 입장한 사람이 새로고침했을 때 */
  resume(me: Me): Promise<boolean>;
  subscribe(me: Me, cb: (s: RoomState) => void): () => void;
  vote(me: Me, round: number, option: Pick): Promise<boolean>;
}
