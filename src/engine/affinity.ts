/** 호감도 · 투표 결과 규칙 */

export type Pick = 1 | 2 | 3;
export type Counts = [number, number, number];

export const clampAffinity = (v: number, hearts: number) => Math.max(0, Math.min(hearts, v));

/** 가장 많이 받은 답들 (동률이면 여러 개). 표가 하나도 없으면 빈 배열 */
export function leaders(counts: Counts): Pick[] {
  const max = Math.max(...counts);
  if (max <= 0) return [];
  return ([1, 2, 3] as Pick[]).filter((n) => counts[n - 1] === max);
}

/**
 * 이긴 답. 표가 하나도 없으면 null → 진행자가 1·2·3으로 골라요.
 * 동률이면 동률인 답 중에서 무작위로 하나 (rnd: 0 이상 1 미만, 진행자 화면이 정해서 넘겨요).
 * 진행자는 결과 화면에서 1·2·3으로 바꿀 수 있어요.
 */
export function winner(counts: Counts, rnd = 0): { win: Pick | null; tie: Pick[] | null } {
  const top = leaders(counts);
  if (top.length === 0) return { win: null, tie: null };
  if (top.length === 1) return { win: top[0], tie: null };
  return { win: top[Math.min(top.length - 1, Math.floor(rnd * top.length))], tie: top };
}

/** 각 답의 비율 (반올림 합이 100이 되게) */
export function shares(counts: Counts): Counts {
  const total = counts[0] + counts[1] + counts[2];
  if (!total) return [0, 0, 0];
  const raw = counts.map((c) => (c / total) * 100);
  const floor = raw.map(Math.floor) as Counts;
  let rest = 100 - (floor[0] + floor[1] + floor[2]);
  raw
    .map((r, i) => [r - Math.floor(r), i] as const)
    .sort((a, b) => b[0] - a[0])
    .forEach(([, i]) => {
      if (rest > 0) { floor[i]++; rest--; }
    });
  return floor;
}
