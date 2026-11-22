/** 호감도 · 투표 결과 규칙 */

export type Pick = 1 | 2 | 3;
export type Counts = [number, number, number];

export const clampAffinity = (v: number, hearts: number) => Math.max(0, Math.min(hearts, v));

/**
 * 이긴 답. 표가 하나도 없으면 null → 진행자가 1·2·3으로 골라요.
 * 동점이면 번호가 빠른 답이 이기고, 진행자가 결과 화면에서 1·2·3으로 바꿀 수 있어요.
 */
export function winner(counts: Counts): Pick | null {
  const max = Math.max(...counts);
  if (max <= 0) return null;
  return (counts.indexOf(max) + 1) as Pick;
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
