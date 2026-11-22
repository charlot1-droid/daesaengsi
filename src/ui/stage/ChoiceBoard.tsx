import type { CSSProperties } from 'react';
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
  /** 휴대폰 없이 진행 중 (팻말 모드) */
  offline: boolean;
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

  return (
    <div className="ds-ask" data-phase={result ? 'result' : 'voting'}>
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
      </div>
      {p.options.map((label, i) => {
        const n = (i + 1) as Pick;
        return (
          <div key={n} className="ds-opt" data-n={n} data-win={result && p.win === n ? '' : undefined}>
            <No n={n} />
            <p className="ds-opt__text">{label}</p>
            <span className="ds-opt__count num">
              {result && !p.offline && (
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
