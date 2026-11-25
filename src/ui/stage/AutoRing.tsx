/** 자동 진행 카운트다운 — 오른쪽 아래에 작게. 링이 보이면 기다리면 되고, 없으면 클릭해서 넘겨요. */
import { useEffect, useState, type CSSProperties } from 'react';

export function AutoRing({ ms, startedAt, held, u }: { ms: number; startedAt: number; held: boolean; u: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (held) return;
    const t = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, [held]);
  const left = Math.max(0, ms - (now - startedAt));
  const p = held ? 1 : left / ms;
  return (
    <div className="app-auto" data-held={held ? '' : undefined} style={{ '--u': `${u}px`, '--p': p } as CSSProperties} title={held ? '자동 진행 멈춤 (P로 계속)' : '곧 자동으로 넘어가요 (P로 멈춤)'}>
      <svg viewBox="0 0 40 40" aria-hidden="true"><circle className="track" cx="20" cy="20" r="17" /><circle className="arc" cx="20" cy="20" r="17" /></svg>
      <span>{held ? '❚❚' : Math.ceil(left / 1000)}</span>
    </div>
  );
}
