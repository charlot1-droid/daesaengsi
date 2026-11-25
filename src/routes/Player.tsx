/**
 * 관객 휴대폰 (/) — 로그인 없이 입장 번호 + 이름.
 * 흐름: 입장 → 기다리기 → 투표 → 투표 완료(마감 전 변경 가능) → 결과 → 다시 기다리기
 */
import { useEffect, useRef, useState } from 'react';
import { CONFIG } from '../config';
import type { Pick } from '../engine/affinity';
import { createPlayerLink } from '../realtime/index';
import type { JoinMode, Me, PlayerLink, RoomState } from '../realtime/types';
import { Closed, End, JoinForm, SameName, PhoneFrame, ShareWait, VotePad, Verdict, Waiting, WaitScreen, type SendState } from '../ui/player/Screens';
import { t, useLang } from '../i18n/phone';

const ME_KEY = 'daesaengsi.me';
const VOTES_KEY = 'daesaengsi.votes';

// 휴대폰 화면이 꺼졌다 켜지거나 브라우저가 탭을 새로 불러와도 이어서 들어가도록 localStorage에 (12시간 보관)
const KEEP_MS = 12 * 60 * 60 * 1000;
const load = <T,>(k: string): T | null => {
  try {
    const raw = JSON.parse(localStorage.getItem(k) ?? sessionStorage.getItem(k) ?? 'null');
    if (raw && typeof raw === 'object' && 'v' in raw && 'at' in raw) return Date.now() - raw.at < KEEP_MS ? raw.v : null;
    return raw;
  } catch { return null; }
};
const save = (k: string, v: unknown) => {
  try { localStorage.setItem(k, JSON.stringify({ v, at: Date.now() })); } catch { /* 저장 못 해도 진행 */ }
};

/** 게임 중엔 휴대폰 화면이 꺼지지 않게 (지원하는 브라우저에서만 · 화면을 다시 켜면 다시 요청) */
function useWakeLock(on: boolean) {
  useEffect(() => {
    if (!on || !('wakeLock' in navigator)) return;
    let lock: { release: () => Promise<void> } | null = null;
    const ask = () => {
      if (document.visibilityState !== 'visible') return;
      (navigator as Navigator & { wakeLock: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } })
        .wakeLock.request('screen').then((l) => { lock = l; }, () => {});
    };
    ask();
    document.addEventListener('visibilitychange', ask);
    return () => { document.removeEventListener('visibilitychange', ask); void lock?.release().catch(() => {}); };
  }, [on]);
}

export function Player() {
  const { lang } = useLang();
  const [link, setLink] = useState<PlayerLink | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [same, setSame] = useState<{ pin: string; nick: string } | null>(null);
  const [joinError, setJoinError] = useState<{ field: 'pin' | 'nick' | 'all'; text: string }>();
  const [room, setRoom] = useState<{ s: RoomState; at: number } | null>(null);
  const [votes, setVotes] = useState<Record<number, Pick>>(() => load(VOTES_KEY) ?? {});
  const [send, setSend] = useState<SendState>('idle');
  const sending = useRef(0);

  const initialPin = new URLSearchParams(location.search).get('pin') ?? '';

  // 연결 + 새로고침이면 이어서 들어가기
  useEffect(() => {
    void createPlayerLink().then(async (l) => {
      setLink(l);
      const saved = load<Me>(ME_KEY);
      if (saved && (!initialPin || saved.pin === initialPin) && (await l.resume(saved))) setMe(saved);
      setChecking(false);
    });
  }, []);

  useEffect(() => {
    if (!link || !me) return;
    return link.subscribe(me, (s) => setRoom({ s, at: Date.now() }));
  }, [link, me]);
  useWakeLock(!!me);

  // 새 라운드면 전송 표시 초기화
  const round = room && 'round' in room.s ? room.s.round : null;
  useEffect(() => { setSend(votes[round ?? -1] ? 'sent' : 'idle'); }, [round]);

  const join = async (pin: string, nick: string, mode: JoinMode = 'ask') => {
    if (!link) return;
    setBusy(true);
    const r = await link.join(pin, nick, mode);
    setBusy(false);
    if (r.ok) {
      save(ME_KEY, r.me);
      setMe(r.me);
      setSame(null);
      setJoinError(undefined);
    } else if (r.reason === 'name-exists') {
      // 같은 이름이 이미 있어요 → "혹시 본인이에요?" (다시 들어온 거면 그 자리를 이어받아 인원이 늘지 않아요)
      setSame({ pin, nick });
    } else {
      setSame(null);
      setJoinError(
        r.reason === 'pin' ? { field: 'pin', text: t('err_pin', lang) }
          : r.reason === 'name-bad' ? { field: 'nick', text: t('err_name', lang) }
              : { field: 'all', text: t('err_net', lang) },
      );
    }
  };

  const pick = async (n: Pick) => {
    if (!link || !me || !room || room.s.phase !== 'vote') return;
    const r = room.s.round;
    const prev = votes[r];
    const next = { ...votes, [r]: n };
    setVotes(next);
    setSend('sending');
    const id = ++sending.current;
    const ok = await link.vote(me, r, n);
    if (id !== sending.current) return; // 더 최근에 누른 게 있으면 그 결과를 따라요
    if (ok) { setSend('sent'); save(VOTES_KEY, next); }
    else { setSend('failed'); setVotes((v) => ({ ...v, [r]: prev as Pick })); }
  };

  if (checking) return <PhoneFrame><Waiting title={t('connecting', lang)} /></PhoneFrame>;
  if (!me && same) {
    return (
      <PhoneFrame>
        <SameName nick={same.nick} busy={busy} onClaim={() => void join(same.pin, same.nick, 'claim')} onNew={() => void join(same.pin, same.nick, 'new')} onBack={() => setSame(null)} />
      </PhoneFrame>
    );
  }
  if (!me) {
    return (
      <PhoneFrame>
        <JoinForm initialPin={initialPin} onJoin={join} error={joinError} busy={busy} />
      </PhoneFrame>
    );
  }

  const s = room?.s;
  const mine = round != null ? votes[round] ?? null : null;
  let body;
  if (!s || s.phase === 'lobby') body = <Waiting title={t('joined', lang)} body={t('joined_body', lang)} />;
  else if (s.phase === 'wait') body = <WaitScreen s={s} />;
  else if (s.phase === 'vote') body = <VotePad key={s.round} s={s} receivedAt={room!.at} mine={mine} send={send} onPick={pick} />;
  else if (s.phase === 'closed') body = <Closed s={s} mine={mine} />;
  else if (s.phase === 'result') body = <Verdict s={s} mine={mine} />;
  else if (s.phase === 'share') body = <ShareWait q={s.q} label={s.label} items={s.items} />;
  else body = <End link={s.link} label={CONFIG.endLinkLabel} />;

  return <PhoneFrame me={me.nickname} night={s?.night}>{body}</PhoneFrame>;
}
