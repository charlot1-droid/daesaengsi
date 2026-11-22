/**
 * 연결 방식 고르기
 *   supabase : VITE_SUPABASE_URL이 있으면 (실제 행사)
 *   local    : 없으면, 또는 ?link=local (같은 브라우저 탭끼리 리허설)
 *   offline  : /host?link=offline — 팻말 모드. 휴대폰 없이 진행자가 1·2·3으로 골라요.
 */
import type { HostLink, LinkKind, PlayerLink } from './types';
import { localHost, localPlayer } from './local';

const hasSupabase = () => !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

export function linkKind(): LinkKind {
  const q = new URLSearchParams(location.search).get('link');
  if (q === 'offline' || q === 'local') return q;
  return hasSupabase() ? 'supabase' : 'local';
}

const randomPin = () => String(Math.floor(100000 + Math.random() * 900000));

export async function createHostLink(opts: { fresh?: boolean } = {}): Promise<HostLink> {
  const kind = linkKind();
  if (kind === 'supabase') {
    const { supabaseHost } = await import('./supabase');
    return supabaseHost(opts.fresh);
  }
  if (kind === 'local') return localHost(randomPin());
  return offlineHost();
}

export async function createPlayerLink(): Promise<PlayerLink> {
  if (linkKind() === 'supabase') {
    const { supabasePlayer } = await import('./supabase');
    return supabasePlayer();
  }
  return localPlayer();
}

function offlineHost(): HostLink {
  return {
    kind: 'offline',
    pin: '------',
    async publish() {},
    async poll() { return { players: 0, names: [], counts: [0, 0, 0], voters: 0 }; },
    close() {},
  };
}

/** 로비에 보여 줄 주소 */
export function joinUrl(pin: string): { display: string; href: string } {
  const base = (import.meta.env.VITE_PUBLIC_URL as string | undefined) || location.origin;
  const href = `${base.replace(/\/$/, '')}/?pin=${pin}`;
  return { display: base.replace(/^https?:\/\//, '').replace(/\/$/, ''), href };
}
