import type { CastMember } from '../../scenario/schema';
import { txt, withDirections } from './bits';

/** 대사창 (화면 위). 이름 탭: 남주 채움 / 여주 테두리 / 나레이터 없음 */
/** 대사창은 줄이 바뀌어도 그대로 두고 글자만 새로 나타나요 (창 전체를 다시 그리면 깜빡여 보여서) */
export function DialogueBox({ cast, text, typed, typing = true, lineKey }: { cast: CastMember; text: string; typed?: boolean; typing?: boolean; lineKey?: string }) {
  const who = cast.tab;
  return (
    <div className={`ds-panel ds-line${typing ? ' app-type' : ''}`} data-who={who} data-done={typed ? '' : undefined}>
      {who === 'narrator' ? (
        <p className="ds-line__tab" aria-label="나레이션">나레이션</p>
      ) : (
        <p className="ds-line__tab">
          {cast.name} {cast.sub && <small>{cast.sub}</small>}
        </p>
      )}
      <p className="ds-line__text" key={lineKey}>{withDirections(txt(text))}</p>
      <span className="ds-line__next" aria-hidden="true" />
    </div>
  );
}
