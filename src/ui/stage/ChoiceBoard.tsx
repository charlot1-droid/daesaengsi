import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { play } from '../../audio/sfx';
import { shares, type Counts, type Pick } from '../../engine/affinity';
import type { VotePhase } from '../../engine/runner';
import { No, Timer } from './bits';

interface Props {
  q: string;
  options: [string, string, string];
  phase: VotePhase;
  counts: Counts;
  voters: number;
  players: number;
  leftMs: number;
  seconds: number;
  paused: boolean;
  win: Pick | null;
  /** 동률이었던 답들 → 결과 화면에서 추첨 연출 후 win에 멈춰요 */
  tie?: Pick[] | null;
  /** 같은 판에서 추첨을 한 번만 하도록 */
  round?: number;
  /** 이미 골라 봤던 답 (다시 고를 때 막힘) */
  off?: Pick[];
  /** 결과 화면에서 타이머 자리에 보여 줄 자동 진행 링 */
  auto?: ReactNode;
  /** 휴대폰 없이 진행 중 (팻말 모드) */
  offline: boolean;
}

/** 동률 추첨 연출 시간 */
export const TIE_SPIN_MS = 3800;

/** 동률이면 동률인 답들 사이를 점점 느리게 오가다 이긴 답에서 멈춰요. 멈추기 전까지 돌고 있는 번호를 돌려줘요. */
function useTieSpin(active: boolean, tie: Pick[] | null | undefined, win: Pick | null, key: string): { lit: Pick | null; landed: boolean } {
  const [lit, setLit] = useState<Pick | null>(null);
  const [landed, setLanded] = useState(false);
  useEffect(() => {
    setLanded(false);
    if (!active || !tie || tie.length < 2 || !win) { setLit(null); return; }
    // 마지막 칸이 win이 되도록 거꾸로 순서를 짜요 (동률인 답들 사이를 왔다 갔다)
    const steps: Pick[] = [];
    let i = tie.indexOf(win);
    for (let k = 0; k < 16; k++) { steps.unshift(tie[i]); i = (i - 1 + tie.length) % tie.length; }
    let k = 0;
    let t: ReturnType<typeof setTimeout>;
    const total = steps.length;
    const next = () => {
      setLit(steps[k]);
      k += 1;
      if (k < total) { play('tick'); t = setTimeout(next, 80 + (k / total) ** 2.2 * 520); }
      else { play('reveal'); setLanded(true); t = setTimeout(() => setLit(null), 900); }
    };
    t = setTimeout(next, 600);
    return () => clearTimeout(t);
  }, [active, key]); // eslint-disable-line react-hooks/exhaustive-deps
  return { lit, landed };
}

/**
 * 질문 판 + 세 줄의 답 카드. 투표 중엔 인원만, 결과에선 이긴 답만 장미색.
 * DS: ds-ask[data-phase=voting|result]
 */
export function ChoiceBoard(p: Props) {
  const result = p.phase === 'result';
  const pct = shares(p.counts);
  const total = p.counts[0] + p.counts[1] + p.counts[2];
  const timerLabel = p.phase === 'closed' ? '마감' : p.paused ? '멈춤' : undefined;
  const tie = result && p.tie && p.tie.length > 1 ? p.tie : null;
  const { lit, landed } = useTieSpin(!!tie, tie, p.win, `${p.round ?? 0}:${p.win}:${tie?.join('')}`);
  const spinning = lit != null && !landed;
  const shownWin = spinning ? lit : p.win;

  return (
    <div className="ds-ask" data-phase={result ? 'result' : 'voting'} data-spin={spinning ? '' : undefined}>
      {tie && (
        <p className="app-tie" data-done={spinning ? undefined : ''}>
          {spinning ? `동률! ${tie.join('번 · ')}번 중에서 추첨할게요` : `동률이라 추첨으로 ${p.win}번!`}
        </p>
      )}
      <div className="ds-panel ds-ask__head">
        <div>
          <h2 className="ds-ask__q">{p.q}</h2>
          {!p.offline && (
            <p className="ds-ask__meta num">
              <b>{result ? total : p.voters}명</b> 투표{p.players > 0 && ` (${p.players}명 중)`}
            </p>
          )}
        </div>
        {!result && <Timer left={p.phase === 'reveal' ? p.seconds * 1000 : p.leftMs} total={p.seconds} label={timerLabel} />}
        {result && p.auto}
      </div>
      {p.options.map((label, i) => {
        const n = (i + 1) as Pick;
        return (
          <div key={n} className="ds-opt" data-n={n} data-off={p.off?.includes(n) ? '' : undefined} data-win={result && shownWin === n ? '' : undefined} data-tied={tie?.includes(n) ? '' : undefined} data-landed={tie && landed && p.win === n ? '' : undefined}>
            <No n={n} />
            <p className="ds-opt__text">{label}</p>
            <span className="ds-opt__count num">
              {p.off?.includes(n) ? <span className="app-off-tag">이미 골랐어요</span> : result && !p.offline && (
                <>
                  {p.counts[i]}명<small>{pct[i]}%</small>
                </>
              )}
            </span>
            {result && !p.offline && <span className="ds-opt__bar" style={{ '--share': `${pct[i]}%` } as CSSProperties} />}
          </div>
        );
      })}
      {result && !p.win && <p className="app-hint">표가 없어요. 1·2·3으로 골라 주세요.</p>}
    </div>
  );
}
