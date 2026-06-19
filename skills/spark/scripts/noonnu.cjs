#!/usr/bin/env node
/**
 * noonnu.cjs — 눈누(noonnu.cc) 상업용 무료 한글 폰트 CLI (헤드리스 Playwright + 로컬 캐시)
 *
 * 하이브리드 전략:
 *  - build-cache 로 전체 카탈로그(목록 + 상세 허용범위/전체굵기 웹폰트CSS)를
 *    data/noonnu-fonts.json 에 저장해 깃에 올려둔다.
 *  - 평소 조회(search/category/list/info/webfont)는 캐시에서 즉시 처리(빠르고 안정, 네트워크 불필요).
 *  - 캐시가 없거나 --live 면 라이브로 폴백. --refresh 는 캐시 재생성.
 *  - sample(렌더)은 캐시의 웹폰트 CSS를 써서 playwright로 PNG를 만든다(라이브 데이터 불필요).
 *
 * 모든 네트워크는 Playwright의 APIRequestContext(ignoreHTTPSErrors)로 처리해
 * 인증서 가로채기 환경에서도 동작한다.
 *
 * 사용:
 *   node noonnu.cjs build-cache [--max N] [--concurrency 6]   # 카탈로그 크롤 → data/noonnu-fonts.json
 *   node noonnu.cjs search <쿼리>   [--limit N] [--json] [--live]
 *   node noonnu.cjs category <고딕|명조|손글씨|장식|픽셀> [--limit N] [--json] [--live]
 *   node noonnu.cjs list           [--page N] [--limit N] [--json] [--live]
 *   node noonnu.cjs info <id|이름>  [--json] [--live]
 *   node noonnu.cjs webfont <id|이름> [--json] [--live]
 *   node noonnu.cjs sample <id|이름> [--text "문구"] [--out f.png]
 *                         [--size 64] [--weight 400] [--width 1200] [--bg "#fff"] [--fg "#111"] [--live]
 *
 * 폰트 식별: 숫자=폰트 id, 그 외=이름(부분일치/검색 첫 결과).
 * 의존: playwright(헤드리스 크로미움). 미설치 시: npx playwright install chromium
 */
'use strict';

const fs = require('fs');
const path = require('path');

function loadPlaywright() {
  const tries = ['playwright', 'playwright-core', '/opt/node22/lib/node_modules/playwright'];
  for (const t of tries) { try { return require(t); } catch (_) {} }
  console.error(
    'ERROR: playwright를 찾을 수 없습니다.\n' +
    '  설치: npm i -g playwright && npx playwright install chromium\n' +
    '  (조회는 캐시가 있으면 playwright 없이도 동작하지만, build-cache/sample/--live 는 필요)');
  process.exit(3);
}

const BASE = 'https://noonnu.cc';
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';
const CACHE_PATH = path.join(__dirname, '..', 'data', 'noonnu-fonts.json');

// ---- 인자 파싱 ----
function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) out[key] = true;
      else { out[key] = next; i++; }
    } else out._.push(a);
  }
  return out;
}

// ---- 캐시 ----
function loadCache() {
  try {
    const j = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
    if (j && Array.isArray(j.fonts) && j.fonts.length) return j;
  } catch (_) {}
  return null;
}
function useCache(args) { return args.live ? null : loadCache(); }

// ---- Playwright 컨텍스트 ----
let _chromium = null;
function chromiumLazy() { if (!_chromium) _chromium = loadPlaywright().chromium; return _chromium; }
async function withCtx(fn) {
  const browser = await chromiumLazy().launch({ args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true, userAgent: UA, viewport: { width: 1280, height: 800 } });
  try { return await fn(ctx); }
  finally { await browser.close(); }
}
async function getJson(ctx, p) {
  const r = await ctx.request.get(BASE + p, { headers: { Accept: 'application/json' }, timeout: 40000 });
  if (!r.ok()) throw new Error(`HTTP ${r.status()} for ${p}`);
  const ct = r.headers()['content-type'] || '';
  if (!ct.includes('json')) throw new Error(`expected JSON, got ${ct} for ${p}`);
  return r.json();
}

// ---- 정규화 ----
function normFont(f) {
  const css = (f.cdn_server_html || '').trim();
  return {
    id: f.id,
    name: f.name || f.name_ko || f.name_en,
    name_en: f.name_en,
    creator: f.creator_description || null,
    preview_text: f.ph_content || null,
    weights: f.font_variants_count || null,
    weights_explain: f.font_variants_count_explain || null,
    is_market: !!f.is_market,
    webfont_supported: css.length > 0,
    font_family: (f.default_variant && f.default_variant.font_family_token) || familyFromCss(css),
    webfont_css: css || null,
    url: BASE + (f.polymorphic_show_path || `/font_page/${f.id}`),
  };
}
function familyFromCss(css) {
  if (!css) return null;
  const m = css.match(/font-family:\s*['"]([^'"]+)['"]/);
  return m ? m[1] : null;
}

// ---- 라이브 조회 ----
async function searchLive(ctx, query, limit) {
  const j = await getJson(ctx, `/search/${encodeURIComponent(query)}.json?locale=ko`);
  const arr = (j.fonts || []).map(normFont);
  return { total: j.total_count != null ? j.total_count : arr.length, fonts: limit ? arr.slice(0, limit) : arr };
}
async function listLive(ctx, page, limit) {
  const j = await getJson(ctx, `/index.json?locale=ko&page=${page || 1}`);
  const arr = (j.fonts || []).map(normFont);
  return { total: j.total_count != null ? j.total_count : arr.length, page: page || 1, fonts: limit ? arr.slice(0, limit) : arr };
}
// 상세 HTML 파싱: 형태/굵기/라이선스/허용범위표/전체굵기 웹폰트 CSS/제작자
async function fetchDetail(ctx, id) {
  const page = await ctx.newPage();
  try {
    // networkidle은 눈누 광고 때문에 불안정 → 본문 콘텐츠(형태/라이선스)가 뜰 때까지 명시 대기
    await page.goto(`${BASE}/font_page/${id}`, { waitUntil: 'domcontentloaded', timeout: 40000 });
    await page.waitForFunction(
      () => { const t = document.body.innerText; return /형태/.test(t) && /라이선스/.test(t); },
      { timeout: 9000 }).catch(() => {});
    return await page.evaluate(() => {
      const lines = document.body.innerText.split('\n').map((l) => l.trim());
      const after = (label) => {
        let i = lines.findIndex((l) => l === label);
        if (i < 0) i = lines.findIndex((l) => l.startsWith(label));
        return i >= 0 && lines[i + 1] ? lines[i + 1] : null;
      };
      const licenseName = (() => {
        const direct = after('라이선스 본문') || after('라이선스');
        if (direct && !/요약|전문|본문|^라이선스$/.test(direct)) return direct;
        const cand = lines.find((l) =>
          /(오픈\s*폰트\s*라이[선센]스|OFL|SIL|공공누리|자유\s*이용|MIT|CC\s*BY|아파치|Apache)/.test(l) &&
          !/요약|전문|^라이선스/.test(l));
        const raw = cand || direct || null;
        return raw ? raw.split('\t')[0].trim() : null; // 탭 뒤 설명 제거, 라이선스명만
      })();
      const blocks = [...document.querySelectorAll('textarea, pre, code')]
        .map((e) => (e.value || e.innerText || '').trim())
        .filter((t) => /@font-face|@import|font-family/.test(t));
      blocks.sort((a, b) => b.length - a.length);
      const usage = [];
      document.querySelectorAll('table tr').forEach((tr) => {
        const cells = [...tr.querySelectorAll('td, th')].map((c) => c.innerText.trim());
        if (cells.length >= 2 && /사용|가능|불가|조건/.test(cells[cells.length - 1])) {
          usage.push({ category: cells[0], allowed: cells[cells.length - 1], note: cells.length > 2 ? cells[1] : null });
        }
      });
      const thumb = [...document.images].map((i) => i.src)
        .find((s) => /cdn\.noonnu\.cc\/(fonts\/thumbnails|\d{6})\//.test(s)) || null;
      return {
        name: (document.querySelector('h1, h2') || {}).innerText || null,
        creator: after('제작자') || after('디자이너') || null,
        shape: after('형태'),
        weight_group: after('굵기'),
        license: licenseName,
        webfont_css_full: blocks[0] || null,
        usage, thumbnail: thumb,
      };
    });
  } finally { await page.close(); }
}

// ---- 캐시 기반 조회 헬퍼 ----
function cacheSearch(cache, q, limit) {
  const s = q.toLowerCase();
  const hits = cache.fonts.filter((f) =>
    [f.name, f.name_en, f.creator].filter(Boolean).some((x) => x.toLowerCase().includes(s)));
  return { total: hits.length, fonts: limit ? hits.slice(0, limit) : hits };
}
// 카테고리어 → 눈누 형태(shape) 값 동의어 매핑 (눈누는 명조를 '바탕'으로 분류)
const SHAPE_SYNONYM = {
  고딕: '고딕', 돋움: '고딕', 산세리프: '고딕',
  명조: '바탕', 바탕: '바탕', 세리프: '바탕',
  손글씨: '손글씨', 필기: '손글씨', 캘리: '손글씨',
  장식: '장식', 장식체: '장식', 디스플레이: '장식',
  픽셀: '픽셀', 픽셀체: '픽셀',
};
function cacheCategory(cache, c, limit) {
  const target = SHAPE_SYNONYM[c] || c;
  const exact = cache.fonts.filter((f) => f.shape && f.shape.includes(target));
  const hits = exact.length ? exact : cache.fonts.filter((f) => (f.name || '').includes(c));
  return { total: hits.length, fonts: limit ? hits.slice(0, limit) : hits, matched_by: exact.length ? 'shape' : 'name' };
}
function cacheFind(cache, key) {
  if (/^\d+$/.test(String(key))) return cache.fonts.find((f) => f.id === Number(key)) || null;
  const s = String(key).toLowerCase();
  return cache.fonts.find((f) => (f.name || '').toLowerCase() === s)
    || cache.fonts.find((f) => [f.name, f.name_en].filter(Boolean).some((x) => x.toLowerCase().includes(s))) || null;
}

// ---- 공통 출력 ----
function printFontLine(f) {
  const wf = f.webfont_supported === false ? '웹폰트✗' : '웹폰트✓';
  const w = f.weights ? `${f.weights}굵기` : (f.weights_explain || '');
  console.log(`#${f.id}  ${f.name}${f.name_en && f.name_en !== f.name ? ' (' + f.name_en + ')' : ''}`);
  console.log(`     ${[f.creator, f.shape, w, wf].filter(Boolean).join(' · ')}`);
  if (f.preview_text) console.log(`     "${f.preview_text}"`);
  console.log(`     ${f.url}`);
}

// ---- 커맨드: build-cache ----
async function mapPool(items, n, fn, onTick) {
  const ret = new Array(items.length); let i = 0; let done = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      try { ret[idx] = await fn(items[idx], idx); } catch (e) { ret[idx] = { __error: e.message }; }
      done++; if (onTick) onTick(done, items.length);
    }
  }
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, worker));
  return ret;
}
async function cmdBuildCache(args) {
  const max = args.max ? Number(args.max) : Infinity;
  const conc = args.concurrency ? Number(args.concurrency) : 5;
  await withCtx(async (ctx) => {
    console.error('1/2 목록 수집 중...');
    const first = await listLive(ctx, 1);
    const total = first.total;
    const pages = Math.ceil(total / 24);
    let base = first.fonts.slice();
    for (let p = 2; p <= pages; p++) {
      const r = await listLive(ctx, p);
      base = base.concat(r.fonts);
      if (p % 10 === 0) console.error(`  목록 ${base.length}/${total}`);
      if (base.length >= max) break;
    }
    if (base.length > max) base = base.slice(0, max);
    console.error(`목록 ${base.length}개 수집 완료. 2/2 상세 크롤(동시 ${conc})...`);
    const details = await mapPool(base, conc, async (f) => {
      let d = await fetchDetail(ctx, f.id);
      if (!d.shape && !d.usage.length) d = await fetchDetail(ctx, f.id); // 타이밍 실패 시 1회 재시도
      // 전체 굵기 CSS가 있으면 채택하고, font_family도 같은 소스에서 뽑아 일치시킨다
      const fullCss = (d.webfont_css_full && d.webfont_css_full.length > (f.webfont_css || '').length) ? d.webfont_css_full : f.webfont_css;
      return {
        ...f,
        name: f.name || d.name,
        creator: f.creator || d.creator,
        shape: d.shape || null,
        license: d.license || null,
        usage: d.usage || [],
        thumbnail: d.thumbnail || null,
        webfont_css: fullCss,
        webfont_supported: !!fullCss,
        font_family: familyFromCss(fullCss) || f.font_family,
      };
    }, (done, n) => { if (done % 50 === 0 || done === n) console.error(`  상세 ${done}/${n}`); });
    const errs = details.filter((d) => d.__error).length;
    const out = { source: 'noonnu.cc', total_count: total, cached_count: details.length, cached_at: new Date().toISOString(), fonts: details };
    fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
    fs.writeFileSync(CACHE_PATH, JSON.stringify(out));
    const kb = Math.round(fs.statSync(CACHE_PATH).size / 1024);
    console.log(`캐시 저장: ${CACHE_PATH}`);
    console.log(`  ${details.length}개 / 총 ${total}개 · ${kb}KB · 상세 실패 ${errs}개 · ${out.cached_at}`);
  });
}

// ---- 커맨드: 조회들 ----
async function cmdSearch(args) {
  const q = args._[1];
  if (!q) return fail('검색어가 필요합니다: noonnu search <쿼리>');
  const limit = args.limit ? Number(args.limit) : 12;
  const cache = useCache(args);
  let res, source;
  if (cache) { res = cacheSearch(cache, q, limit); source = 'cache'; }
  else { res = await withCtx((ctx) => searchLive(ctx, q, limit)); source = 'live'; }
  if (args.json) return console.log(JSON.stringify({ source, ...res }, null, 2));
  console.log(`'${q}' 검색 [${source}]: 총 ${res.total}개 (상위 ${res.fonts.length})\n`);
  res.fonts.forEach((f) => { printFontLine(f); console.log(); });
}
async function cmdCategory(args) {
  const cat = args._[1];
  if (!cat) return fail('카테고리가 필요합니다 (예: 고딕, 명조, 손글씨, 장식, 픽셀)');
  const limit = args.limit ? Number(args.limit) : 12;
  const cache = useCache(args);
  let res, source;
  if (cache) { res = cacheCategory(cache, cat, limit); source = `cache(${res.matched_by})`; }
  else { res = await withCtx((ctx) => searchLive(ctx, cat, limit)); source = 'live(search)'; }
  if (args.json) return console.log(JSON.stringify({ source, ...res }, null, 2));
  console.log(`카테고리/태그 '${cat}' [${source}]: 총 ${res.total}개 (상위 ${res.fonts.length})\n`);
  res.fonts.forEach((f) => { printFontLine(f); console.log(); });
}
async function cmdList(args) {
  const page = args.page ? Number(args.page) : 1;
  const limit = args.limit ? Number(args.limit) : 24;
  const cache = useCache(args);
  let res, source;
  if (cache) {
    const start = (page - 1) * limit;
    res = { total: cache.fonts.length, page, fonts: cache.fonts.slice(start, start + limit) }; source = 'cache';
  } else { res = await withCtx((ctx) => listLive(ctx, page, limit)); source = 'live'; }
  if (args.json) return console.log(JSON.stringify({ source, ...res }, null, 2));
  console.log(`목록 [${source}] page ${res.page} (총 ${res.total}개)\n`);
  res.fonts.forEach((f) => { printFontLine(f); console.log(); });
}
async function cmdInfo(args) {
  const key = args._[1];
  if (!key) return fail('폰트 id 또는 이름이 필요합니다');
  const cache = useCache(args);
  let m, source;
  if (cache && cacheFind(cache, key)) { m = cacheFind(cache, key); source = 'cache'; }
  else {
    source = 'live';
    m = await withCtx(async (ctx) => {
      const b = /^\d+$/.test(String(key)) ? { id: Number(key), url: `${BASE}/font_page/${key}` } : (await searchLive(ctx, key, 1)).fonts[0];
      if (!b) throw new Error(`'${key}' 결과 없음`);
      const d = await fetchDetail(ctx, b.id);
      return { ...b, name: b.name || d.name, creator: b.creator || d.creator, shape: d.shape, weights_explain: d.weight_group || b.weights_explain,
        license: d.license, usage: d.usage, webfont_supported: !!(d.webfont_css_full || b.webfont_css), font_family: familyFromCss(d.webfont_css_full) || b.font_family };
    });
  }
  if (args.json) return console.log(JSON.stringify({ source, ...m }, null, 2));
  console.log(`#${m.id}  ${m.name}  [${source}]`);
  console.log(`형태: ${m.shape || '-'} | 굵기: ${m.weights_explain || (m.weights ? m.weights + '가지' : '-')}`);
  console.log(`제작자: ${m.creator || '-'}`);
  console.log(`라이선스: ${m.license || '-'}`);
  console.log(`웹폰트: ${m.webfont_supported ? "지원 (font-family: '" + m.font_family + "')" : '미지원'}`);
  if (m.usage && m.usage.length) { console.log('허용 범위:'); m.usage.forEach((u) => console.log(`  - ${u.category}: ${u.allowed}`)); }
  console.log(m.url);
}
async function cmdWebfont(args) {
  const key = args._[1];
  if (!key) return fail('폰트 id 또는 이름이 필요합니다');
  const cache = useCache(args);
  let out, source;
  const hit = cache && cacheFind(cache, key);
  if (hit && hit.webfont_css) {
    out = { id: hit.id, name: hit.name, webfont_supported: true, font_family: hit.font_family, css: hit.webfont_css, url: hit.url }; source = 'cache';
  } else {
    source = 'live';
    out = await withCtx(async (ctx) => {
      const b = /^\d+$/.test(String(key)) ? { id: Number(key), url: `${BASE}/font_page/${key}` } : (await searchLive(ctx, key, 1)).fonts[0];
      if (!b) throw new Error(`'${key}' 결과 없음`);
      const d = await fetchDetail(ctx, b.id);
      const css = (d.webfont_css_full && d.webfont_css_full.length > (b.webfont_css || '').length) ? d.webfont_css_full : b.webfont_css;
      return { id: b.id, name: b.name || d.name, webfont_supported: !!css, font_family: familyFromCss(css) || b.font_family, css: css || null, url: b.url };
    });
  }
  if (args.json) return console.log(JSON.stringify({ source, ...out }, null, 2));
  if (!out.css) { console.log(`#${out.id} ${out.name}: 웹폰트 미지원`); return; }
  console.log(`/* #${out.id} ${out.name} — font-family: '${out.font_family}' [${source}] */`);
  console.log(out.css);
}
async function cmdSample(args) {
  const key = args._[1];
  if (!key) return fail('폰트 id 또는 이름이 필요합니다');
  const text = args.text || '다람쥐 헌 쳇바퀴에 타고파 ABCDqrs 0123';
  const size = Number(args.size || 64), weight = String(args.weight || 400), width = Number(args.width || 1200);
  const bg = args.bg || '#ffffff', fg = args.fg || '#111111';
  const out = args.out || `noonnu-sample-${Date.now()}.png`;
  const cache = useCache(args);
  const hit = cache && cacheFind(cache, key);
  await withCtx(async (ctx) => {
    let css, name, id, family;
    if (hit && hit.webfont_css) { css = hit.webfont_css; name = hit.name; id = hit.id; family = hit.font_family; }
    else {
      const b = /^\d+$/.test(String(key)) ? { id: Number(key) } : (await searchLive(ctx, key, 1)).fonts[0];
      if (!b) return fail(`'${key}' 결과 없음`);
      const d = await fetchDetail(ctx, b.id);
      css = (d.webfont_css_full && d.webfont_css_full.length > (b.webfont_css || '').length) ? d.webfont_css_full : b.webfont_css;
      name = b.name || d.name; id = b.id; family = familyFromCss(css) || b.font_family;
    }
    if (!css) return fail(`#${id} ${name || ''}: 웹폰트 미지원 — 샘플 렌더 불가`);
    const page = await ctx.newPage();
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      ${css}
      html,body{margin:0}
      .card{display:inline-block;background:${bg};color:${fg};padding:48px 56px;
        font-family:'${family}',sans-serif;font-weight:${weight};font-size:${size}px;
        line-height:1.45;max-width:${width}px;word-break:keep-all}
    </style></head><body><div class="card">${escapeHtml(text)}</div></body></html>`;
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(async () => { if (document.fonts && document.fonts.ready) await document.fonts.ready; });
    await page.waitForTimeout(600);
    await (await page.$('.card')).screenshot({ path: out });
    await page.close();
    if (args.json) console.log(JSON.stringify({ id, name, font_family: family, out, text, source: hit ? 'cache' : 'live' }, null, 2));
    else console.log(`샘플 저장: ${out}  (#${id} ${name}, family '${family}', ${hit ? 'cache' : 'live'})`);
  });
}

// 폰트 대조표: 여러 후보를 한 PNG에 같은 문구로 렌더 → 글자 생김새를 보고 셀렉
async function cmdContact(args) {
  const text = args.text || '다람쥐 헌 쳇바퀴에 타고파 GROOVE 0123';
  const size = Number(args.size || 38);
  const limit = args.limit ? Number(args.limit) : 8;
  const out = args.out || `noonnu-contact-${Date.now()}.png`;
  const cache = useCache(args);
  await withCtx(async (ctx) => {
    let fonts = [];
    // 대상 결정: 명시 키(id/이름, 쉼표·공백 구분) > --category > --search
    const keys = args._.slice(1).join(' ').split(/[,\s]+/).map((s) => s.trim()).filter(Boolean);
    const resolveOne = async (k) => {
      let f = cache && cacheFind(cache, k);
      if (f && f.webfont_css) return f;
      const b = /^\d+$/.test(k) ? { id: Number(k) } : (await searchLive(ctx, k, 1)).fonts[0];
      if (!b) return null;
      const d = await fetchDetail(ctx, b.id);
      const css = (d.webfont_css_full && d.webfont_css_full.length > (b.webfont_css || '').length) ? d.webfont_css_full : b.webfont_css;
      return css ? { id: b.id, name: b.name || d.name, shape: d.shape, font_family: familyFromCss(css) || b.font_family, webfont_css: css } : null;
    };
    if (keys.length) { for (const k of keys) { const f = await resolveOne(k); if (f) fonts.push(f); } }
    else if (args.category) {
      const r = cache ? cacheCategory(cache, args.category, limit) : await searchLive(ctx, args.category, limit);
      fonts = r.fonts.filter((f) => f.webfont_css).slice(0, limit);
    } else if (args.search) {
      const r = cache ? cacheSearch(cache, args.search, limit) : await searchLive(ctx, args.search, limit);
      fonts = r.fonts.filter((f) => f.webfont_css).slice(0, limit);
    } else return fail('contact: <id/이름,...> 또는 --category <형태> / --search <쿼리> 가 필요합니다');
    if (!fonts.length) return fail('대상 폰트가 없습니다');

    const page = await ctx.newPage();
    const css = fonts.map((f) => f.webfont_css).join('\n');
    const rows = fonts.map((f) =>
      `<div class="row"><div class="lbl">#${f.id} ${escapeHtml(f.name)}${f.shape ? ' · ' + escapeHtml(f.shape) : ''} · ${escapeHtml(f.font_family)}</div>` +
      `<div class="smp" style="font-family:'${f.font_family}',sans-serif">${escapeHtml(text)}</div></div>`).join('');
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      ${css}
      body{margin:0;background:#fff;color:#111;width:1100px;font-family:system-ui,sans-serif}
      .row{padding:18px 32px;border-bottom:1px solid #eee}
      .lbl{font-size:12px;color:#888;margin-bottom:6px;letter-spacing:.02em}
      .smp{font-size:${size}px;line-height:1.3;word-break:keep-all}
    </style></head><body>${rows}</body></html>`;
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(async () => { if (document.fonts && document.fonts.ready) await document.fonts.ready; });
    await page.waitForTimeout(800);
    await page.screenshot({ path: out, fullPage: true });
    await page.close();
    if (args.json) return console.log(JSON.stringify({ out, count: fonts.length, fonts: fonts.map((f) => ({ id: f.id, name: f.name, font_family: f.font_family, shape: f.shape })) }, null, 2));
    console.log(`대조표 저장: ${out}  (${fonts.length}개) — 이미지를 보고 셀렉하세요`);
    fonts.forEach((f) => console.log(`  #${f.id} ${f.name} (${f.font_family})`));
  });
}

function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function fail(msg) { console.error('ERROR: ' + msg); process.exitCode = 2; }

function usage() {
  const c = loadCache();
  console.log(`noonnu.cjs — 눈누 상업용 무료 한글 폰트 CLI (하이브리드: 캐시 우선 + 라이브 폴백)

  build-cache               전체 카탈로그 크롤 → data/noonnu-fonts.json  [--max N] [--concurrency 6]
  search <쿼리>              폰트/제작자 검색            [--limit N] [--json] [--live]
  category <형태>            카테고리/태그(캐시는 형태 정확매칭)  [--limit N] [--json] [--live]
  list                      목록(페이지네이션)          [--page N] [--limit N] [--json] [--live]
  info <id|이름>            형태·라이선스·허용범위·굵기   [--json] [--live]
  webfont <id|이름>         @font-face CSS + font-family [--json] [--live]
  sample <id|이름>          샘플 PNG 렌더               [--text "문구"] [--out f.png] [--size 64] [--weight 400] [--live]
  contact <id,이름,...>     후보 폰트 대조표 PNG(셀렉용)  [--category 형태 | --search 쿼리] [--limit 8] [--text "문구"] [--out f.png]

  캐시: ${c ? `${c.cached_count}/${c.total_count}개 · ${c.cached_at}` : '없음 (build-cache 로 생성 권장)'}
  --live: 캐시 무시하고 라이브 / --refresh(build-cache 별칭)

예) node noonnu.cjs build-cache
    node noonnu.cjs category 명조 --limit 10
    node noonnu.cjs webfont 프리텐다드 > pretendard.css
    node noonnu.cjs sample 694 --text "GROOVE 회현" --out groove.png`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  let cmd = args._[0];
  if (args.refresh) cmd = 'build-cache';
  try {
    switch (cmd) {
      case 'build-cache': case 'refresh': return await cmdBuildCache(args);
      case 'search': return await cmdSearch(args);
      case 'category': return await cmdCategory(args);
      case 'list': return await cmdList(args);
      case 'info': return await cmdInfo(args);
      case 'webfont': return await cmdWebfont(args);
      case 'sample': return await cmdSample(args);
      case 'contact': return await cmdContact(args);
      case undefined: case 'help': case '--help': case '-h': return usage();
      default: console.error(`알 수 없는 명령: ${cmd}\n`); return usage();
    }
  } catch (e) {
    console.error('ERROR: ' + (e && e.message ? e.message : String(e)));
    process.exitCode = 1;
  }
}
main();
