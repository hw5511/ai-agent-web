/* ============================================================
   script.js — 토림 도자기 공방
   ============================================================ */

'use strict';

/* ── Blueprint Canvas (static, draw once) ───────────────── */
(function initCanvas() {
  const canvas = document.getElementById('blueprint-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function draw() {
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    if (!W || !H) return;
    canvas.width  = W;
    canvas.height = H;

    const MINOR = 36;
    const MAJOR = 180;

    /* 소 격자 */
    ctx.strokeStyle = 'rgba(200,168,130,0.05)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= W; x += MINOR) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += MINOR) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    /* 대 격자 */
    ctx.strokeStyle = 'rgba(200,168,130,0.1)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= W; x += MAJOR) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += MAJOR) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    /* 교차점 마크 */
    ctx.strokeStyle = 'rgba(200,168,130,0.18)';
    ctx.lineWidth = 0.5;
    for (let x = MAJOR; x < W; x += MAJOR) {
      for (let y = MAJOR; y < H; y += MAJOR) {
        const s = 5;
        ctx.beginPath(); ctx.moveTo(x - s, y); ctx.lineTo(x + s, y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x, y + s); ctx.stroke();
      }
    }
  }

  draw();
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(draw, 120);
  });
})();

/* ── Dial SVG — 눈금 + 호 생성 ──────────────────────────── */
(function initDial() {
  const CX = 160, CY = 160;
  const R  = 130;
  const START = 225;  /* 도(degree), math coords */
  const SWEEP = 270;
  const TICKS = 36;   /* 총 눈금 수 */
  const MAX_TEMP = 1280;

  const tickGroup = document.getElementById('dial-ticks');
  const arcEl     = document.getElementById('dial-arc');
  const arcActive = document.getElementById('dial-arc-active');

  function polar(deg, r) {
    const rad = deg * Math.PI / 180;
    return [CX + Math.cos(rad) * r, CY + Math.sin(rad) * r];
  }

  /* 눈금 생성 */
  if (tickGroup) {
    for (let i = 0; i <= TICKS; i++) {
      const deg     = START + (SWEEP / TICKS) * i;
      const isMajor = i % 6 === 0;
      const r1      = isMajor ? R - 18 : R - 8;
      const [x1, y1] = polar(deg, r1);
      const [x2, y2] = polar(deg, R);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1.toFixed(2)); line.setAttribute('y1', y1.toFixed(2));
      line.setAttribute('x2', x2.toFixed(2)); line.setAttribute('y2', y2.toFixed(2));
      line.setAttribute('stroke-width', isMajor ? '1.5' : '0.75');
      tickGroup.appendChild(line);

      if (isMajor && i > 0 && i < TICKS) {
        const [lx, ly] = polar(deg, R - 28);
        const val = Math.round((i / TICKS) * MAX_TEMP);
        const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        txt.setAttribute('x', lx.toFixed(2));
        txt.setAttribute('y', (ly + 3).toFixed(2));
        txt.setAttribute('text-anchor', 'middle');
        txt.setAttribute('fill', 'rgba(240,232,220,0.3)');
        txt.setAttribute('font-family', 'Space Mono,monospace');
        txt.setAttribute('font-size', '7');
        txt.textContent = val;
        tickGroup.appendChild(txt);
      }
    }
  }

  /* 전체 호 */
  if (arcEl) {
    const [ax1, ay1] = polar(START, R - 3);
    const [ax2, ay2] = polar(START + SWEEP, R - 3);
    arcEl.setAttribute('d', `M ${ax1.toFixed(2)} ${ay1.toFixed(2)} A ${R-3} ${R-3} 0 1 1 ${ax2.toFixed(2)} ${ay2.toFixed(2)}`);
  }

  /* 활성 온도 호 (0 → 1100°C) */
  if (arcActive) {
    const activeRatio = 1100 / MAX_TEMP;
    const activeSweep = SWEEP * activeRatio;
    const [bx1, by1] = polar(START, R - 3);
    const [bx2, by2] = polar(START + activeSweep, R - 3);
    const largeArc   = activeSweep > 180 ? 1 : 0;
    arcActive.setAttribute('d', `M ${bx1.toFixed(2)} ${by1.toFixed(2)} A ${R-3} ${R-3} 0 ${largeArc} 1 ${bx2.toFixed(2)} ${by2.toFixed(2)}`);
  }
})();

/* ── Nav scroll state ────────────────────────────────────── */
(function initNav() {
  const nav   = document.getElementById('nav');
  const hero  = document.getElementById('hero');
  if (!nav || !hero) return;

  function update() {
    const threshold = hero.offsetHeight * 0.8;
    nav.classList.toggle('scrolled', window.scrollY > threshold);
  }

  update();
  window.addEventListener('scroll', update, { passive: true });
})();

/* ── Scroll Reveal ───────────────────────────────────────── */
(function initReveal() {
  /* Reduced-motion: skip entirely (CSS handles static state) */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  targets.forEach((el) => io.observe(el));
})();

/* ── Gallery filter ──────────────────────────────────────── */
(function initFilter() {
  const btns  = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.gallery-card');
  if (!btns.length) return;

  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      btns.forEach((b) => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      const filter = btn.dataset.filter;
      cards.forEach((card) => {
        const show = filter === 'all' || card.dataset.cat === filter;
        card.classList.toggle('hidden', !show);
      });
    });
  });

  /* 초기 aria-pressed 설정 */
  btns.forEach((btn) => {
    btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
  });
})();
