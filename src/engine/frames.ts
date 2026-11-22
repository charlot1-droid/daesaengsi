/**
 * 대본 비트 → 화면(Frame) 목록으로 펼치기.
 * 렌더러는 Frame 하나만 보고 그리면 돼요(배경·스탠딩·DM 누적이 이미 계산돼 있어요).
 */
import type { ArtId } from '../art/manifest';
import type { Beat, Face, Outfit, PhoneBeat, PhoneMsg, Scene } from '../scenario/schema';

export type ShownBeat = Exclude<Beat, { t: 'bg' } | { t: 'sprite' }>;

export interface Ctx {
  bg: ArtId;
  night: boolean;
  sprite: { face: Face; outfit: Outfit } | null;
  outfit: Outfit;
}

export interface Frame {
  bg: ArtId;
  night: boolean;
  sprite: { face: Face; outfit: Outfit } | null;
  /** null = 배경만 (보여 줄 비트가 없는 장면) */
  beat: ShownBeat | null;
  /** phone 비트일 때 지금까지 보인 메시지 */
  phone?: Omit<PhoneBeat, 'msgs'> & { msgs: PhoneMsg[]; latest: boolean };
  /** 이 화면에 들어올 때 호감도 변화 */
  affinity?: number;
  /** 디버그·뒤로가기용 위치 */
  key: string;
}

export function startCtx(scene: Scene): Ctx {
  return { bg: scene.bg, night: !!scene.night, sprite: null, outfit: 'a' };
}

export function compileBeats(beats: Beat[], ctx: Ctx, keyPrefix: string): { frames: Frame[]; ctx: Ctx } {
  const frames: Frame[] = [];
  let c: Ctx = { ...ctx };
  let thread: PhoneMsg[] = [];

  beats.forEach((b, i) => {
    switch (b.t) {
      case 'bg':
        c = { ...c, bg: b.art, night: b.night ?? c.night };
        return;
      case 'sprite':
        c = { ...c, outfit: b.outfit ?? c.outfit };
        c.sprite = b.face ? { face: b.face, outfit: c.outfit } : null;
        return;
      case 'say':
        if (b.face !== undefined && b.who === 'namju') c = { ...c, sprite: b.face ? { face: b.face, outfit: c.outfit } : null };
        else if (b.face === null) c = { ...c, sprite: null };
        break;
      case 'phone': {
        const { msgs, ...rest } = b;
        if (!b.continues) thread = [];
        msgs.forEach((m, j) => {
          thread = [...thread, m];
          frames.push({
            bg: c.bg, night: c.night, sprite: null, beat: b,
            phone: { ...rest, msgs: thread, latest: j === msgs.length - 1 },
            key: `${keyPrefix}:${i}.${j}`,
          });
        });
        return;
      }
    }
    frames.push({
      bg: c.bg,
      night: c.night,
      sprite: b.t === 'say' || b.t === 'notify' ? c.sprite : b.t === 'notice' ? c.sprite : null,
      beat: b,
      affinity: b.t === 'notify' ? b.affinity : undefined,
      key: `${keyPrefix}:${i}`,
    });
  });

  return { frames, ctx: c };
}

export interface CompiledScene {
  scene: Scene;
  frames: Frame[];
  /** 선택지 화면의 배경/스탠딩 */
  end: Ctx;
  /** option 번호(1~3) → 배드 엔딩 화면 목록 (체크포인트 판은 맨 끝에 따로) */
  bad: Record<number, Frame[]>;
}

export function compileScene(scene: Scene): CompiledScene {
  const { frames, ctx } = compileBeats(scene.beats, startCtx(scene), scene.id);
  if (frames.length === 0) frames.push({ bg: ctx.bg, night: ctx.night, sprite: ctx.sprite, beat: null, key: `${scene.id}:empty` });
  const bad: Record<number, Frame[]> = {};
  scene.choice?.options.forEach((o, i) => {
    if (o.bad) bad[i + 1] = compileBeats(o.bad.beats ?? [], { ...ctx, sprite: null }, `${scene.id}:bad${i + 1}`).frames;
  });
  return { scene, frames, end: ctx, bad };
}
