import { ART } from '../src/art/manifest';
import { scenario } from '../src/scenario/daesaengsi';
import { validate } from '../src/scenario/validate';

const r = validate(scenario);
const needed = [...r.artUse.keys()].filter((id) => ART[id].status === 'needed');

for (const e of r.errors) console.log(`✗ ${e}`);
for (const w of r.warnings) console.log(`△ ${w}`);
console.log(`\n장면 ${scenario.scenes.length}개 · 오류 ${r.errors.length} · 경고 ${r.warnings.length}`);
console.log(`자리채움 문장 [대본] ${r.placeholders}개 남음`);
console.log(`필요한 이미지 ${needed.length}장 (npm run art 로 목록 보기)`);
process.exit(r.errors.length ? 1 : 0);
