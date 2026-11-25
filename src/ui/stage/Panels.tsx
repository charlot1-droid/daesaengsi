/** 무대 화면의 판들 — 각 컴포넌트는 디자인 시스템 클래스(ds-*)를 그대로 써요. */
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { play } from '../../audio/sfx';
import { faceId, type ArtId } from '../../art/manifest';
import type { NoticeBeat, NotifyBeat, PropBeat, ScreenBeat, ShareBeat, SplashBeat } from '../../scenario/schema';
import type { Frame } from '../../engine/frames';
import { Art, ArtBox, Hearts, No, Timer, txt } from './bits';

/* ---------- 공지: 위쪽 가운데 한 문장 ---------- */
/** '① …\n② …' 처럼 줄마다 번호가 붙은 공지는 정돈된 목록 카드로 (예: 게임 규칙) */
const CIRCLED = '①②③④⑤⑥⑦⑧⑨';
function asList(text: string): string[] | null {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2 || !lines.every((l) => CIRCLED.includes(l[0]))) return null;
  return lines.map((l) => l.slice(1).trim().replace(/①②③/g, '1 · 2 · 3'));
}

export function Notice({ b }: { b: NoticeBeat }) {
  const items = asList(txt(b.text));
  if (items) {
    return (
      <div className="ds-panel ds-notice app-rules">
        {b.sub && <p className="app-rules__title">{txt(b.sub)}</p>}
        <ol className="app-rules__list">
          {items.map((it, i) => {
            const goal = /^목표\s*[:：]/.test(it);
            return (
              <li key={i} data-goal={goal ? '' : undefined}>
                <No n={i + 1} />
                <span>{goal ? <><small>목표</small>{it.replace(/^목표\s*[:：]\s*/, '')}</> : it}</span>
              </li>
            );
          })}
        </ol>
      </div>
    );
  }
  return (
    <div className="ds-panel ds-notice" data-tone={b.tone}>
      <p className="ds-notice__text">{txt(b.text)}</p>
      {b.sub && <p className="ds-notice__sub">{txt(b.sub)}</p>}
    </div>
  );
}

/* ---------- 알림: 관계가 바뀌는 순간 ---------- */
export function Notify({ b, affinity, hearts }: { b: NotifyBeat; affinity: number; hearts: number }) {
  return (
    <div className="ds-panel ds-notify" data-tone="heart">
      <ArtBox id={faceId(b.face ?? 'smile')} className="ds-notify__face" label="김남주" />
      <div>
        <p className="ds-notify__text">{txt(b.text)}</p>
        <p className="ds-notify__sub">
          호감도 <Hearts value={affinity} total={hearts} pulse={!!b.affinity} />
        </p>
      </div>
    </div>
  );
}

/* ---------- 이야기 속 휴대폰 (항상 흰 화면) ---------- */
export function PhoneDM({ phone }: { phone: NonNullable<Frame['phone']> }) {
  return (
    <div className="ds-dm">
      <div className="ds-dm__screen">
        <div className="ds-dm__bar">
          {phone.face && <ArtBox id={faceId(phone.face)} className="ds-notify__face" label={phone.title} />}
          <div>
            <p className="ds-dm__name">{txt(phone.title)}</p>
            {phone.handle && <p className="ds-dm__id">{phone.handle}</p>}
          </div>
        </div>
        <div className="ds-dm__msgs">
          {phone.time && <span className="ds-dm__note">{phone.time}</span>}
          {phone.msgs.map((m, i) => m.from === 'note' ? (
            <span key={i} className="ds-dm__note">{txt(m.text)}</span>
          ) : (
            <p key={i} className="ds-msg" data-from={m.from}>
              {m.name && m.from === 'them' && <small>{txt(m.name)}</small>}
              {txt(m.text)}
            </p>
          ))}
          {phone.read && phone.latest && <span className="ds-dm__note" data-at="end">읽음</span>}
        </div>
      </div>
    </div>
  );
}

/* ---------- 소품: 빈 물건 그림 위에 글자 ---------- */
export function Prop({ b }: { b: PropBeat }) {
  const p = b.place ?? {};
  const style = { '--x': p.x, '--y': p.y, '--w': p.w, '--rot': p.rot, '--fs': p.fs } as CSSProperties;
  return (
    <figure className="ds-prop" data-frame={b.frame ? '' : undefined} style={{ '--prop-w': b.size ?? 720 } as CSSProperties}>
      <Art id={b.art} className="ds-prop__img" alt="" />
      <p className="ds-prop__text" data-hand={b.hand} style={style}>{txt(b.text)}</p>
    </figure>
  );
}

/* ---------- 스테이지 표지 ---------- */
export function StageSplash({ b, n }: { b: SplashBeat; n?: string }) {
  return (
    <div className="ds-cover">
      {n && <p className="ds-cover__n">{n}</p>}
      <h1 className="ds-cover__title" style={{ whiteSpace: 'pre-line' }}>{txt(b.title)}</h1>
      {b.sub && txt(b.sub) && <p className="ds-cover__sub">{txt(b.sub)}</p>}
    </div>
  );
}

/* ---------- 배드 엔딩 체크포인트 ---------- */
export function Checkpoint({ title, back, react, onRetry }: { title: string; back: string; react: ArtId; onRetry?: () => void }) {
  return (
    <div className="ds-panel ds-bad">
      <ArtBox id={react} className="ds-bad__face" label="김남주 리액션" />
      <div>
        <p className="ds-bad__kicker">배드 엔딩</p>
        <h2 className="ds-bad__title" style={{ whiteSpace: 'pre-line' }}>{txt(title)}</h2>
        <p className="ds-bad__back">{txt(back)}</p>
        <button className="ds-btn" onClick={(e) => { e.stopPropagation(); onRetry?.(); }}>다시 고르기</button>
      </div>
    </div>
  );
}

/* ---------- 팀 나눔 질문 · 다 같이 하는 활동 (타이머) ---------- */
export function QuestionCard({ b, index, of, startedAt }: { b: ShareBeat; index: number; of: number; startedAt: number }) {
  const total = b.seconds ?? 40;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(t);
  }, []);
  // 시작 직후 한 박자 동안 total보다 크게 나오지 않게 (3:21처럼 1초 더 보이는 것 방지)
  const left = Math.min(total * 1000, Math.max(0, total * 1000 - (now - startedAt)));
  // 시간이 다 되면 알림만 (자동으로 넘기지 않아요 — 사회자가 마무리하고 넘겨요)
  const rang = useRef(false);
  useEffect(() => {
    if (left <= 0 && !rang.current) { rang.current = true; play('chime'); }
  }, [left]);
  return (
    <div className="ds-panel ds-share">
      <div>
        <p className="ds-share__n">{b.label ? txt(b.label) : b.items ? '팀 나눔' : `팀 나눔 질문 ${index} / ${of}`}</p>
        <h2 className="ds-share__q" data-list={b.items ? '' : undefined}>{txt(b.q)}</h2>
        {b.hint && <p className="ds-share__hint">{txt(b.hint)}</p>}
        {b.items && (
          <ol className="app-share-list">
            {b.items.map((it, i) => (
              <li key={i}>
                <No n={i + 1} />
                <span>{txt(it.q)}{it.hint && <small>{txt(it.hint)}</small>}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
      <Timer left={left} total={total} label={left <= 0 ? '종료' : undefined} />
    </div>
  );
}

/* ---------- 화면 속 화면 (HTML로 그리는 것) ---------- */
export function ScreenView({ b }: { b: ScreenBeat }) {
  if (b.view === 'sugang') {
    // TODO(대본): 수강신청 화면 문구·과목 확정
    return (
      <div className="app-monitor">
        <div className="app-monitor__screen">
          <div className="app-monitor__bar"><span>수강신청 시스템</span><span className="app-monitor__clock">09:59:58</span></div>
          <div className="app-monitor__body">
            <p className="app-monitor__big">{txt(b.text)}</p>
            {b.sub && <p className="app-monitor__sub">{txt(b.sub)}</p>}
            <div className="app-monitor__row"><span>과목 A</span><span>0 / 40</span></div>
            <div className="app-monitor__row"><span>과목 B</span><span>0 / 40</span></div>
          </div>
        </div>
      </div>
    );
  }
  // 'reveal'(CCC 공개) · 'title' — 표지와 같은 처리
  return <StageSplash b={{ t: 'splash', title: b.text ?? '', sub: b.sub }} />;
}
