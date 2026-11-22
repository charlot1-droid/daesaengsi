/** 자리채움 표시 '[대본]'은 무대·휴대폰에서 지우고 보여 줘요 (/script 미리보기에서는 따로 표시) */
export const txt = (s: string | undefined) => (s ?? '').replace(/\[대본\]\s*/g, '');
export const isPlaceholder = (s: string | undefined) => !!s && s.includes('[대본]');
