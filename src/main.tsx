import { createRoot } from 'react-dom/client';
import { Host } from './routes/Host';
import { Player } from './routes/Player';
import { Script } from './routes/Script';
import './styles/tokens.css';
import './styles/ds.css';
import './styles/app.css';

/** 주소 하나에 화면 셋: /host 무대, /script 대본 미리보기, 나머지는 관객 휴대폰 */
const path = location.pathname.replace(/\/+$/, '');
const Page = path === '/host' ? Host : path === '/script' ? Script : Player;

createRoot(document.getElementById('root')!).render(<Page />);
