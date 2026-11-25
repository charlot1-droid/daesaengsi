/**
 * 첫 화면 (타이틀) · 전체 화면 버튼
 * 타이틀에서 아무 키나 누르거나 클릭하면 QR 로비로 넘어가요.
 */
import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { story } from '../../engine/runner';
import { StageScreen } from './StageScreen';

export function TitleScreen({ style, overlay }: { style?: CSSProperties; overlay?: ReactNode }) {
  const title = story.scenario.title.split(':')[0].trim() || '대생시';
  return (
    <StageScreen
      frame={{ bg: 'kv-title', night: false, sprite: null }}
      style={style}
      overlay={overlay}
      read={
        <div className="app-title">
          <h1 className="app-title__name">{title}</h1>
          <p className="app-title__sub">대학 생활 시뮬레이션</p>
          <p className="app-title__press">PRESS TO START</p>
        </div>
      }
    />
  );
}

/** 전체 화면 상태 + 켜고 끄기. Esc는 브라우저가 알아서 전체 화면을 끝내요. */
export function useFullscreen() {
  const [on, setOn] = useState(() => !!document.fullscreenElement);
  useEffect(() => {
    const sync = () => setOn(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);
  const toggle = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);
  return { on, toggle };
}

/** 창 모드일 때만 보이는 오른쪽 위 버튼 */
export function FullscreenButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="app-fs" onClick={onClick} aria-label="전체 화면 (F)" title="전체 화면 (F) · 나갈 때는 Esc">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>전체 화면</span>
    </button>
  );
}
