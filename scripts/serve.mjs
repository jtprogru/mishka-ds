/* Статический сервер под витрину: `npm run demo` → http://localhost:4321/demo/.
   Нужен потому, что шрифты и @import по file:// браузер отдаёт не всегда.

   По умолчанию следит за исходниками и пересобирает пакет при изменении, а
   открытая вкладка перезагружается сама. Отключается флагом --no-watch. */

import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { createReadStream, statSync, watch } from 'node:fs';
import { dirname, extname, join, normalize, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT ?? 4321);
const watching = !process.argv.includes('--no-watch');

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
};

/* ── live reload ─────────────────────────────────────────────────────────────
   Клиент висит на SSE и перезагружает страницу, когда сборка закончилась. */

const clients = new Set();
const notify = (event) => {
  for (const res of clients) res.write(`event: ${event}\ndata: {}\n\n`);
};

const RELOAD_CLIENT = `<script>
(() => {
  const es = new EventSource('/__reload');
  es.addEventListener('reload', () => location.reload());
  es.addEventListener('failed', () => console.warn('[demo] сборка упала — смотри терминал'));
})();
</script>`;

/* ── watcher ─────────────────────────────────────────────────────────────────
   Сборка пишет обратно в наблюдаемые каталоги: themes-scoped.css и compat.css в
   src/styles, demo.js в demo, tokens.json в tokens. Без этого списка watcher
   ловит собственный вывод и уходит в вечный цикл пересборки. */

const WATCHED = ['src', 'demo', 'brand', 'tokens', 'scripts'];
const GENERATED = new Set(
  [
    'src/styles/themes-scoped.css',
    'src/styles/compat.css',
    'src/components/markGeometry.ts',
    'demo/demo.js',
    'tokens/tokens.json',
    'brand/mark.svg',
    'brand/logo.svg',
    'brand/mascot.svg',
    'brand/card.html',
  ].map((p) => p.split('/').join(sep)),
);

let building = false;
let queued = false;

const rebuild = () => {
  if (building) {
    queued = true; // правки во время сборки не теряются, а сливаются в следующий прогон
    return;
  }
  building = true;
  const started = Date.now();
  const child = spawn(process.execPath, ['scripts/build.mjs'], { cwd: root, stdio: 'inherit' });
  child.on('close', (code) => {
    building = false;
    if (code === 0) {
      console.log(`пересобрано за ${((Date.now() - started) / 1000).toFixed(1)}с — перезагружаю вкладку`);
      notify('reload');
    } else {
      console.error(`сборка упала (код ${code}) — вкладка осталась на прошлой версии`);
      notify('failed');
    }
    if (queued) {
      queued = false;
      rebuild();
    }
  });
};

let debounce = null;
const onChange = (dir) => (_event, filename) => {
  if (!filename) return;
  const rel = join(dir, filename.toString());
  if (GENERATED.has(rel)) return;
  if (!/\.(ts|tsx|css|mjs|json|svg|html)$/.test(rel)) return;
  clearTimeout(debounce);
  debounce = setTimeout(() => {
    console.log(`изменилось: ${rel}`);
    rebuild();
  }, 120);
};

if (watching) {
  for (const dir of WATCHED) {
    try {
      watch(resolve(root, dir), { recursive: true }, onChange(dir));
    } catch (err) {
      console.warn(`не слежу за ${dir}/: ${err.message}`);
    }
  }
}

/* ── сервер ──────────────────────────────────────────────────────────────── */

createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');

  if (watching && url.pathname === '/__reload') {
    res.writeHead(200, {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      connection: 'keep-alive',
    });
    res.write('retry: 1000\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  let path = join(root, normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, ''));
  try {
    if (statSync(path).isDirectory()) path = join(path, 'index.html');
    const type = types[extname(path)] ?? 'application/octet-stream';

    /* В HTML дописывается клиент перезагрузки. Остальное отдаётся потоком. */
    if (watching && extname(path) === '.html') {
      let html = '';
      const stream = createReadStream(path, 'utf8');
      stream.on('data', (chunk) => (html += chunk));
      stream.on('end', () => {
        const body = html.includes('</body>')
          ? html.replace('</body>', `${RELOAD_CLIENT}\n</body>`)
          : html + RELOAD_CLIENT;
        res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' });
        res.end(body);
      });
      stream.on('error', () => {
        res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
        res.end('404');
      });
      return;
    }

    res.writeHead(200, { 'content-type': type, 'cache-control': watching ? 'no-store' : 'default' });
    createReadStream(path).pipe(res);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('404');
  }
}).listen(port, () => {
  console.log(`витрина: http://localhost:${port}/demo/`);
  if (watching) {
    console.log(`слежу за ${WATCHED.map((d) => d + '/').join(', ')} — правь исходники, вкладка обновится сама`);
  }
});
