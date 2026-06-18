#!/usr/bin/env node
/**
 * noonnu.cjs — 눈누(noonnu.cc) 상업용 무료 한글 폰트 CLI (헤드리스 Playwright 기반)
 *
 * SPARK 워크플로에서 CHOSEN_FONT를 실제 무료 폰트로 고르고, 그 웹폰트 링크와
 * 샘플 이미지를 바로 가져오기 위한 도구. 모든 네트워크는 Playwright의
 * APIRequestContext(ignoreHTTPSErrors)로 처리해 인증서 가로채기 환경에서도 동작한다.
 *
 * 사용:
 *   node noonnu.cjs search <쿼리> [--limit N] [--json]
 *   node noonnu.cjs list [--page N] [--limit N] [--json]      # 추천순 목록(페이지네이션)
 *   node noonnu.cjs category <고딕|명조|손글씨|장식|픽셀|...> [--limit N] [--json]
 *   node noonnu.cjs info <폰트id | 폰트이름> [--json]          # 형태/라이선스/허용범위/굵기
 *   node noonnu.cjs webfont <폰트id | 폰트이름> [--json]       # @font-face CSS + font-family
 *   node noonnu.cjs sample <폰트id | 폰트이름> [--text "문구"] [--out out.png]
 *                         [--size 64] [--weight 400] [--width 1200] [--bg "#fff"] [--fg "#111"]
 *
 * 폰트 식별: 숫자면 폰트 id, 아니면 이름으로 검색해 첫 결과를 사용.
 * 의존: playwright(헤드리스 크로미움). 미설치 시: npx playwright install chromium
 */
'use strict';

// ---- Playwright 로드 (여러 경로 시도) ----
function loadPlaywright() {
  const tries = ['playwright', 'playwright-core', '/opt/node22/lib/node_modules/playwright'];
  for (const t of tries) {
    try { return require(t); } catch (_) {}
  }
  console.error(
    'ERROR: playwright를 찾을 수 없습니다.\n' +
    '  설치: npm i -g playwright && npx playwright install chromium\n' +
    '  또는 프로젝트에 npm i playwright 후 다시 실행하세요.'
  );
  process.exit(3);
}
const { chromium } = loadPlaywright();

const BASE = 'https://noonnu.cc';
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';

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

async function withCtx(fn) {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true, userAgent: UA, viewport: { width: 1280, height: 800 } });
  try { return await fn(ctx); }
  finally { await browser.close(); }
}

async function getJson(ctx, path) {
  const r = await ctx.request.get(BASE + path, { headers: { Accept: 'application/json' }, timeout: 40000 });
  if (!r.ok()) throw new Error(`HTTP ${r.status()} for ${path}`);
  const ct = r.headers()['content-type'] || '';
  if (!ct.includes('json')) throw new Error(`expected JSON, got ${ct} for ${path}`);
  return r.json();
}

// 폰트 항목을 사람이 보기 좋은 형태로 정규화
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
    font_family: (f.default_variant && f.default_variant.font_family_token) || null,
    webfont_css: css || null,
    url: BASE + (f.polymorphic_show_path || `/font_page/${f.id}`),
  };
}

async function searchFonts(ctx, query, limit) {
  const j = await getJson(ctx, `/search/${encodeURIComponent(query)}.json?locale=ko`);
  const arr = (j.fonts || []).map(normFont);
  return { total: j.total_count != null ? j.total_count : arr.length, fonts: limit ? arr.slice(0, limit) : arr };
}

async function listFonts(ctx, page, limit) {
  const j = await getJson(ctx, `/index.json?locale=ko&page=${page || 1}`);
  const arr = (j.fonts || []).map(normFont);
  return { total: j.total_count != null ? j.total_count : arr.length, page: page || 1, fonts: limit ? arr.slice(0, limit) : arr };
}

// id 또는 이름 → 폰트 기본 메타(정규화). 이름이면 검색 첫 결과.
async function resolveFont(ctx, idOrName) {
  if (/^\d+$/.test(String(idOrName))) {
    // 검색만으로는 id 직접 조회가 없으므로 상세 HTML에서 보강. 우선 빈 골격 반환.
    return { id: Number(idOrName), name: null, url: `${BASE}/font_page/${idOrName}` };
  }
  const { fonts } = await searchFonts(ctx, idOrName, 1);
  if (!fonts.length) throw new Error(`'${idOrName}' 검색 결과 없음`);
  return fonts[0];
}

// 상세 페이지 HTML 파싱: 형태/굵기/라이선스/허용범위표/웹폰트 CSS/미리보기
async function fetchDetail(ctx, id) {
  const page = await ctx.newPage();
  try {
    await page.goto(`${BASE}/font_page/${id}`, { waitUntil: 'networkidle', timeout: 40000 });
    await page.waitForTimeout(800);
    return await page.evaluate(() => {
      const txt = document.body.innerText;
      const lines = txt.split('\n').map((l) => l.trim());
      const after = (label) => {
        let i = lines.findIndex((l) => l === label);
        if (i < 0) i = lines.findIndex((l) => l.startsWith(label));
        return i >= 0 && lines[i + 1] ? lines[i + 1] : null;
      };
      // 라이선스명: 라벨 줄(요약표/본문/전문)을 제외하고 실제 라이선스명 패턴을 찾는다
      const licenseName = (() => {
        const direct = after('라이선스 본문') || after('라이선스');
        if (direct && !/요약|전문|본문|^라이선스$/.test(direct)) return direct;
        const cand = lines.find((l) =>
          /(오픈\s*폰트\s*라이[선센]스|OFL|SIL|공공누리|자유\s*이용|MIT|CC\s*BY|아파치|Apache)/.test(l) &&
          !/요약|전문|^라이선스/.test(l));
        return cand || direct || null;
      })();
      // 웹폰트 CSS: @font-face 포함 textarea/pre/code 중 가장 긴 것(모든 굵기)
      const blocks = [...document.querySelectorAll('textarea, pre, code')]
        .map((e) => (e.value || e.innerText || '').trim())
        .filter((t) => /@font-face|@import|font-family/.test(t));
      blocks.sort((a, b) => b.length - a.length);
      // 허용범위 요약표: 표의 각 행 [카테고리, 설명, 가부]
      const usage = [];
      document.querySelectorAll('table tr').forEach((tr) => {
        const cells = [...tr.querySelectorAll('td, th')].map((c) => c.innerText.trim());
        if (cells.length >= 2 && /사용|가능|불가|조건/.test(cells[cells.length - 1])) {
          usage.push({ category: cells[0], allowed: cells[cells.length - 1], note: cells.length > 2 ? cells[1] : null });
        }
      });
      // 미리보기 썸네일 이미지
      const thumb = [...document.images].map((i) => i.src)
        .find((s) => /cdn\.noonnu\.cc\/(fonts\/thumbnails|\d{6})\//.test(s)) || null;
      return {
        name: (document.querySelector('h1, h2') || {}).innerText || null,
        creator: after('제작자') || after('디자이너') || null,
        shape: after('형태'),
        weight_group: after('굵기'),
        license_name: licenseName,
        webfont_css: blocks[0] || null,
        usage,
        thumbnail: thumb,
      };
    });
  } finally {
    await page.close();
  }
}

// 폰트 family 토큰을 CSS에서 추출
function familyFromCss(css) {
  if (!css) return null;
  const m = css.match(/font-family:\s*['"]([^'"]+)['"]/);
  return m ? m[1] : null;
}

// ---- 출력 헬퍼 ----
function printFontLine(f) {
  const wf = f.webfont_supported === false ? '웹폰트✗' : '웹폰트✓';
  const w = f.weights ? `${f.weights}굵기` : '';
  console.log(`#${f.id}  ${f.name}${f.name_en && f.name_en !== f.name ? ' (' + f.name_en + ')' : ''}`);
  console.log(`     ${[f.creator, w, wf].filter(Boolean).join(' · ')}`);
  if (f.preview_text) console.log(`     "${f.preview_text}"`);
  console.log(`     ${f.url}`);
}

// ---- 커맨드 ----
async function cmdSearch(args) {
  const q = args._[1];
  if (!q) return fail('검색어가 필요합니다: noonnu search <쿼리>');
  const limit = args.limit ? Number(args.limit) : 12;
  await withCtx(async (ctx) => {
    const res = await searchFonts(ctx, q, limit);
    if (args.json) return console.log(JSON.stringify(res, null, 2));
    console.log(`'${q}' 검색: 총 ${res.total}개 (상위 ${res.fonts.length})\n`);
    res.fonts.forEach((f) => { printFontLine(f); console.log(); });
  });
}

async function cmdList(args) {
  const page = args.page ? Number(args.page) : 1;
  const limit = args.limit ? Number(args.limit) : 24;
  await withCtx(async (ctx) => {
    const res = await listFonts(ctx, page, limit);
    if (args.json) return console.log(JSON.stringify(res, null, 2));
    console.log(`추천순 목록 page ${res.page} (총 ${res.total}개)\n`);
    res.fonts.forEach((f) => { printFontLine(f); console.log(); });
  });
}

async function cmdCategory(args) {
  // 정식 필터 파라미터가 공개돼 있지 않아, 카테고리어를 검색으로 조회한다.
  const cat = args._[1];
  if (!cat) return fail('카테고리가 필요합니다 (예: 고딕, 명조, 손글씨, 장식, 픽셀)');
  const limit = args.limit ? Number(args.limit) : 12;
  await withCtx(async (ctx) => {
    const res = await searchFonts(ctx, cat, limit);
    if (args.json) return console.log(JSON.stringify(res, null, 2));
    console.log(`카테고리/태그 '${cat}' (검색 기반): 총 ${res.total}개 (상위 ${res.fonts.length})\n`);
    res.fonts.forEach((f) => { printFontLine(f); console.log(); });
  });
}

async function cmdInfo(args) {
  const key = args._[1];
  if (!key) return fail('폰트 id 또는 이름이 필요합니다');
  await withCtx(async (ctx) => {
    const base = await resolveFont(ctx, key);
    const d = await fetchDetail(ctx, base.id);
    const merged = {
      id: base.id,
      name: base.name || d.name,
      creator: base.creator || d.creator || null,
      shape: d.shape,
      weights: base.weights || null,
      weight_group: d.weight_group,
      license: d.license_name,
      webfont_supported: !!(d.webfont_css || base.webfont_css),
      font_family: familyFromCss(d.webfont_css) || base.font_family,
      usage: d.usage,
      thumbnail: d.thumbnail,
      url: base.url,
    };
    if (args.json) return console.log(JSON.stringify(merged, null, 2));
    console.log(`#${merged.id}  ${merged.name}`);
    console.log(`형태: ${merged.shape || '-'} | 굵기: ${merged.weight_group || merged.weights || '-'}`);
    console.log(`제작자: ${merged.creator || '-'}`);
    console.log(`라이선스: ${merged.license || '-'}`);
    console.log(`웹폰트: ${merged.webfont_supported ? '지원 (font-family: ' + merged.font_family + ')' : '미지원'}`);
    if (merged.usage && merged.usage.length) {
      console.log('허용 범위:');
      merged.usage.forEach((u) => console.log(`  - ${u.category}: ${u.allowed}`));
    }
    console.log(merged.url);
  });
}

async function cmdWebfont(args) {
  const key = args._[1];
  if (!key) return fail('폰트 id 또는 이름이 필요합니다');
  await withCtx(async (ctx) => {
    const base = await resolveFont(ctx, key);
    let css = base.webfont_css;
    const d = await fetchDetail(ctx, base.id); // 상세는 전체 굵기 CSS를 가짐
    if (d.webfont_css && (!css || d.webfont_css.length > css.length)) css = d.webfont_css;
    const family = familyFromCss(css) || base.font_family;
    const out = { id: base.id, name: base.name || d.name, webfont_supported: !!css, font_family: family, css: css || null, url: base.url };
    if (args.json) return console.log(JSON.stringify(out, null, 2));
    if (!css) { console.log(`#${out.id} ${out.name}: 웹폰트 미지원`); return; }
    console.log(`/* #${out.id} ${out.name} — font-family: '${family}' */`);
    console.log(css);
  });
}

async function cmdSample(args) {
  const key = args._[1];
  if (!key) return fail('폰트 id 또는 이름이 필요합니다');
  const text = args.text || '다람쥐 헌 쳇바퀴에 타고파 ABCDqrs 0123';
  const size = Number(args.size || 64);
  const weight = String(args.weight || 400);
  const width = Number(args.width || 1200);
  const bg = args.bg || '#ffffff';
  const fg = args.fg || '#111111';
  const out = args.out || `noonnu-sample-${Date.now()}.png`;
  await withCtx(async (ctx) => {
    const base = await resolveFont(ctx, key);
    let css = base.webfont_css;
    const d = await fetchDetail(ctx, base.id);
    if (d.webfont_css && (!css || d.webfont_css.length > css.length)) css = d.webfont_css;
    if (!css) return fail(`#${base.id} ${base.name || ''}: 웹폰트 미지원 — 샘플 렌더 불가`);
    const family = familyFromCss(css) || base.font_family;
    const page = await ctx.newPage();
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      ${css}
      html,body{margin:0}
      .card{display:inline-block;background:${bg};color:${fg};padding:48px 56px;
        font-family:'${family}',sans-serif;font-weight:${weight};font-size:${size}px;
        line-height:1.45;max-width:${width}px;word-break:keep-all}
    </style></head><body><div class="card">${escapeHtml(text)}</div></body></html>`;
    await page.setContent(html, { waitUntil: 'load' });
    // 웹폰트 로드 대기
    await page.evaluate(async () => { if (document.fonts && document.fonts.ready) await document.fonts.ready; });
    await page.waitForTimeout(600);
    const el = await page.$('.card');
    await el.screenshot({ path: out });
    await page.close();
    if (args.json) console.log(JSON.stringify({ id: base.id, name: base.name || d.name, font_family: family, out, text }, null, 2));
    else console.log(`샘플 저장: ${out}  (#${base.id} ${base.name || d.name}, family '${family}')`);
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function fail(msg) { console.error('ERROR: ' + msg); process.exitCode = 2; }

function usage() {
  console.log(`noonnu.cjs — 눈누 상업용 무료 한글 폰트 CLI

  search <쿼리>              폰트/제작자 검색            [--limit N] [--json]
  list                      추천순 목록(페이지네이션)    [--page N] [--limit N] [--json]
  category <형태>            카테고리/태그 조회(검색기반)  [--limit N] [--json]
  info <id|이름>            형태·라이선스·허용범위·굵기   [--json]
  webfont <id|이름>         @font-face CSS + font-family [--json]
  sample <id|이름>          샘플 PNG 렌더               [--text "문구"] [--out f.png]
                                                       [--size 64] [--weight 400] [--bg #fff] [--fg #111]

예) node noonnu.cjs search 프리텐다드
    node noonnu.cjs webfont 프리텐다드
    node noonnu.cjs sample 694 --text "GROOVE 회현" --out groove.png`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0];
  try {
    switch (cmd) {
      case 'search': return await cmdSearch(args);
      case 'list': return await cmdList(args);
      case 'category': return await cmdCategory(args);
      case 'info': return await cmdInfo(args);
      case 'webfont': return await cmdWebfont(args);
      case 'sample': return await cmdSample(args);
      case undefined:
      case 'help':
      case '--help':
      case '-h': return usage();
      default: console.error(`알 수 없는 명령: ${cmd}\n`); return usage();
    }
  } catch (e) {
    console.error('ERROR: ' + (e && e.message ? e.message : String(e)));
    process.exitCode = 1;
  }
}

main();
