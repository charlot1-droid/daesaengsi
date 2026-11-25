/**
 * 무대 한 화면 = 배경(+스탠딩·연출) / 위쪽 읽는 곳 / 아래 모서리 칩.
 * 진행자 화면과 /script 미리보기가 같이 써요.
 */
import type { CSSProperties, ReactNode } from 'react';
import { ART_DECALS, artSrc, type ArtId } from '../../art/manifest';
import type { Frame } from '../../engine/frames';
import type { Scenario } from '../../scenario/schema';
import { Hearts, Missing, txt } from './bits';
import { DialogueBox } from './DialogueBox';
import { Flyers, Sprites } from './Fx';
import type { ShownBeat } from '../../engine/frames';
import { Notice, Notify, PhoneDM, Prop, QuestionCard, ScreenView, StageSplash, SurfaceText } from './Panels';

/** 대사·공지·알림 화면: 배경은 그대로 두고 스탠딩만 대사창 아래로 내려서 얼굴이 가려지지 않게 해요. */
export const wantsBand = (beat: ShownBeat | null | undefined, choice = false) =>
  choice || !beat || beat.t === 'say' || beat.t === 'notice' || beat.t === 'notify';

interface ScreenProps {
  frame: Pick<Frame, 'bg' | 'night' | 'sprite'> & { saebom?: Frame['saebom'] };
  /** 대사창이 있는 화면 → 스탠딩을 대사창 아래로 (wantsBand) */
  band?: boolean;
  read: ReactNode;
  foot?: ReactNode;
  dim?: boolean;
  /** 바뀔 때마다 한 번 흔들림 */
  shakeKey?: string | null;
  flyersKey?: string | null;
  style?: CSSProperties;
  overlay?: ReactNode;
}

export function StageScreen({ frame, band, read, foot, dim, shakeKey, flyersKey, style, overlay }: ScreenProps) {
  const src = artSrc(frame.bg);
  const shown = src; // 배경은 전환 효과 없이 바로 바꿔요
  return (
    <div className="ds-stage" data-theme={frame.night ? 'night' : 'day'} style={style}>
      <div
        key={shakeKey ?? 'still'}
        className="ds-screen"
        data-dim={dim ? '' : undefined}
        data-shake={shakeKey ? '' : undefined}
        data-band={band ? '' : undefined}
      >
        <div className="app-under">
          <div className="app-art" style={shown ? { backgroundImage: `url(${shown})` } : undefined} />
          {ART_DECALS[frame.bg as ArtId] && (() => {
            const d = ART_DECALS[frame.bg as ArtId]!;
            return <div className="app-art-decal" style={{ aspectRatio: String(d.ratio) }}><SurfaceText s={d.surface} text={d.text} /></div>;
          })()}
          {!src && <Missing id={frame.bg} variant="bg" />}
          <Sprites namju={frame.sprite} saebom={frame.saebom} />
          {flyersKey && <Flyers key={flyersKey} />}
        </div>
        <div className="ds-screen__read" style={{ justifyItems: 'stretch' }}>{read}</div>
        <div />
        <div className="ds-screen__foot">{foot}</div>
      </div>
      {overlay}
    </div>
  );
}

export function Foot({ stage, affinity, hearts, players }: { stage?: { n: string; name: string }; affinity: number; hearts: number; players: number | null }) {
  return (
    <>
      {stage ? (
        <span className="ds-panel ds-chip"><span className="ds-chip__k">{stage.n}</span>{txt(stage.name)}</span>
      ) : <span />}
      <span className="ds-screen__foot-end">
        <span className="ds-panel ds-chip">김남주 <Hearts value={affinity} total={hearts} /></span>
        {players != null && <span className="ds-panel ds-chip num">{players}명</span>}
      </span>
    </>
  );
}

export interface BeatCtx {
  scenario: Scenario;
  stage?: { n: string; name: string };
  affinity: number;
  /** 대사 줄 드러남을 건너뛰었는지 */
  typed?: boolean;
  /** 무대 모드: 배우가 직접 말하는 여주·나레이터 대사는 숨겨요 */
  stageMode?: boolean;
  share?: { index: number; of: number; startedAt: number };
  /** 미리보기에서는 애니메이션 없이 */
  still?: boolean;
}

/** 프레임 → 읽는 곳 내용 + 화면 옵션 */
export function beatView(f: Frame, c: BeatCtx): { read: ReactNode; foot: boolean; dim: boolean } {
  const b = f.beat;
  if (!b) return { read: null, foot: true, dim: false };
  switch (b.t) {
    case 'say': {
      const cast = c.scenario.cast[b.who] ?? { name: b.who, tab: 'namju' as const };
      if (c.stageMode && cast.tab !== 'namju') return { read: null, foot: true, dim: false };
      return { read: <DialogueBox lineKey={f.key} cast={cast} text={b.text} typed={c.typed} typing={!c.still} />, foot: true, dim: false };
    }
    case 'notice':
      return { read: <Notice key={f.key} b={b} />, foot: true, dim: false };
    case 'notify':
      return { read: <Notify key={f.key} b={b} affinity={c.affinity} hearts={c.scenario.hearts} />, foot: true, dim: false };
    case 'phone':
      return { read: f.phone ? <PhoneDM phone={f.phone} /> : null, foot: false, dim: true };
    case 'prop':
      return { read: <Prop key={f.key} b={b} />, foot: false, dim: true };
    case 'splash':
      return { read: <StageSplash key={f.key} b={b} n={c.stage?.n} />, foot: false, dim: false };
    case 'share':
      return {
        read: <QuestionCard key={f.key} b={b} index={c.share?.index ?? 1} of={c.share?.of ?? 1} startedAt={c.share?.startedAt ?? Date.now()} />,
        foot: false,
        dim: true,
      };
    case 'screen':
      return { read: <ScreenView key={f.key} b={b} />, foot: b.view === 'sugang', dim: b.view === 'sugang' };
  }
}
