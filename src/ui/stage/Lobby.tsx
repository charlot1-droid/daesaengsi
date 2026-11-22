import qrcode from 'qrcode-generator';
import { useMemo } from 'react';

function Qr({ text }: { text: string }) {
  const { n, path } = useMemo(() => {
    const qr = qrcode(0, 'M');
    qr.addData(text);
    qr.make();
    const n = qr.getModuleCount();
    let d = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
    return { n, path: d };
  }, [text]);
  return (
    <svg viewBox={`0 0 ${n} ${n}`} shapeRendering="crispEdges" role="img" aria-label="입장 QR 코드">
      <path d={path} fill="#523b37" />
    </svg>
  );
}

interface Props {
  url: { display: string; href: string };
  pin: string;
  players: number;
  names: string[];
  offline: boolean;
  connecting: boolean;
  error?: string;
}

/** 로비: 접속 주소 · 입장 번호 · QR · 들어온 사람 */
export function Lobby(p: Props) {
  if (p.offline) {
    return (
      <div className="ds-panel ds-notice">
        <p className="ds-notice__text">팻말 모드</p>
        <p className="ds-notice__sub">휴대폰 투표 없이 진행해요. 선택지에서 1·2·3 키로 골라요.</p>
      </div>
    );
  }
  return (
    <div className="ds-panel ds-lobby">
      <div>
        <p className="ds-lobby__how">휴대폰으로 <b>{p.url.display}</b>에 들어오거나 QR을 찍으세요.</p>
        <p className="ds-lobby__label">입장 번호</p>
        <p className="ds-lobby__pin num">{p.connecting ? '··· ···' : `${p.pin.slice(0, 3)} ${p.pin.slice(3)}`}</p>
        {p.error && <p className="ds-lobby__label" style={{ color: 'var(--alert)' }}>{p.error}</p>}
      </div>
      <div className="ds-lobby__qr">{!p.connecting && <Qr text={p.url.href} />}</div>
      <div className="ds-lobby__who">
        <span className="ds-lobby__count">{p.players}명 입장</span>
        <span className="ds-lobby__names">{p.names.slice(0, 24).join(' ')}</span>
      </div>
    </div>
  );
}
