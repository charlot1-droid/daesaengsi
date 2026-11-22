import type { CastMember } from '../../scenario/schema';
import { txt, withDirections } from './bits';

/** 대사창 (화면 위). 이름 탭: 남주 채움 / 여주 테두리 / 나레이터 없음 */
export function DialogueBox({ cast, text, typed, typing = true }: { cast: CastMember; text: string; typed?: boolean; typing?: boolean }) {
  const who = cast.tab;
  return (
    <div className={`ds-panel ds-line${typing ? ' app-type' : ''}`} data-who={who} data-done={typed ? '' : undefined}>
      {who !== 'narrator' && (
        <p className="ds-line__tab">
          {cast.name} {cast.sub && <small>{cast.sub}</small>}
        </p>
      )}
      <p className="ds-line__text">{withDirections(txt(text))}</p>
      <span className="ds-line__next" aria-hidden="true" />
    </div>
  );
}
