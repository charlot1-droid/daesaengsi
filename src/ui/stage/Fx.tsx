/** 판 뒤 그림 층: 남주 스탠딩, 전단지 폭격 */
import type { CSSProperties } from 'react';
import { artSrc, spriteId } from '../../art/manifest';
import type { Face, Outfit } from '../../scenario/schema';
import { Missing } from './bits';

export function Sprite({ face, outfit }: { face: Face; outfit: Outfit }) {
  const id = spriteId(face, outfit);
  if (!id) return null;
  const src = artSrc(id);
  return (
    <div className="app-sprite" key={id}>
      {src ? <img src={src} alt={`김남주 (${face})`} draggable={false} /> : <Missing id={id} variant="box" />}
    </div>
  );
}

// TODO(대본): 동아리 이름 확정
const CLUBS = ['밴드부', '댄스부', '사진부', '봉사단', '테니스부', '연극부', '코딩 동아리', '독서 모임', '등산부', '요리 동아리'];

export function Flyers() {
  const src = artSrc('pr-flyers');
  return (
    <div className="app-flyers" aria-hidden="true">
      {CLUBS.map((name, i) => (
        <div
          key={name}
          className="app-flyer"
          data-art={src ? '' : undefined}
          style={{
            left: `${6 + ((i * 37) % 88)}%`,
            animationDelay: `${(i % 5) * 0.18 + Math.floor(i / 5) * 0.5}s`,
            '--spin': `${(i % 2 ? 1 : -1) * (12 + (i * 7) % 24)}deg`,
            backgroundImage: src ? `url(${src})` : undefined,
          } as CSSProperties}
        >
          {name}
        </div>
      ))}
    </div>
  );
}
