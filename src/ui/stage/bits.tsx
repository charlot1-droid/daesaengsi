/** 작은 공용 조각: 하트, 번호 배지, 타이머, 이미지(+필요 표시), 지문 처리 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ART, artSrc, isReady, type ArtId } from '../../art/manifest';

const HEART = 'M12 21s-7.5-4.6-10-9.3C.4 8.4 2.3 4 6.4 4c2.4 0 3.9 1.4 5.6 3.4C13.7 5.4 15.2 4 17.6 4c4.1 0 6 4.4 4.4 7.7C19.5 16.4 12 21 12 21z';

/** 호감도 하트. 값이 오르면 새로 켜진 하트가 한 번 커졌다 돌아와요. */
export function Hearts({ value, total, pulse }: { value: number; total: number; pulse?: boolean }) {
  const prev = useRef(value);
  const [rose, setRose] = useState(pulse ? value : -1);
  useEffect(() => {
    if (value > prev.current) setRose(value);
    prev.current = value;
  }, [value]);
  useEffect(() => {
    if (rose < 0) return;
    const t = setTimeout(() => setRose(-1), 700);
    return () => clearTimeout(t);
  }, [rose]);
  return (
    <span className="ds-hearts" role="img" aria-label={`호감도 ${total}칸 중 ${value}칸`}>
      {Array.from({ length: total }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" className={[i < value ? 'on' : '', i + 1 === rose ? 'up' : ''].join(' ').trim()}>
          <path d={HEART} />
        </svg>
      ))}
    </span>
  );
}

export const No = ({ n }: { n: number }) => <span className="ds-no" aria-hidden="true">{n}</span>;

export type TimerState = 'run' | 'warn' | 'low' | 'done';
export const timerState = (leftS: number): TimerState => (leftS <= 0 ? 'done' : leftS <= 5 ? 'low' : leftS <= 10 ? 'warn' : 'run');

export function Timer({ left, total, label }: { left: number; total: number; label?: string }) {
  const s = Math.ceil(left / 1000);
  return (
    <div className="ds-timer" data-state={label ? 'done' : timerState(s)} style={{ '--p': total ? Math.max(0, left / (total * 1000)) : 0 } as CSSProperties}>
      <svg viewBox="0 0 100 100" aria-hidden="true"><circle className="track" cx="50" cy="50" r="46" /><circle className="arc" cx="50" cy="50" r="46" /></svg>
      <span className="ds-timer__n" style={!label && s > 99 ? { fontSize: `calc(${s > 599 ? 36 : 44} * var(--u))` } : undefined}>
        {label ?? (s <= 0 ? '마감' : s > 99 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : s)}
      </span>
    </div>
  );
}

/** 이미지 필요 표시 */
export function Missing({ id, variant }: { id: ArtId; variant: 'bg' | 'box' }) {
  return (
    <div className={`app-missing app-missing--${variant}`}>
      <span className="app-missing__tag">이미지 필요</span>
      <b>{id}</b>
      {variant === 'bg' && <span>{ART[id].note}</span>}
    </div>
  );
}

/** 이미지가 있으면 <img>, 없으면 필요 표시 */
export function Art({ id, alt, className }: { id: ArtId; alt: string; className?: string }) {
  const src = artSrc(id);
  return src ? <img className={className} src={src} alt={alt} draggable={false} /> : <Missing id={id} variant="box" />;
}

/** 배경 그림처럼 쓰는 칸(얼굴 컷, 리액션) — DS가 background-image로 그려요 */
export function ArtBox({ id, className, label }: { id: ArtId; className: string; label: string }) {
  const src = artSrc(id);
  const stand = src && !isReady(id); // 준비 안 된 그림 대신 다른 그림(fallback)을 쓰는 중
  return (
    <div className={className} role="img" aria-label={label} style={src ? { backgroundImage: `url(${src})`, position: 'relative' } : { position: 'relative' }}>
      {!src && <Missing id={id} variant="box" />}
      {stand && <span className="app-missing--fallback">이미지 필요 · {id}</span>}
    </div>
  );
}

/** '(당황하며) 네, 네?' → 괄호 부분은 지문 글꼴 */
export function withDirections(text: string): ReactNode[] {
  return text.split(/(\([^)]*\))/g).filter(Boolean).map((part, i) =>
    part.startsWith('(') && part.endsWith(')') ? <span key={i} className="dir">{part}</span> : part,
  );
}


export { txt } from '../../scenario/text';
