/**
 * 무대 화면 (/host) — 진행자 노트북 → 프로젝터.
 *
 * 단축키
 *   스페이스 · → · PageDown · 클릭   다음 (리모컨 '다음' 버튼도 PageDown)
 *   ← · PageUp · Backspace           뒤로
 *   Enter                            투표 지금 마감 (투표 중이 아니면 '다음')
 *   1 · 2 · 3                        직접 고르기 (팻말 모드 · 결과 뒤집기)
 *   T  타이머 처음부터     P  멈춤/계속     S  무대 모드(여주·나레이터 대사 숨김)
 *   M  소리 끄기/켜기      F  전체 화면      H  도움말·장면 이동
 *
 * 주소 옵션: ?scene=s3 (그 장면부터) · ?link=offline (팻말 모드) · ?link=local · ?fresh (새 방)
 */
import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type CSSProperties } from 'react';
import { play, setMuted } from '../audio/sfx';
import { CONFIG } from '../config';
import type { Pick } from '../engine/affinity';
import { currentFrame, initial, isCheckpoint, reduce, story, timeLeft, type Action, type RunState } from '../engine/runner';
import { deriveRoom, roomKey } from '../realtime/derive';
import { createHostLink, joinUrl } from '../realtime/index';
import type { HostLink, Poll } from '../realtime/types';
import { txt } from '../scenario/text';
import { ChoiceBoard } from '../ui/stage/ChoiceBoard';
import { Lobby } from '../ui/stage/Lobby';
import { Checkpoint } from '../ui/stage/Panels';
import { beatView, Foot, StageScreen } from '../ui/stage/StageScreen';

function useStageScale() {
  const calc = () => Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
  const [u, setU] = useState(calc);
  useEffect(() => {
    const on = () => setU(calc());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return u;
}

function boot(): RunState {
  const s = initial();
  const want = new URLSearchParams(location.search).get('scene');
  return want && story.byId.has(want) ? { ...s, scene: want } : s;
}

const EMPTY_POLL: Poll = { players: 0, names: [], counts: [0, 0, 0], voters: 0 };

export function Host() {
  const [run, dispatch] = useReducer((s: RunState, a: Action) => reduce(s, a), undefined, boot);
  const runRef = useRef(run);
  runRef.current = run;

  const [link, setLink] = useState<HostLink | null>(null);
  const [linkError, setLinkError] = useState<string>();
  const [sendError, setSendError] = useState<string>();
  const [poll, setPoll] = useState<Poll>(EMPTY_POLL);
  const [now, setNow] = useState(() => Date.now());
  const [help, setHelp] = useState(false);
  const [stageMode, setStageMode] = useState(false);
  const [muted, setMute] = useState(false);
  const [typed, setTyped] = useState(false);
  const frameAt = useRef(Date.now());
  const [shareAt, setShareAt] = useState(() => Date.now());
  const u = useStageScale();

  const sc = story.scene(run.scene);
  const frame = currentFrame(run);
  const vote = run.vote;
  const offline = link?.kind === 'offline';

  /* ---------- 연결 ---------- */
  useEffect(() => {
    let alive = true;
    createHostLink({ fresh: new URLSearchParams(location.search).has('fresh') }).then(
      (l) => (alive ? setLink(l) : l.close()),
      (e: Error) => setLinkError(e.message),
    );
    return () => { alive = false; };
  }, []);
  useEffect(() => () => link?.close(), [link]);

  /* ---------- 시계 ---------- */
  const fast = vote?.phase === 'open' || frame.beat?.t === 'share';
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), fast ? 100 : 500);
    return () => clearInterval(t);
  }, [fast]);

  /* ---------- 휴대폰으로 상태 보내기 (내용이 바뀔 때만) ---------- */
  const draft = useMemo(() => deriveRoom(run, Date.now()), [run]);
  const key = roomKey(draft);
  const seq = useRef(0);
  useEffect(() => {
    if (!link) return;
    seq.current += 1;
    link.publish({ ...deriveRoom(runRef.current, Date.now()), seq: seq.current } as never).then(
      () => setSendError(undefined),
      (e: Error) => setSendError(`상태 전송 실패: ${e.message}`),
    );
  }, [key, link]);

  /* ---------- 인원 · 표 수 받아 오기 ---------- */
  const counting = vote && (vote.phase === 'open' || vote.phase === 'closed') && !vote.manual;
  useEffect(() => {
    if (!link || offline) return;
    let busy = false;
    const tick = () => {
      if (busy) return;
      busy = true;
      const r = runRef.current.vote;
      link.poll(r ? r.round : null)
        .then((p) => {
          setPoll(p);
          if (r && runRef.current.vote?.round === r.round) dispatch({ type: 'TALLY', counts: p.counts, voters: p.voters });
        })
        .catch(() => {})
        .finally(() => { busy = false; });
    };
    tick();
    const t = setInterval(tick, counting || run.mode === 'lobby' ? CONFIG.pollMs : 2000);
    return () => clearInterval(t);
  }, [link, offline, counting, run.mode]);

  /* ---------- 투표 흐름: 나타남 → 열림 → 마감 → 결과 ---------- */
  useEffect(() => {
    if (vote?.phase !== 'reveal') return;
    const t = setTimeout(() => { dispatch({ type: 'OPEN', now: Date.now() }); play('open'); }, CONFIG.revealMs);
    return () => clearTimeout(t);
  }, [vote?.phase, vote?.round]);

  const left = vote ? timeLeft(vote, now) : 0;
  const lastTick = useRef(-1);
  useEffect(() => {
    if (vote?.phase !== 'open' || vote.pausedLeft != null) return;
    const s = Math.ceil(left / 1000);
    if (s <= 5 && s > 0 && s !== lastTick.current) { lastTick.current = s; play('tick'); }
    if (left <= 0) dispatch({ type: 'CLOSE' });
  }, [left, vote?.phase, vote?.pausedLeft]);

  useEffect(() => {
    if (vote?.phase !== 'closed' || !link) return;
    if (offline) { dispatch({ type: 'RESULT' }); return; }
    const round = vote.round;
    // 마지막 표가 도착할 시간을 조금 주고 최종 집계
    const t = setTimeout(() => {
      link.poll(round).then(
        (p) => runRef.current.vote?.round === round && dispatch({ type: 'RESULT', counts: p.counts, voters: p.voters }),
        () => dispatch({ type: 'RESULT' }),
      );
    }, 400);
    return () => clearTimeout(t);
  }, [vote?.phase, vote?.round, link, offline]);

  useEffect(() => { if (vote?.phase === 'result') play('reveal'); }, [vote?.phase, vote?.round, vote?.win]);

  /* ---------- 화면이 바뀔 때 ---------- */
  useEffect(() => {
    frameAt.current = Date.now();
    setTyped(false);
    if (frame.beat?.t === 'share') setShareAt(Date.now());
    if (frame.beat && 'sfx' in frame.beat && frame.beat.sfx) play(frame.beat.sfx);
    else if (frame.beat?.t === 'phone') play('dm');
  }, [frame.key]);

  /* ---------- 조작 ---------- */
  const advance = useCallback(() => {
    const s = runRef.current;
    const f = currentFrame(s);
    if (s.mode === 'beats' && f.beat?.t === 'say' && Date.now() - frameAt.current < 700) {
      setTyped(true); // 줄이 드러나는 중이면 먼저 전체를 보여 줘요
      return;
    }
    dispatch({ type: 'NEXT' });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const s = runRef.current;
      const k = e.key.toLowerCase();
      if ([' ', 'arrowright', 'pagedown'].includes(k)) advance();
      else if (k === 'enter') s.vote?.phase === 'open' ? dispatch({ type: 'CLOSE' }) : advance();
      else if (['arrowleft', 'pageup', 'backspace'].includes(k)) dispatch({ type: 'BACK' });
      else if (k === '1' || k === '2' || k === '3') dispatch({ type: 'PICK', n: Number(k) as Pick });
      else if (k === 't') {
        if (s.mode === 'choice') dispatch({ type: 'RESTART_TIMER' });
        else setShareAt(Date.now());
      } else if (k === 'p') {
        if (s.vote?.pausedLeft != null) dispatch({ type: 'RESUME', now: Date.now() });
        else dispatch({ type: 'PAUSE', now: Date.now() });
      } else if (k === 's') setStageMode((v) => !v);
      else if (k === 'm') setMute((v) => { setMuted(!v); return !v; });
      else if (k === 'f') void (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen());
      else if (k === 'h' || k === '?') setHelp((v) => !v);
      else if (k === 'escape') setHelp(false);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance]);

  /* ---------- 그리기 ---------- */
  const players = offline ? null : poll.players;
  const stageStyle = { '--u': `${u}px` } as CSSProperties;
  const foot = <Foot stage={sc.stage} affinity={run.affinity} hearts={story.scenario.hearts} players={players} />;

  let screen;
  if (run.mode === 'lobby') {
    screen = (
      <StageScreen
        frame={{ bg: 'kv-title', night: false, sprite: null }}
        read={<Lobby url={joinUrl(link?.pin ?? '')} pin={link?.pin ?? ''} players={poll.players} names={poll.names} offline={offline} connecting={!link} error={linkError} />}
        style={stageStyle}
        overlay={help && <HelpPanel run={run} dispatch={dispatch} link={link} error={sendError ?? linkError} stageMode={stageMode} muted={muted} />}
      />
    );
  } else if (run.mode === 'choice' && vote && sc.choice) {
    screen = (
      <StageScreen
        frame={frame}
        read={
          <ChoiceBoard
            q={txt(sc.choice.q)}
            options={sc.choice.options.map((o) => txt(o.label)) as [string, string, string]}
            phase={vote.phase} counts={vote.counts} voters={vote.voters} players={poll.players}
            leftMs={left} seconds={vote.seconds} paused={vote.pausedLeft != null} win={vote.win} offline={offline || vote.manual}
          />
        }
        foot={foot}
        style={stageStyle}
        overlay={help && <HelpPanel run={run} dispatch={dispatch} link={link} error={sendError} stageMode={stageMode} muted={muted} />}
      />
    );
  } else if (run.mode === 'bad' && run.bad && isCheckpoint(run)) {
    const bad = sc.choice!.options[run.bad.option - 1].bad!;
    screen = (
      <StageScreen
        frame={frame}
        read={<Checkpoint title={bad.title} back={bad.back} react={bad.react} onRetry={() => dispatch({ type: 'RETRY' })} />}
        style={stageStyle}
        overlay={help && <HelpPanel run={run} dispatch={dispatch} link={link} error={sendError} stageMode={stageMode} muted={muted} />}
      />
    );
  } else {
    const frames = story.get(run.scene).frames;
    const shareFrames = frames.filter((f) => f.beat?.t === 'share');
    const v = beatView(frame, {
      scenario: story.scenario, stage: sc.stage, affinity: run.affinity, typed, stageMode,
      share: { index: shareFrames.indexOf(frame) + 1, of: shareFrames.length, startedAt: shareAt },
    });
    const fx = frame.beat && 'fx' in frame.beat ? frame.beat.fx : undefined;
    screen = (
      <StageScreen
        frame={frame}
        read={v.read}
        foot={v.foot ? foot : null}
        dim={v.dim}
        shakeKey={fx === 'shake' ? frame.key : null}
        flyersKey={fx === 'flyers' ? frame.key : null}
        style={stageStyle}
        overlay={help && <HelpPanel run={run} dispatch={dispatch} link={link} error={sendError} stageMode={stageMode} muted={muted} />}
      />
    );
  }

  return (
    <div
      className="app-host"
      data-cursor={help ? '' : undefined}
      onClick={(e) => { if (!(e.target as HTMLElement).closest('.app-help, button')) advance(); }}
    >
      {screen}
    </div>
  );
}

/* ---------- 도움말 · 장면 이동 (H) ---------- */
function HelpPanel({ run, dispatch, link, error, stageMode, muted }: {
  run: RunState; dispatch: (a: Action) => void; link: HostLink | null; error?: string; stageMode: boolean; muted: boolean;
}) {
  const kind = link?.kind === 'supabase' ? '실시간 (Supabase)' : link?.kind === 'local' ? '리허설 (같은 브라우저 탭끼리)' : link?.kind === 'offline' ? '팻말 모드' : '연결 중';
  return (
    <div className="ds-panel app-help" onClick={(e) => e.stopPropagation()}>
      <h2>진행자 도움말</h2>
      <dl>
        <dt>스페이스 · → · 클릭</dt><dd>다음</dd>
        <dt>← · Backspace</dt><dd>뒤로</dd>
        <dt>Enter</dt><dd>투표 지금 마감</dd>
        <dt>1 · 2 · 3</dt><dd>직접 고르기 (팻말 · 결과 바꾸기)</dd>
        <dt>T / P</dt><dd>타이머 처음부터 / 멈춤·계속</dd>
        <dt>S</dt><dd>무대 모드 {stageMode ? '켜짐' : '꺼짐'} (여주·나레이터 대사 숨김)</dd>
        <dt>M / F</dt><dd>소리 {muted ? '꺼짐' : '켜짐'} / 전체 화면</dd>
      </dl>
      <div className="app-help__scenes">
        {story.scenario.scenes.map((s) => (
          <button key={s.id} aria-current={s.id === run.scene ? 'true' : undefined} onClick={() => { if (run.mode === 'lobby') dispatch({ type: 'START' }); dispatch({ type: 'JUMP', scene: s.id }); }}>
            {s.id}
          </button>
        ))}
      </div>
      <p className="app-help__meta">연결: {kind}{link && link.kind !== 'offline' ? ` · 입장 번호 ${link.pin}` : ''} · 라운드 {run.round} · 호감도 {run.affinity}</p>
      {error && <p className="app-help__meta" style={{ color: 'var(--alert)' }}>{error}</p>}
    </div>
  );
}
