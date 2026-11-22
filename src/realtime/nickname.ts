/** 닉네임 규칙. 서버(SQL)에도 같은 길이 제한이 있어요. 금칙어는 행사 전에 채워요. */
export const NICK_MAX = 10;

// TODO(행사 전): 금칙어 목록 채우기. 부분 일치로 막아요.
const BLOCKED: string[] = ['시발', '씨발', 'ㅅㅂ', '병신', 'ㅂㅅ', '존나', '섹스', '느금'];

export function cleanNick(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, NICK_MAX);
}

export function nickProblem(nick: string): string | null {
  if (!nick) return '이름을 적어 주세요.';
  if (nick.length > NICK_MAX) return `이름은 ${NICK_MAX}자까지예요.`;
  const flat = nick.replace(/[\s._\-~!@#$%^&*]/g, '').toLowerCase();
  if (BLOCKED.some((w) => flat.includes(w))) return '다른 이름을 써 주세요.';
  return null;
}

export const isPin = (p: string) => /^\d{6}$/.test(p);
