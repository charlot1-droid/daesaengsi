/**
 * 대본 미리보기 (/script) — 모든 장면의 모든 화면을 한 페이지에 작게 늘어놓아요.
 * 대본을 고친 뒤 흐름·글자 넘침·빠진 그림을 한눈에 확인하는 용도. 무대에는 쓰지 않아요.
 */
import { ART } from '../art/manifest';
import type { Pick } from '../engine/affinity';
import { story } from '../engine/runner';
import { validate } from '../scenario/validate';
import { isPlaceholder, txt } from '../scenario/text';
import { ChoiceBoard } from '../ui/stage/ChoiceBoard';
import { Checkpoint } from '../ui/stage/Panels';
import { beatView, Foot, StageScreen, wantsBand } from '../ui/stage/StageScreen';

const beatText = (b: unknown) => JSON.stringify(b ?? '');

export function Script() {
  const report = validate(story.scenario);
  const needed = [...report.artUse.keys()].filter((id) => ART[id].status === 'needed');

  return (
    <div className="app-board">
      <div>
        <h1 className="app-board__title">{story.scenario.title} · 대본 미리보기</h1>
        <p className="app-board__meta">
          장면 {story.scenario.scenes.length}개 · 자리채움 문장 {report.placeholders}개 · 필요한 이미지 {needed.length}장 · 오류 {report.errors.length} · 경고 {report.warnings.length}
        </p>
        {[...report.errors, ...report.warnings].map((m) => <p key={m} className="app-board__meta">· {m}</p>)}
      </div>

      {story.scenario.scenes.map((sc) => {
        const c = story.get(sc.id);
        const shares = c.frames.filter((f) => f.beat?.t === 'share' && !f.beat.label);
        return (
          <section key={sc.id}>
            <h2 className="app-board__scene">{sc.id}<small>{sc.stage ? `${sc.stage.n} · ${txt(sc.stage.name)}` : ''} → {sc.choice ? '선택지' : sc.end ? '끝' : sc.next}</small></h2>
            <div className="app-board__row">
              {c.frames.map((f, i) => {
                const v = beatView(f, { scenario: story.scenario, stage: sc.stage, affinity: 2, still: true, share: { index: shares.indexOf(f) + 1, of: shares.length, startedAt: Date.now() } });
                return (
                  <div key={f.key} className="app-board__cell">
                    <StageScreen frame={f} band={wantsBand(f.beat)} read={v.read} foot={v.foot ? <Foot stage={sc.stage} affinity={2} hearts={story.scenario.hearts} players={128} /> : null} dim={v.dim} />
                    <span>#{i + 1} {f.beat?.t ?? '배경'}{isPlaceholder(beatText(f.beat)) ? ' · 자리채움' : ''}</span>
                  </div>
                );
              })}
              {sc.choice && (
                <div className="app-board__cell">
                  <StageScreen
                    band
                    frame={{ bg: c.end.bg, night: c.end.night, sprite: c.end.sprite, saebom: c.end.saebom }}
                    read={<ChoiceBoard q={txt(sc.choice.q)} options={sc.choice.options.map((o) => txt(o.label)) as [string, string, string]} phase="open" counts={[0, 0, 0]} voters={96} players={128} leftMs={sc.choice.seconds * 1000} seconds={sc.choice.seconds} paused={false} win={null} offline={false} />}
                    foot={<Foot stage={sc.stage} affinity={2} hearts={story.scenario.hearts} players={128} />}
                  />
                  <span>선택지 {sc.choice.seconds}초 · {sc.choice.options.map((o, i) => `${i + 1}→${o.bad ? 'BAD' : o.go ?? sc.next}`).join(' / ')}</span>
                </div>
              )}
              {sc.choice?.options.map((o, i) => {
                if (!o.bad) return null;
                const n = (i + 1) as Pick;
                return [
                  ...(c.bad[n] ?? []).map((f) => {
                    const v = beatView(f, { scenario: story.scenario, stage: sc.stage, affinity: 2, still: true });
                    return (
                      <div key={f.key} className="app-board__cell">
                        <StageScreen frame={f} band={wantsBand(f.beat)} read={v.read} dim={v.dim} />
                        <span>배드 {n} · {f.beat?.t}</span>
                      </div>
                    );
                  }),
                  <div key={`cp${n}`} className="app-board__cell">
                    <StageScreen frame={{ bg: c.end.bg, night: c.end.night, sprite: null }} read={<Checkpoint title={o.bad.title} back={o.bad.back} react={o.bad.react} />} />
                    <span>배드 {n} · 체크포인트 → 15초 재투표</span>
                  </div>,
                ];
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
