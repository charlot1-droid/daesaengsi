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
