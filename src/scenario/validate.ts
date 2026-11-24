/** 대본 검사: 장면 연결, 글자 수, 이미지 사용처. `npm run check`, `npm run art`에서 써요. */
import { ART, type ArtId } from '../art/manifest';
import type { Beat, Scenario } from './schema';

export interface Report {
  errors: string[];
  warnings: string[];
  placeholders: number;
  /** 이미지 → 쓰이는 장면 id들 */
  artUse: Map<ArtId, Set<string>>;
}

const LINE_MAX = 28;
const visible = (s: string) => s.replace(/\([^)]*\)/g, '').replace(/\[대본\]\s*/g, '').trim();

export function validate(sc: Scenario): Report {
  const errors: string[] = [];
  const warnings: string[] = [];
  const artUse = new Map<ArtId, Set<string>>();
  let placeholders = 0;

  const use = (id: ArtId, where: string) => {
    if (!(id in ART)) errors.push(`${where}: 이미지 목록에 없는 이름 '${id}'`);
    if (!artUse.has(id)) artUse.set(id, new Set());
    artUse.get(id)!.add(where);
  };
  const ph = (s: string | undefined) => {
    if (s && s.includes('[대본]')) placeholders++;
  };

  const ids = new Set<string>();
  for (const s of sc.scenes) {
    if (ids.has(s.id)) errors.push(`장면 id가 겹쳐요: ${s.id}`);
    ids.add(s.id);
  }
  if (!ids.has(sc.start)) errors.push(`시작 장면이 없어요: ${sc.start}`);

  const checkBeats = (beats: Beat[], where: string) => {
    beats.forEach((b, i) => {
      const at = `${where} #${i + 1}`;
      switch (b.t) {
        case 'say': {
          ph(b.text);
          if (!sc.cast[b.who]) errors.push(`${at}: cast에 없는 화자 '${b.who}'`);
          const lines = b.text.split('\n');
          if (lines.length > 2) warnings.push(`${at}: 대사가 ${lines.length}줄이에요 (1~2줄 권장) — 비트를 나눠 주세요`);
          lines.forEach((l) => {
            const n = visible(l).length;
            if (n > LINE_MAX) warnings.push(`${at}: 한 줄 ${n}자 (${LINE_MAX}자 이하 권장) “${l.slice(0, 20)}…”`);
          });
          break;
        }
        case 'notice': ph(b.text); ph(b.sub); break;
        case 'notify': ph(b.text); break;
        case 'phone': b.msgs.forEach((m) => { ph(m.text); ph(m.name); }); ph(b.title); break;
        case 'prop': use(b.art, where); ph(b.text); break;
        case 'splash': ph(b.title); ph(b.sub); break;
        case 'bg': use(b.art, where); break;
        case 'share': ph(b.q); ph(b.hint); ph(b.label); b.items?.forEach((it) => { ph(it.q); ph(it.hint); }); break;
        case 'screen': ph(b.text); ph(b.sub); break;
        case 'sprite': break;
      }
      if ((b.t === 'say' && b.who === 'saebom' && b.face) || (b.t === 'sprite' && b.who === 'saebom' && b.face)) {
        use(`sp-saebom-${b.face}` as ArtId, where);
      } else if ((b.t === 'say' && b.who === 'namju' && b.face) || (b.t === 'sprite' && b.face)) {
        const outfit = b.t === 'sprite' ? b.outfit ?? 'a' : 'a';
        const id = `sp-namju-${outfit}-${b.face}` as ArtId;
        if (id in ART) use(id, where);
      }
    });
  };

  for (const s of sc.scenes) {
    use(s.bg, s.id);
    checkBeats(s.beats, s.id);
    ph(s.stage?.name);
    if (s.choice) {
      ph(s.choice.q);
      if (s.choice.options.length !== 3) errors.push(`${s.id}: 선택지는 3개여야 해요`);
      s.choice.options.forEach((o, i) => {
        const at = `${s.id} 선택지 ${i + 1}`;
        ph(o.label); ph(o.verdict);
        const target = o.go ?? s.next;
        if (!o.bad && !target) errors.push(`${at}: 갈 곳(go 또는 next)이 없어요`);
        if (o.go && !ids.has(o.go)) errors.push(`${at}: 없는 장면으로 가요 '${o.go}'`);
        if (visible(o.label).length > 30) warnings.push(`${at}: 문장이 길어요 (${visible(o.label).length}자)`);
        if (o.bad) {
          use(o.bad.react, `${s.id} 배드${i + 1}`);
          ph(o.bad.title);
          checkBeats(o.bad.beats ?? [], `${s.id} 배드${i + 1}`);
        }
      });
      if (s.choice.options.every((o) => o.bad)) errors.push(`${s.id}: 모든 답이 배드 엔딩이에요`);
    } else if (!s.next && !s.end) {
      errors.push(`${s.id}: 선택지·next·end 중 하나가 필요해요`);
    }
    if (s.next && !ids.has(s.next)) errors.push(`${s.id}: next가 없는 장면이에요 '${s.next}'`);
  }

  // 시작에서 닿지 않는 장면
  const seen = new Set<string>();
  const walk = (id: string) => {
    if (seen.has(id) || !ids.has(id)) return;
    seen.add(id);
    const s = sc.scenes.find((x) => x.id === id)!;
    if (s.next) walk(s.next);
    s.choice?.options.forEach((o) => o.go && walk(o.go));
  };
  walk(sc.start);
  for (const id of ids) if (!seen.has(id)) warnings.push(`${id}: 시작 장면에서 닿지 않아요`);

  return { errors, warnings, placeholders, artUse };
}
