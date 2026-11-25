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
import { play, preloadSfx, setMuted } from '../audio/sfx';
import { duckBgm, setBgm, setBgmMuted } from '../audio/bgm';
import type { Bgm } from '../scenario/schema';
import { CONFIG } from '../config';
import type { Pick } from '../engine/affinity';
import { currentFrame, initial, isCheckpoint, reduce, story, timeLeft, type Action, type RunState } from '../engine/runner';
import { deriveRoom, roomKey } from '../realtime/derive';
import { createHostLink, joinUrl } from '../realtime/index';
import type { HostLink, Poll } from '../realtime/types';
import { txt } from '../scenario/text';
import { ChoiceBoard, TIE_SPIN_MS } from '../ui/stage/ChoiceBoard';
import { AutoRing } from '../ui/stage/AutoRing';
import { Lobby } from '../ui/stage/Lobby';
import { Checkpoint } from '../ui/stage/Panels';
import { FullscreenButton, TitleScreen, useFullscreen } from '../ui/stage/Title';
import { beatView, Foot, StageScreen, wantsBand } from '../ui/stage/StageScreen';

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
  // 첫 화면: 타이틀 → 아무 키나 누르면 QR 로비 (?scene= 으로 열었으면 건너뛰어요)
  const [title, setTitle] = useState(() => run.mode === 'lobby' && !new URLSearchParams(location.search).get('scene'));
  const titleRef = useRef(title);
  titleRef.current = title;
  const leaveTitle = useCallback(() => { if (titleRef.current) { setTitle(false); play('open'); } }, []);
  const fs = useFullscreen();
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
  // 배포 주소인데 Supabase 정보가 없으면 휴대폰이 절대 연결되지 않아요 → 로비에 크게 알려요
  const rehearsalOnly = link?.kind === 'local' && !['localhost', '127.0.0.1'].includes(location.hostname) && new URLSearchParams(location.search).get('link') !== 'local';
  const lobbyError = linkError ?? (rehearsalOnly ? 'Supabase 연결 정보가 없어서 휴대폰이 연결되지 않아요. Vercel 환경 변수 VITE_SUPABASE_URL · VITE_SUPABASE_ANON_KEY를 넣고 다시 배포해 주세요.' : undefined);

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
  // 동률 추첨이 끝나면 한 번 더 계산해서 휴대폰에 결과를 보내요
  const [tieDone, setTieDone] = useState(0);
  useEffect(() => {
    if (vote?.phase !== 'result' || !vote.tie || vote.tie.length < 2) return;
    const t = setTimeout(() => setTieDone((n) => n + 1), 4700);
    return () => clearTimeout(t);
  }, [vote?.phase, vote?.round, vote?.tie]); // eslint-disable-line react-hooks/exhaustive-deps
  const draft = useMemo(() => deriveRoom(run, Date.now()), [run, tieDone]); // eslint-disable-line react-hooks/exhaustive-deps
  const key = roomKey(draft);
  // 진행자 화면을 새로고침해도 번호가 뒤로 가지 않게 시각 기반으로 (휴대폰은 더 작은 번호를 무시해요)
  const seq = useRef(0);
  useEffect(() => {
    if (!link) return;
    seq.current = Math.max(seq.current + 1, Date.now());
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
    const t = setTimeout(() => { dispatch({ type: 'OPEN', now: Date.now() }); }, CONFIG.revealMs);
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

  // 들어온 사람이 모두 투표하면 타이머를 기다리지 않고 바로 마감 → 집계 (멈춤 중엔 기다려요)
  const allVoted = !offline && vote?.phase === 'open' && vote.pausedLeft == null && poll.players > 0 && vote.voters >= poll.players;
  useEffect(() => {
    if (!allVoted) return;
    const t = setTimeout(() => dispatch({ type: 'CLOSE' }), 800); // 마지막 사람이 답을 바꿀 틈을 조금
    return () => clearTimeout(t);
  }, [allVoted]);

  useEffect(() => {
    if (vote?.phase !== 'closed' || !link) return;
    if (offline) { dispatch({ type: 'RESULT', rnd: Math.random(), at: Date.now() }); return; }
    const round = vote.round;
    // 마지막 표가 도착할 시간을 조금 주고 최종 집계
    const t = setTimeout(() => {
      link.poll(round).then(
        (p) => runRef.current.vote?.round === round && dispatch({ type: 'RESULT', counts: p.counts, voters: p.voters, rnd: Math.random(), at: Date.now() }),
        () => dispatch({ type: 'RESULT', rnd: Math.random(), at: Date.now() }),
      );
    }, 400);
    return () => clearTimeout(t);
  }, [vote?.phase, vote?.round, link, offline]);

  // 동률이면 추첨 연출(ChoiceBoard)이 소리를 내요
  useEffect(() => { if (vote?.phase === 'result' && !(vote.tie && vote.tie.length > 1)) play('reveal'); }, [vote?.phase, vote?.round, vote?.win]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- 배경음악 ---------- */
  useEffect(() => { preloadSfx(); }, []);
  const lastBgm = useRef<Bgm>('campus');
  if (sc.bgm) lastBgm.current = sc.bgm;
  // 투표 중에도 장면 곡을 그대로 — 선택지 판이 뜰 때 '띠링' 효과음만
  useEffect(() => { if (vote?.phase === 'reveal') play('vote'); }, [vote?.phase, vote?.round]); // eslint-disable-line react-hooks/exhaustive-deps
  const track: Bgm = run.mode === 'lobby' ? 'title' : sc.bgm ?? lastBgm.current;
  useEffect(() => { setBgm(track); }, [track]);
  // 배드 엔딩 중엔 음악을 줄여요
  useEffect(() => { duckBgm(run.mode === 'bad' ? 0.35 : 1); }, [run.mode]);
  // 입장 효과음은 뺐어요 (인원이 많으면 시끄러워서) — 숫자만 살짝 튀어요

  /* ---------- 화면이 바뀔 때 ---------- */
  useEffect(() => {
    frameAt.current = Date.now();
    setTyped(false);
    if (frame.beat?.t === 'share') setShareAt(Date.now());
    if (frame.beat && 'sfx' in frame.beat && frame.beat.sfx) play(frame.beat.sfx);
    else if (frame.beat?.t === 'phone') play('dm');
  }, [frame.key]);

  /* ---------- 자동 진행 ----------
     투표 결과는 6초 보여 준 뒤, 체크포인트(다시 고르기 안내)는 5초 뒤 저절로 넘어가요.
     대사는 늘 클릭으로. 자동으로 넘어가는 동안엔 화면 구석에 작은 카운트다운 링이 보여요 (P로 멈춤·계속). */
  const auto = useMemo(() => {
    if (run.mode === 'choice' && vote?.phase === 'result' && vote.win) {
      const tie = vote.tie && vote.tie.length > 1;
      return { key: `r:${run.scene}:${vote.round}:${vote.win}:${vote.resultAt ?? ''}`, wait: tie ? TIE_SPIN_MS + 600 : 0, ms: CONFIG.autoResultMs };
    }
    if (run.mode === 'bad' && isCheckpoint(run)) return { key: `c:${run.scene}:${run.round}`, wait: 0, ms: CONFIG.autoCheckpointMs };
    return null;
  }, [run]);
  const [autoHold, setAutoHold] = useState(false);
  const [autoStart, setAutoStart] = useState(0);
  const autoRef = useRef(auto);
  autoRef.current = auto;
  const guardUntil = useRef(0);
  useEffect(() => {
    setAutoHold(false);
    if (!auto) return;
    const t0 = setTimeout(() => setAutoStart(Date.now()), auto.wait);
    return () => clearTimeout(t0);
  }, [auto?.key]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!auto || autoHold || !autoStart) return;
    const left = auto.ms - (Date.now() - autoStart);
    const t = setTimeout(() => {
      if (autoRef.current?.key !== auto.key) return;
      guardUntil.current = Date.now() + 1000; // 넘어간 직후 클릭은 무시 (대사 건너뜀 방지)
      dispatch({ type: 'NEXT' });
    }, Math.max(0, left));
    return () => clearTimeout(t);
  }, [auto?.key, autoHold, autoStart]); // eslint-disable-line react-hooks/exhaustive-deps
  // 멈췄다 다시 시작하면 처음부터 다시 세요
  useEffect(() => { if (!autoHold && auto) setAutoStart((s) => (s ? Date.now() : s)); }, [autoHold]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setAutoStart(0); }, [auto?.key]);

  const autoNode = auto && autoStart > 0 ? <AutoRing key={`${auto.key}:${autoStart}`} ms={auto.ms} startedAt={autoStart} held={autoHold} /> : null;

  /* ---------- 조작 ---------- */
  const advance = useCallback(() => {
    const s = runRef.current;
    if (Date.now() < guardUntil.current) return;
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
      if (titleRef.current && !['f', 'm', 'h', '?', 'escape', 'tab', 'shift'].includes(k)) { leaveTitle(); e.preventDefault(); return; }
      if ([' ', 'arrowright', 'pagedown'].includes(k)) advance();
      else if (k === 'enter') s.vote?.phase === 'open' ? dispatch({ type: 'CLOSE' }) : advance();
      else if (['arrowleft', 'pageup', 'backspace'].includes(k)) dispatch({ type: 'BACK' });
      else if (k === '1' || k === '2' || k === '3') dispatch({ type: 'PICK', n: Number(k) as Pick });
      else if (k === 't') {
        if (s.mode === 'choice') dispatch({ type: 'RESTART_TIMER' });
        else setShareAt(Date.now());
      } else if (k === 'p') {
        if (autoRef.current) setAutoHold((h) => !h);
        else if (s.vote?.pausedLeft != null) dispatch({ type: 'RESUME', now: Date.now() });
        else dispatch({ type: 'PAUSE', now: Date.now() });
      } else if (k === 's') setStageMode((v) => !v);
      else if (k === 'm') setMute((v) => { setMuted(!v); setBgmMuted(!v); return !v; });
      else if (k === 'f') fs.toggle();
      else if (k === 'h' || k === '?') setHelp((v) => !v);
      else if (k === 'escape') { setHelp(false); if (document.fullscreenElement) void document.exitFullscreen(); }
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance, leaveTitle, fs.toggle]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- 그리기 ---------- */
  const players = offline ? null : poll.players;
  const stageStyle = { '--u': `${u}px` } as CSSProperties;
  const foot = <Foot stage={sc.stage} affinity={run.affinity} hearts={story.scenario.hearts} players={players} />;

  let screen;
  if (run.mode === 'lobby' && title) {
    screen = <TitleScreen style={stageStyle} overlay={help && <HelpPanel run={run} dispatch={dispatch} link={link} error={sendError} stageMode={stageMode} muted={muted} />} />;
  } else if (run.mode === 'lobby') {
    screen = (
      <StageScreen
        frame={{ bg: 'kv-title', night: false, sprite: null }}
        read={<Lobby url={joinUrl(link?.pin ?? '')} pin={link?.pin ?? ''} players={poll.players} names={poll.names} offline={offline} connecting={!link} error={lobbyError} />}
        style={stageStyle}
        overlay={help && <HelpPanel run={run} dispatch={dispatch} link={link} error={sendError ?? linkError} stageMode={stageMode} muted={muted} />}
      />
    );
  } else if (run.mode === 'choice' && vote && sc.choice) {
    screen = (
      <StageScreen
        frame={frame}
        band={wantsBand(null, true)}
        read={
          <ChoiceBoard
            q={txt(sc.choice.q)}
            options={sc.choice.options.map((o) => txt(o.label)) as [string, string, string]}
            phase={vote.phase} counts={vote.counts} voters={vote.voters} players={poll.players}
            leftMs={left} seconds={vote.seconds} paused={vote.pausedLeft != null} win={vote.win} tie={vote.tie} round={vote.round} off={vote.off} offline={offline || vote.manual} auto={autoNode}
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
        read={<Checkpoint title={bad.title} back={bad.back} react={bad.react} onRetry={() => dispatch({ type: 'RETRY' })} auto={autoNode} />}
        style={stageStyle}
        overlay={help && <HelpPanel run={run} dispatch={dispatch} link={link} error={sendError} stageMode={stageMode} muted={muted} />}
      />
    );
  } else {
    const frames = story.get(run.scene).frames;
    const shareFrames = frames.filter((f) => f.beat?.t === 'share' && !f.beat.label);
    const v = beatView(frame, {
      scenario: story.scenario, stage: sc.stage, affinity: run.affinity, typed, stageMode,
      share: { index: shareFrames.indexOf(frame) + 1, of: shareFrames.length, startedAt: shareAt },
    });
    const fx = frame.beat && 'fx' in frame.beat ? frame.beat.fx : undefined;
    screen = (
      <StageScreen
        frame={frame}
        band={wantsBand(frame.beat)}
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
      data-fs={fs.on ? '' : undefined}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('.app-help, button')) return;
        if (titleRef.current) leaveTitle(); else advance();
      }}
    >
      {screen}
      {!fs.on && <FullscreenButton onClick={fs.toggle} />}
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
        <dt>T / P</dt><dd>타이머 처음부터 / 멈춤·계속 (자동 진행 링도 P로 멈춰요)</dd>
        <dt>S</dt><dd>무대 모드 {stageMode ? '켜짐' : '꺼짐'} (여주·나레이터 대사 숨김)</dd>
        <dt>M / F · Esc</dt><dd>소리 {muted ? '꺼짐' : '켜짐'} / 전체 화면 켜기 · 나가기</dd>
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
