/**
 * 자동 진행 카운트다운 — 투표 타이머와 같은 모양·크기로, 결과 판에선 타이머 자리에, 체크포인트에선 '다시 고르기' 옆에.
 * 링이 보이면 기다리면 되고, 없으면 클릭해서 넘겨요. P로 멈춤·계속.
 */
import { useEffect, useState, type CSSProperties } from 'react';

export function AutoRing({ ms, startedAt, held }: { ms: number; startedAt: number; held: boolean }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (held) return;
    const t = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, [held]);
  const left = held ? ms : Math.max(0, ms - (now - startedAt));
  return (
    <div className="ds-timer app-auto" data-held={held ? '' : undefined} style={{ '--p': left / ms } as CSSProperties}
      title={held ? '자동 진행 멈춤 (P로 계속)' : '곧 자동으로 넘어가요 (P로 멈춤)'}>
      <svg viewBox="0 0 100 100" aria-hidden="true"><circle className="track" cx="50" cy="50" r="46" /><circle className="arc" cx="50" cy="50" r="46" /></svg>
      <span className="ds-timer__n">{held ? '❚❚' : Math.ceil(left / 1000)}</span>
      <small className="app-auto__cap">{held ? '멈춤' : '다음으로'}</small>
    </div>
  );
}
