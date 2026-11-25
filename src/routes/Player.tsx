/**
 * 관객 휴대폰 (/) — 로그인 없이 입장 번호 + 이름.
 * 흐름: 입장 → 기다리기 → 투표 → 투표 완료(마감 전 변경 가능) → 결과 → 다시 기다리기
 */
import { useEffect, useRef, useState } from 'react';
import { CONFIG } from '../config';
import type { Pick } from '../engine/affinity';
import { createPlayerLink } from '../realtime/index';
import type { Me, PlayerLink, RoomState } from '../realtime/types';
import { Closed, End, JoinForm, PhoneFrame, ShareWait, VotePad, Verdict, Waiting, WaitScreen, type SendState } from '../ui/player/Screens';
import { t, useLang } from '../i18n/phone';

const ME_KEY = 'daesaengsi.me';
const VOTES_KEY = 'daesaengsi.votes';

const load = <T,>(k: string): T | null => {
  try { return JSON.parse(sessionStorage.getItem(k) ?? 'null'); } catch { return null; }
};
const save = (k: string, v: unknown) => {
  try { sessionStorage.setItem(k, JSON.stringify(v)); } catch { /* 저장 못 해도 진행 */ }
};

export function Player() {
  const { lang } = useLang();
  const [link, setLink] = useState<PlayerLink | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
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

  // 새 라운드면 전송 표시 초기화
  const round = room && 'round' in room.s ? room.s.round : null;
  useEffect(() => { setSend(votes[round ?? -1] ? 'sent' : 'idle'); }, [round]);

  const join = async (pin: string, nick: string) => {
    if (!link) return;
    setBusy(true);
    const r = await link.join(pin, nick);
    setBusy(false);
    if (r.ok) {
      save(ME_KEY, r.me);
      setMe(r.me);
      setJoinError(undefined);
    } else {
      setJoinError(
        r.reason === 'pin' ? { field: 'pin', text: t('err_pin', lang) }
          : r.reason === 'name-taken' ? { field: 'nick', text: t('err_taken', lang) }
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
