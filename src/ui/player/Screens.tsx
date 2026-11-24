/** 관객 휴대폰 화면들 — DS PlayerScreens (ds-phone, ds-card, ds-tap …) */
import { useEffect, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import type { Pick } from '../../engine/affinity';
import { cleanNick, isPin, nickProblem, NICK_MAX } from '../../realtime/nickname';
import type { RoomState } from '../../realtime/types';
import { Hearts, No } from '../stage/bits';

export function PhoneFrame({ me, night, children }: { me?: string; night?: boolean; children: ReactNode }) {
  return (
    <div className="app-phone-page" data-theme={night ? 'night' : 'day'}>
      <div className="ds-phone">
        <div className="ds-phone__bar">
          <span className="ds-phone__logo">대생시</span>
          {me && <span className="ds-phone__me">나는 <b>{me}</b></span>}
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------- 입장 ---------- */
export function JoinForm({ initialPin, onJoin, error, busy }: { initialPin: string; onJoin: (pin: string, nick: string) => void; error?: { field: 'pin' | 'nick' | 'all'; text: string }; busy: boolean }) {
  const [pin, setPin] = useState(initialPin);
  const [nick, setNick] = useState('');
  const [local, setLocal] = useState<typeof error>();
  const err = local ?? error;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const p = pin.replace(/\D/g, '');
    const n = cleanNick(nick);
    if (!isPin(p)) return setLocal({ field: 'pin', text: '입장 번호 6자리를 적어 주세요.' });
    const bad = nickProblem(n);
    if (bad) return setLocal({ field: 'nick', text: bad });
    setLocal(undefined);
    onJoin(p, n);
  };

  return (
    <form className="ds-card" onSubmit={submit} noValidate>
      <h1 className="ds-card__title">게임에 들어가기</h1>
      <p className="ds-card__body">무대 화면의 입장 번호를 적어 주세요. 로그인은 필요 없어요.</p>
      <div className="ds-field">
        <label htmlFor="pin">입장 번호</label>
        <input id="pin" className="pin" inputMode="numeric" autoComplete="off" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} aria-invalid={err?.field === 'pin'} />
        {err?.field === 'pin' && <p className="ds-field__error">{err.text}</p>}
      </div>
      <div className="ds-field">
        <label htmlFor="nick">이름 ({NICK_MAX}자까지)</label>
        <input id="nick" maxLength={NICK_MAX} autoComplete="nickname" value={nick} onChange={(e) => setNick(e.target.value)} aria-invalid={err?.field === 'nick'} />
        {err?.field === 'nick' && <p className="ds-field__error">{err.text}</p>}
      </div>
      {err?.field === 'all' && <p className="ds-field__error">{err.text}</p>}
      <button className="ds-btn" disabled={busy}>{busy ? '들어가는 중' : '입장하기'}</button>
    </form>
  );
}

/* ---------- 기다리기 ---------- */
export function Waiting({ title = '무대를 봐 주세요', body }: { title?: string; body?: string }) {
  return (
    <div className="ds-card">
      <h1 className="ds-card__title">{title}</h1>
      {body && <p className="ds-card__body">{body}</p>}
    </div>
  );
}

/* ---------- 투표 ---------- */
export type SendState = 'idle' | 'sending' | 'sent' | 'failed';

export function VotePad({ s, receivedAt, mine, send, onPick }: {
  s: Extract<RoomState, { phase: 'vote' }>; receivedAt: number; mine: Pick | null; send: SendState; onPick: (n: Pick) => void;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);
  const left = s.paused ? s.leftMs : Math.max(0, s.leftMs - (now - receivedAt));
  const sec = Math.ceil(left / 1000);
  const closed = sec <= 0;

  return (
    <>
      {s.retry && <p className="app-phone-banner">다시 투표! 이번엔 잘 골라 봐요.</p>}
      <p className="ds-phone__q">{s.q}</p>
      <div className="ds-phone__time" style={{ '--p': `${Math.min(100, (left / (s.seconds * 1000)) * 100)}%` } as CSSProperties}>
        <span>{s.paused ? '잠깐 멈췄어요' : closed ? '마감' : `${sec}초 남음`}</span>
        <i />
      </div>
      <div className="ds-taps" data-voted={mine ? '' : undefined}>
        {s.options.map((label, i) => {
          const n = (i + 1) as Pick;
          return (
            <button key={n} className="ds-tap" aria-pressed={mine === n} disabled={closed || s.paused} onClick={() => onPick(n)}>
              <No n={n} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
      {send !== 'idle' && (
        <p className="ds-status" data-state={send === 'sent' ? 'sent' : send === 'failed' ? 'failed' : undefined} role="status">
          {send === 'sending' && '전송 중'}
          {send === 'sent' && <>{mine}번 선택 완료 <small>마감 전에는 바꿀 수 있어요</small></>}
          {send === 'failed' && '전송 실패, 다시 눌러 주세요'}
        </p>
      )}
    </>
  );
}

/* ---------- 마감 ---------- */
export function Closed({ s, mine }: { s: Extract<RoomState, { phase: 'closed' }>; mine: Pick | null }) {
  return (
    <div className="ds-card">
      <p className="ds-verdict__kicker">투표 마감</p>
      <h1 className="ds-card__title">결과를 세고 있어요</h1>
      <p className="ds-card__body">{mine ? `나는 ${mine}번 "${s.options[mine - 1]}"을 골랐어요.` : '이번에는 고르지 않았어요.'}</p>
    </div>
  );
}

/* ---------- 결과 ---------- */
export function Verdict({ s, mine }: { s: Extract<RoomState, { phase: 'result' }>; mine: Pick | null }) {
  const same = mine === s.win;
  return (
    <>
      <div className="ds-card">
        <p className="ds-verdict__kicker">이야기가 고른 길 ({s.pct[s.win - 1]}%)</p>
        <div className="ds-verdict__pick">
          <span className="ds-no" aria-hidden="true">{s.win}</span>
          <span>{s.options[s.win - 1]}</span>
        </div>
        <h1 className="ds-card__title">{s.bad ? '배드 엔딩!' : s.verdict ?? '이야기가 이어져요'}</h1>
        <p className="ds-card__body">
          {mine ? (same ? `나도 ${mine}번을 골랐어요.` : `나는 ${mine}번을 골랐어요.`) : '이번에는 고르지 않았어요.'} 무대 화면을 봐 주세요.
        </p>
      </div>
      {!s.bad && (
        <div className="ds-card">
          <div className="ds-meter"><span>남주 호감도</span><Hearts value={s.affinity} total={s.hearts} /></div>
        </div>
      )}
    </>
  );
}

/* ---------- 팀 나눔 · 끝 ---------- */
export function ShareWait({ q, label, items }: { q: string; label?: string; items?: { q: string; hint?: string }[] }) {
  const activity = !!label && !items; // 율동처럼 다 같이 하는 활동
  return (
    <div className="ds-card">
      <p className="ds-verdict__kicker">{label ?? '팀 나눔'}</p>
      <h1 className="ds-card__title">{activity ? '무대를 보고 함께해요' : '팀과 이야기 나눠 주세요'}</h1>
      <p className="ds-card__body">{q}</p>
      {items && (
        <ol className="app-phone-list">
          {items.map((it) => <li key={it.q}>{it.q}{it.hint && <small>{it.hint}</small>}</li>)}
        </ol>
      )}
    </div>
  );
}

export function End({ link, label }: { link?: string; label: string }) {
  return (
    <div className="ds-card">
      <h1 className="ds-card__title">함께해 줘서 고마워요</h1>
      <p className="ds-card__body">오늘 고른 답들이 모여 여주의 대학 생활이 됐어요.</p>
      {link && <a className="ds-btn" style={{ textDecoration: 'none' }} href={link} target="_blank" rel="noreferrer">{label}</a>}
    </div>
  );
}
