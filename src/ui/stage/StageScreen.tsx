/**
 * 무대 한 화면 = 배경(+스탠딩·연출) / 위쪽 읽는 곳 / 아래 모서리 칩.
 * 진행자 화면과 /script 미리보기가 같이 써요.
 */
import type { CSSProperties, ReactNode } from 'react';
import { artSrc } from '../../art/manifest';
import type { Frame } from '../../engine/frames';
import type { Scenario } from '../../scenario/schema';
import { Hearts, Missing, txt } from './bits';
import { DialogueBox } from './DialogueBox';
import { Flyers, Sprite } from './Fx';
import { Notice, Notify, PhoneDM, Prop, QuestionCard, ScreenView, StageSplash } from './Panels';

interface ScreenProps {
  frame: Pick<Frame, 'bg' | 'night' | 'sprite'>;
  read: ReactNode;
  foot?: ReactNode;
  dim?: boolean;
  /** 바뀔 때마다 한 번 흔들림 */
  shakeKey?: string | null;
  flyersKey?: string | null;
  style?: CSSProperties;
  overlay?: ReactNode;
}

export function StageScreen({ frame, read, foot, dim, shakeKey, flyersKey, style, overlay }: ScreenProps) {
  const src = artSrc(frame.bg);
  return (
    <div className="ds-stage" data-theme={frame.night ? 'night' : 'day'} style={style}>
      <div
        key={shakeKey ?? 'still'}
        className="ds-screen"
        data-dim={dim ? '' : undefined}
        data-shake={shakeKey ? '' : undefined}
        style={src ? { backgroundImage: `url(${src})` } : undefined}
      >
        <div className="app-under">
          {!src && <Missing id={frame.bg} variant="bg" />}
          {frame.sprite && <Sprite face={frame.sprite.face} outfit={frame.sprite.outfit} />}
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
      return { read: <DialogueBox key={f.key} cast={cast} text={b.text} typed={c.typed} typing={!c.still} />, foot: true, dim: false };
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
