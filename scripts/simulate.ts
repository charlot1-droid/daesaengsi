/** 대본을 처음부터 끝까지 자동으로 돌려 보는 점검 (배드 엔딩 → 재투표 포함). npm run simulate */
import { initial, reduce, currentFrame, isCheckpoint, story, type RunState, type Action } from '../src/engine/runner';
import { deriveRoom } from '../src/realtime/derive';

type Picks = Record<string, (1 | 2 | 3)[]>;

/** 장면별로 고를 답 (배드 → 재투표를 시험하려고 일부러 틀린 답 먼저). Stage 1의 세 갈래를 한 번씩 돌아요. */
const routes: { name: string; picks: Picks }[] = [
  { name: '① 축제 → 밴드 공연 ① 호응', picks: { s1: [1], 's1-band': [1], s2: [1, 3, 2], s3: [2, 1], s4: [1, 2, 3], epilogue: [1, 3, 2] } },
  { name: '② 박람회 → 첫 대화(배드 → ①)', picks: { s1: [2], 's1-talk': [3, 1], s2: [2], s3: [3], s4: [3], epilogue: [2] } },
  { name: '② 박람회 → 첫 대화 ②', picks: { s1: [2], 's1-talk': [2], s2: [2], s3: [1], s4: [3], epilogue: [2] } },
  { name: '③ 새터 → 밴드 공연 ② 쪽지', picks: { s1: [3], 's1-band': [2], s2: [2], s3: [1], s4: [3], epilogue: [2] } },
  { name: '③ 새터 → 밴드 공연 ③ 가입', picks: { s1: [3], 's1-band': [3], s2: [2], s3: [3], s4: [3], epilogue: [2] } },
];

let failed = false;
const visited = new Set<string>();

for (const route of routes) {
  let s: RunState = initial();
  const d = (a: Action) => { s = reduce(s, a); };
  const picks: Picks = JSON.parse(JSON.stringify(route.picks));
  const log: string[] = [];
  let guard = 0;
  d({ type: 'START' });
  while (guard++ < 1000) {
    const sc = story.scene(s.scene);
    visited.add(s.scene);
    if (s.mode === 'beats') {
      const f = currentFrame(s);
      log.push(`${s.scene}#${s.frame} ${f.beat?.t ?? '-'} ♥${s.affinity}`);
      if (sc.end && s.frame === story.get(s.scene).frames.length - 1) break;
      d({ type: 'NEXT' });
    } else if (s.mode === 'choice') {
      d({ type: 'OPEN', now: 0 });
      const room = deriveRoom(s, 1000);
      if (room.phase !== 'vote') throw new Error('phone should vote');
      const n = picks[s.scene]?.shift() ?? ((sc.choice!.options.findIndex((o) => !o.bad) + 1) as 1 | 2 | 3); // 지정 없으면 배드가 아닌 첫 답
      const counts: [number, number, number] = [0, 0, 0]; counts[n - 1] = 10;
      d({ type: 'TALLY', counts, voters: 10 }); d({ type: 'CLOSE' }); d({ type: 'RESULT' });
      const r = deriveRoom(s, 0) as { verdict?: string; bad?: boolean };
      log.push(`  VOTE ${s.scene} r${s.vote!.round}${s.vote!.retry ? ' retry' : ''} → ${s.vote!.win} (${r.verdict ?? ''}${r.bad ? ' BAD' : ''})`);
      d({ type: 'NEXT' });
    } else if (s.mode === 'bad') {
      log.push(`  bad frame ${s.bad!.frame} checkpoint=${isCheckpoint(s)}`);
      d({ type: 'NEXT' });
    }
  }
  // back test
  const before = s.scene + s.frame;
  d({ type: 'BACK' }); d({ type: 'BACK' }); d({ type: 'NEXT' }); d({ type: 'NEXT' });
  const backOk = before === s.scene + s.frame;
  const ended = !!story.scene(s.scene).end && deriveRoom(s, 0).phase === 'end';
  const full = s.affinity === story.scenario.hearts;
  if (!backOk || !ended || !full) failed = true;
  console.log(`\n━━ ${route.name} ━━`);
  console.log(log.join('\n'));
  console.log(`back/forward ok: ${backOk} · 끝까지 감: ${ended} · final affinity ${s.affinity}/${story.scenario.hearts} · room ${deriveRoom(s, 0).phase} · 스페이스 ${log.length}번`);
}

const unvisited = story.scenario.scenes.map((x) => x.id).filter((id) => !visited.has(id));
console.log(`\n지나간 장면 ${visited.size} / ${story.scenario.scenes.length}${unvisited.length ? ` · 안 지나간 장면: ${unvisited.join(', ')}` : ''}`);
if (unvisited.length) failed = true;
if (failed) throw new Error('✗ 문제가 있어요 — 위 기록을 확인해 주세요');
console.log('✓ 모든 갈래 통과');
