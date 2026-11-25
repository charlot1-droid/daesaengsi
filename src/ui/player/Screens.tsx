/** 관객 휴대폰 화면들 — DS PlayerScreens (ds-phone, ds-card, ds-tap …) */
import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import type { Pick } from '../../engine/affinity';
import { cleanNick, isPin, nickProblem, NICK_MAX } from '../../realtime/nickname';
import type { PhoneLine, RoomState } from '../../realtime/types';
import { NOTE_KEYS, t, tr, useLang, type Lang } from '../../i18n/phone';
import { story } from '../../engine/runner';
import { Hearts, No } from '../stage/bits';

/** 한 / EN 바꾸기 */
function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="app-lang" role="group" aria-label={t('lang', lang)}>
      {(['ko', 'en'] as Lang[]).map((l) => (
        <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)}>{l === 'ko' ? '한' : 'EN'}</button>
      ))}
    </div>
  );
}

export function PhoneFrame({ me, night, children }: { me?: string; night?: boolean; children: ReactNode }) {
  const { lang } = useLang();
  return (
    <div className="app-phone-page" data-theme={night ? 'night' : 'day'}>
      <div className="ds-phone">
        <div className="ds-phone__bar">
          <span className="ds-phone__logo">대생시</span>
          <span className="app-phone-bar-end">
            {me && <span className="ds-phone__me">{t('me', lang)} <b>{me}</b></span>}
            <LangToggle />
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

/** 이야기 속 채팅방 (DM · 단톡방) — 무대와 같은 대화가 한 줄씩 올라와요 */
function ChatCard({ chat }: { chat: NonNullable<PhoneLine['chat']> }) {
  const { lang } = useLang();
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end', behavior: 'smooth' }); }, [chat.msgs.length]);
  return (
    <div className="app-chat" aria-live="polite">
      <p className="app-chat__head"><b>{tr(chat.title, lang)}</b>{chat.time && <small>{tr(chat.time, lang)}</small>}</p>
      <div className="app-chat__body">
        {chat.msgs.map((m, i) => (
          m.from === 'note'
            ? <p key={i} className="app-chat__note">{tr(m.text, lang)}</p>
            : (
              <div key={i} className="app-chat__msg" data-from={m.from}>
                {m.name && <small>{tr(m.name, lang)}</small>}
                <p>{tr(m.text, lang)}</p>
              </div>
            )
        ))}
        <div ref={end} />
      </div>
    </div>
  );
}

/** 무대에 떠 있는 대사 한 줄 (나레이션은 색을 뒤집어 구분) */
export function LineCard({ line }: { line: PhoneLine }) {
  const { lang } = useLang();
  if (line.chat) return <ChatCard chat={line.chat} />;
  const cast = (story.scenario.cast as Record<string, { name: string; sub?: string }>)[line.who];
  const label = line.who === 'narrator' ? t('narration', lang)
    : line.who === 'notice' ? t('notice', lang)
      : line.who === 'notify' ? t('alert', lang)
        : cast ? tr(cast.name, lang) : line.who;
  const kind = line.who === 'narrator' ? 'narrator' : line.who === 'notice' || line.who === 'notify' ? 'notice' : 'char';
  return (
    // 카드는 그대로 두고 글자만 살짝 바뀌어요 (카드 전체를 다시 그리면 번쩍거려 보여서)
    <div className="app-line" data-kind={kind} aria-live="polite">
      <p className="app-line__who">{label}</p>
      <p className="app-line__text" key={line.key}>{tr(line.text, lang)}</p>
    </div>
  );
}

/* ---------- 입장 ---------- */
export function JoinForm({ initialPin, onJoin, error, busy }: { initialPin: string; onJoin: (pin: string, nick: string) => void; error?: { field: 'pin' | 'nick' | 'all'; text: string }; busy: boolean }) {
  const { lang } = useLang();
  const [pin, setPin] = useState(initialPin);
  const [nick, setNick] = useState('');
  const [local, setLocal] = useState<typeof error>();
  const err = local ?? error;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const p = pin.replace(/\D/g, '');
    const n = cleanNick(nick);
    if (!isPin(p)) return setLocal({ field: 'pin', text: t('err_pin6', lang) });
    const bad = nickProblem(n);
    if (bad) return setLocal({ field: 'nick', text: lang === 'en' ? t('err_name', lang) : bad });
    setLocal(undefined);
    onJoin(p, n);
  };

  return (
    <form className="ds-card" onSubmit={submit} noValidate>
      <h1 className="ds-card__title">{t('join_title', lang)}</h1>
      <p className="ds-card__body">{t('join_body', lang)}</p>
      <div className="ds-field">
        <label htmlFor="pin">{t('pin', lang)}</label>
        <input id="pin" className="pin" inputMode="numeric" autoComplete="off" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} aria-invalid={err?.field === 'pin'} />
        {err?.field === 'pin' && <p className="ds-field__error">{err.text}</p>}
      </div>
      <div className="ds-field">
        <label htmlFor="nick">{t('name', lang, { n: NICK_MAX })}</label>
        <input id="nick" maxLength={NICK_MAX} autoComplete="nickname" value={nick} onChange={(e) => setNick(e.target.value)} aria-invalid={err?.field === 'nick'} />
        {err?.field === 'nick' && <p className="ds-field__error">{err.text}</p>}
      </div>
      {err?.field === 'all' && <p className="ds-field__error">{err.text}</p>}
      <button className="ds-btn" disabled={busy}>{busy ? t('joining', lang) : t('join', lang)}</button>
    </form>
  );
}

/** 같은 이름이 이미 있을 때: 다시 들어온 본인이면 그 자리를 이어받고, 동명이인이면 새로 들어가요 */
export function SameName({ nick, busy, onClaim, onNew, onBack }: { nick: string; busy: boolean; onClaim: () => void; onNew: () => void; onBack: () => void }) {
  const { lang } = useLang();
  return (
    <div className="ds-card">
      <h1 className="ds-card__title">{t('same_title', lang, { n: nick })}</h1>
      <p className="ds-card__body">{t('same_body', lang)}</p>
      <button type="button" className="ds-btn" disabled={busy} onClick={onClaim}>{t('same_me', lang)}</button>
      <button type="button" className="ds-btn app-btn-quiet" disabled={busy} onClick={onNew}>{t('same_new', lang)}</button>
      <button type="button" className="app-link-btn" disabled={busy} onClick={onBack}>{t('same_back', lang)}</button>
    </div>
  );
}

/* ---------- 기다리기 ---------- */
export function Waiting({ title, body, line }: { title?: string; body?: string; line?: PhoneLine }) {
  const { lang } = useLang();
  return (
    <>
      {line ? (
        <>
          <p className="app-phone-stage">{body ?? ''}</p>
          <LineCard line={line} />
          <p className="app-phone-hint">{title ?? t('watch', lang)}</p>
        </>
      ) : (
        <div className="ds-card">
          <h1 className="ds-card__title">{title ?? t('watch', lang)}</h1>
          {body && <p className="ds-card__body">{body}</p>}
        </div>
      )}
    </>
  );
}

/** 진행자의 기다리기 상태 → 화면 (스테이지 이름·안내 번역) */
export function WaitScreen({ s }: { s: Extract<RoomState, { phase: 'wait' }> }) {
  const { lang } = useLang();
  const note = s.note ? (NOTE_KEYS[s.note] ? t(NOTE_KEYS[s.note], lang) : tr(s.note, lang)) : undefined;
  const stage = s.stageName ? `${s.stageN ?? ''} · ${tr(s.stageName, lang)}` : s.stage;
  return <Waiting body={note ?? stage} line={s.line} />;
}

/* ---------- 투표 ---------- */
export type SendState = 'idle' | 'sending' | 'sent' | 'failed';

export function VotePad({ s, receivedAt, mine, send, onPick }: {
  s: Extract<RoomState, { phase: 'vote' }>; receivedAt: number; mine: Pick | null; send: SendState; onPick: (n: Pick) => void;
}) {
  const { lang } = useLang();
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
      {s.retry && <p className="app-phone-banner">{t('retry', lang)}</p>}
      <p className="ds-phone__q">{tr(s.q, lang)}</p>
      <div className="ds-phone__time" style={{ '--p': `${Math.min(100, (left / (s.seconds * 1000)) * 100)}%` } as CSSProperties}>
        <span>{s.paused ? t('paused', lang) : closed ? t('closed', lang) : t('sec_left', lang, { n: sec })}</span>
        <i />
      </div>
      <div className="ds-taps" data-voted={mine ? '' : undefined}>
        {s.options.map((label, i) => {
          const n = (i + 1) as Pick;
          return (
            <button key={n} className="ds-tap" aria-pressed={mine === n} data-off={s.off?.includes(n) ? '' : undefined} disabled={closed || s.paused || !!s.off?.includes(n)} onClick={() => onPick(n)}>
              <No n={n} />
              <span>{tr(label, lang)}</span>
              {s.off?.includes(n) && <small className="app-off-tag">{t('tried', lang)}</small>}
            </button>
          );
        })}
      </div>
      {send !== 'idle' && (
        <p className="ds-status" data-state={send === 'sent' ? 'sent' : send === 'failed' ? 'failed' : undefined} role="status">
          {send === 'sending' && t('sending', lang)}
          {send === 'sent' && <>{t('sent', lang, { n: mine ?? '' })} <small>{t('sent_sub', lang)}</small></>}
          {send === 'failed' && t('failed', lang)}
        </p>
      )}
    </>
  );
}

/* ---------- 마감 ---------- */
export function Closed({ s, mine }: { s: Extract<RoomState, { phase: 'closed' }>; mine: Pick | null }) {
  const { lang } = useLang();
  return (
    <div className="ds-card">
      <p className="ds-verdict__kicker">{t('vote_closed', lang)}</p>
      <h1 className="ds-card__title">{t('counting', lang)}</h1>
      <p className="ds-card__body">{mine ? t('i_picked', lang, { n: mine, label: tr(s.options[mine - 1], lang) }) : t('no_pick', lang)}</p>
    </div>
  );
}

/* ---------- 결과 ---------- */
export function Verdict({ s, mine }: { s: Extract<RoomState, { phase: 'result' }>; mine: Pick | null }) {
  const { lang } = useLang();
  const same = mine === s.win;
  return (
    <>
      <div className="ds-card">
        {s.tie && s.tie.length > 1 && <p className="app-phone-tie">{t('tie', lang)} ({s.tie.join(' · ')})</p>}
        <p className="ds-verdict__kicker">{t('path', lang, { p: s.pct[s.win - 1] })}</p>
        <div className="ds-verdict__pick">
          <span className="ds-no" aria-hidden="true">{s.win}</span>
          <span>{tr(s.options[s.win - 1], lang)}</span>
        </div>
        <h1 className="ds-card__title">{s.bad ? t('bad_end', lang) : s.verdict ? tr(s.verdict, lang) : t('goes_on', lang)}</h1>
        <p className="ds-card__body">
          {mine ? (same ? t('me_too', lang, { n: mine }) : t('me_other', lang, { n: mine })) : t('no_pick', lang)} {t('look_stage', lang)}
        </p>
      </div>
      {!s.bad && (
        <div className="ds-card">
          <div className="ds-meter"><span>{t('affinity', lang)}</span><Hearts value={s.affinity} total={s.hearts} /></div>
        </div>
      )}
    </>
  );
}

/* ---------- 팀 나눔 · 끝 ---------- */
export function ShareWait({ q, label, items }: { q: string; label?: string; items?: { q: string; hint?: string }[] }) {
  const { lang } = useLang();
  const activity = !!label && !items; // 율동처럼 다 같이 하는 활동
  return (
    <div className="ds-card">
      <p className="ds-verdict__kicker">{label ? tr(label, lang) : t('share', lang)}</p>
      <h1 className="ds-card__title">{activity ? t('share_do', lang) : t('share_talk', lang)}</h1>
      <p className="ds-card__body">{tr(q, lang)}</p>
      {items && (
        <ol className="app-phone-list">
          {items.map((it) => <li key={it.q}>{tr(it.q, lang)}{it.hint && <small>{tr(it.hint, lang)}</small>}</li>)}
        </ol>
      )}
    </div>
  );
}

export function End({ link, label }: { link?: string; label: string }) {
  const { lang } = useLang();
  return (
    <div className="ds-card">
      <h1 className="ds-card__title">{t('thanks', lang)}</h1>
      <p className="ds-card__body">{t('thanks_body', lang)}</p>
      {link && <a className="ds-btn" style={{ textDecoration: 'none' }} href={link} target="_blank" rel="noreferrer">{label}</a>}
    </div>
  );
}
