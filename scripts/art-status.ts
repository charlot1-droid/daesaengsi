/** 이미지 제작 현황 → 콘솔 + docs/ART-STATUS.md */
import { writeFileSync } from 'node:fs';
import { ART, type ArtId } from '../src/art/manifest';
import { scenario } from '../src/scenario/daesaengsi';
import { validate } from '../src/scenario/validate';

const { artUse } = validate(scenario);
const ids = Object.keys(ART) as ArtId[];
const kinds: Record<string, string> = { kv: '키 비주얼', bg: '배경', sprite: '스탠딩', cg: 'CG', reaction: '리액션', prop: '소품', face: '얼굴 컷', ref: '기준' };

const rows = ids.map((id) => {
  const a = ART[id];
  const where = [...(artUse.get(id) ?? [])].join(', ') || '—';
  return { id, a, where };
});
const need = rows.filter((r) => r.a.status === 'needed');

let md = `# 이미지 제작 현황\n\n> \`npm run art\`가 만드는 파일이에요. 손으로 고치지 말고 \`src/art/manifest.ts\`를 고쳐요.\n\n`;
md += `필요 **${need.length}장** · 완료 ${rows.length - need.length}장\n\n`;
md += `## 필요 (ChatGPT로 생성 → docs/prompts.md 템플릿)\n\n| 파일 | 종류 | 무엇 | 쓰는 장면 | 없을 때 |\n| --- | --- | --- | --- | --- |\n`;
for (const r of need) md += `| \`${r.id}\` | ${kinds[r.a.kind]} | ${r.a.note} | ${r.where} | ${r.a.fallback ? `\`${r.a.fallback}\`로 대신` : '자리 표시'} |\n`;
md += `\n## 완료\n\n| 파일 | 종류 | 무엇 |\n| --- | --- | --- |\n`;
for (const r of rows.filter((r) => r.a.status === 'ready')) md += `| \`${r.id}\` | ${kinds[r.a.kind]} | ${r.a.note} |\n`;

writeFileSync(new URL('../docs/ART-STATUS.md', import.meta.url), md);
console.log(`필요 ${need.length}장\n` + need.map((r) => `  · ${r.id.padEnd(22)} ${r.a.note}`).join('\n'));
console.log('\n→ docs/ART-STATUS.md 갱신');
