// Sinh dist/Code.gs (nhúng lõi) và web/js/core.js từ src/core.js — lõi chạy = lõi đã test.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const root = new URL('..', import.meta.url).pathname;
const pkg = JSON.parse(readFileSync(root + 'package.json', 'utf8'));
const core = readFileSync(root + 'src/core.js', 'utf8');
const gas = readFileSync(root + 'gas/Code.src.gs', 'utf8').replace('//@@CORE@@', core).replace('__APP_VERSION__', pkg.version);
mkdirSync(root + 'dist', { recursive: true }); mkdirSync(root + 'web/js', { recursive: true });
writeFileSync(root + 'dist/Code.gs', gas);
writeFileSync(root + 'web/js/core.js', core);
writeFileSync(root + 'web/js/version.js', `var APP_VERSION = '${pkg.version}';\n`);
for (const f of ['web/sw.js']) {
  const t = readFileSync(root + f, 'utf8').replace(/(tbngoai-v|APP_VERSION = ')[0-9.]+/g, (m, a) => a + pkg.version);
  writeFileSync(root + f, t);
}
console.log('build', pkg.version, 'OK');
