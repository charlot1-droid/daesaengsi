/** 대본을 처음부터 끝까지 자동으로 돌려 보는 점검 (배드 엔딩 → 재투표 포함). npm run simulate */
import { initial, reduce, currentFrame, isCheckpoint, story, type RunState, type Action } from '../src/engine/runner';
import { deriveRoom } from '../src/realtime/derive';
let s: RunState = initial();
const d = (a: Action) => { s = reduce(s, a); };
// 장면별로 고를 답 (배드 → 재투표를 시험하려고 일부러 틀린 답 먼저)
const picks: Record<string, (1|2|3)[]> = { s1: [1], s2: [3, 2], s3: [3, 1], s4: [2, 1], s5: [1] };
const log: string[] = [];
let guard = 0;
d({ type: 'START' });
while (guard++ < 500) {
  const sc = story.scene(s.scene);
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
    const counts: [number,number,number] = [0,0,0]; counts[n-1] = 10;
    d({ type: 'TALLY', counts, voters: 10 }); d({ type: 'CLOSE' }); d({ type: 'RESULT' });
    log.push(`  VOTE ${s.scene} r${s.vote!.round}${s.vote!.retry?' retry':''} → ${s.vote!.win} (${(deriveRoom(s,0) as any).verdict ?? ''}${(deriveRoom(s,0) as any).bad?' BAD':''})`);
    d({ type: 'NEXT' });
  } else if (s.mode === 'bad') {
    log.push(`  bad frame ${s.bad!.frame} checkpoint=${isCheckpoint(s)}`);
    d({ type: 'NEXT' });
  }
}
console.log(log.join('\n'));
// back test
const before = s.scene + s.frame;
d({ type: 'BACK' }); d({ type: 'BACK' }); d({ type: 'NEXT' }); d({ type: 'NEXT' });
console.log('back/forward ok:', before === s.scene + s.frame, 'final affinity', s.affinity, 'room', deriveRoom(s, 0).phase);
