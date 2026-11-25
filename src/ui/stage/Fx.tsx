/** 판 뒤 그림 층: 스탠딩(남주·새봄), 전단지 폭격 */
import type { CSSProperties } from 'react';
import { artSrc, saebomSpriteId, spriteId, type ArtId } from '../../art/manifest';
import type { Face, Outfit, SaebomFace } from '../../scenario/schema';
import { Missing } from './bits';

function Stand({ id, alt, at, who }: { id: ArtId | null; alt: string; at: 'center' | 'left' | 'right'; who: 'namju' | 'saebom' }) {
  if (!id) return null;
  const src = artSrc(id);
  return (
    <div className="app-sprite" data-at={at} data-who={who}>
      {src ? <img key={id} src={src} alt={alt} draggable={false} /> : <Missing id={id} variant="box" />}
    </div>
  );
}

/** 혼자면 가운데, 둘이면 새봄 왼쪽 · 남주 오른쪽 */
export function Sprites({ namju, saebom }: { namju: { face: Face; outfit: Outfit } | null; saebom?: SaebomFace | null }) {
  const both = !!namju && !!saebom;
  return (
    <>
      {saebom && <Stand id={saebomSpriteId(saebom)} alt={`새봄 (${saebom})`} at={both ? 'left' : 'center'} who="saebom" />}
      {namju && <Stand id={spriteId(namju.face, namju.outfit)} alt={`김남주 (${namju.face})`} at={both ? 'right' : 'center'} who="namju" />}
    </>
  );
}

// TODO(대본): 동아리 이름 확정
const CLUBS = ['밴드부', '댄스부', '사진부', '봉사단', '테니스부', '연극부', '코딩 동아리', '독서 모임', '등산부', '요리 동아리'];

/** 낱장 전단지가 하나씩 팔랑팔랑 떨어져요 (종이는 HTML로 그려요 — 묶음 그림 pr-flyers는 안 써요) */
const PAPER = ['#ffe3ec', '#e3efff', '#fff3c9', '#e4f6e9', '#efe4ff', '#ffe9d9'];
const INK = ['#bd4069', '#3f6fb5', '#b07a12', '#2f8a55', '#7a4fc0', '#c2652b'];

export function Flyers() {
  const sheets = Array.from({ length: 22 }, (_, i) => {
    const r = (k: number) => ((Math.sin((i + 1) * 12.9898 * k) * 43758.5453) % 1 + 1) % 1; // 고정된 난수
    return {
      name: CLUBS[i % CLUBS.length],
      c: i % PAPER.length,
      left: 4 + r(1) * 84,
      delay: i * 0.14 + r(2) * 0.25,
      dur: 3.1 + r(3) * 1.4,
      drift: (r(4) - 0.5) * 360,
      spin: (r(5) - 0.5) * 220,
      flip: 1.5 + r(6) * 2.5,
      size: 200 + r(7) * 70,
    };
  });
  return (
    <div className="app-flyers" aria-hidden="true">
      {sheets.map((f, i) => (
        <div
          key={i}
          className="app-flyer"
          style={{
            left: `${f.left}%`,
            width: `calc(${f.size} * var(--u))`,
            animationDuration: `${f.dur}s, ${f.dur / f.flip}s`,
            animationDelay: `${f.delay}s, ${f.delay}s`,
            '--drift': `calc(${f.drift} * var(--u))`,
            '--spin': `${f.spin}deg`,
            '--paper': PAPER[f.c],
            '--ink': INK[f.c],
          } as CSSProperties}
        >
          <div className="app-flyer__sheet">
            <i className="app-flyer__band" />
            <b>{f.name}</b>
            <span>신입 부원 모집</span>
            <i className="app-flyer__line" />
            <i className="app-flyer__line" data-short="" />
          </div>
        </div>
      ))}
    </div>
  );
}
