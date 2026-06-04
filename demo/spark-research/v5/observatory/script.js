(function () {
  'use strict';

  // ── REDUCED MOTION ──
  const app_reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── LENIS ──
  let app_lenis;
  if (!app_reduced) {
    app_lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    app_lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => app_lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ── PROGRESS BAR ──
  const app_bar = document.querySelector('.progress-bar');
  function app_updateBar() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    app_bar.style.width = max > 0 ? (window.scrollY / max * 100) + '%' : '0%';
  }
  window.addEventListener('scroll', app_updateBar, { passive: true });

  // ── NAV SCROLL STATE ──
  const app_nav = document.querySelector('.site-nav');
  function app_updateNav() {
    app_nav.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', app_updateNav, { passive: true });

  // ── CANVAS SETUP ──
  const app_canvas = document.querySelector('.hero-canvas');
  const app_ctx = app_canvas.getContext('2d');
  const app_hero = document.querySelector('.hero');
  let app_cW = 0;
  let app_cH = 0;

  function app_resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    app_cW = app_canvas.offsetWidth || window.innerWidth;
    app_cH = app_canvas.offsetHeight || window.innerHeight;
    app_canvas.width = app_cW * dpr;
    app_canvas.height = app_cH * dpr;
    app_ctx.scale(dpr, dpr);
  }

  app_resizeCanvas();
  window.addEventListener('resize', app_resizeCanvas, { passive: true });

  // ── SEEDED RNG (canvas only, distinct from LIGHTBULB selection) ──
  function app_makeRng(seed) {
    let s = seed >>> 0;
    return function () {
      s ^= s << 13;
      s ^= s >>> 17;
      s ^= s << 5;
      return ((s >>> 0) / 0xffffffff);
    };
  }

  const app_rng = app_makeRng(60419);

  // ── STAR COLORS ──
  const APP_COLORS = [
    [210, 220, 255], // blue-white
    [255, 248, 225], // warm white
    [245, 250, 255], // cool white
    [255, 225, 195], // orange-white (rare)
  ];

  // ── GENERATE STARS ──
  const APP_N_STARS = 290;
  const APP_N_BRIGHT = 22;
  const app_stars = [];

  for (let i = 0; i < APP_N_STARS + APP_N_BRIGHT; i++) {
    const bright = i >= APP_N_STARS;
    app_stars.push({
      nx:    app_rng(),
      ny:    app_rng(),
      r:     bright ? app_rng() * 1.4 + 1.1 : app_rng() * 0.9 + 0.25,
      base:  bright ? app_rng() * 0.35 + 0.55 : app_rng() * 0.45 + 0.12,
      phase: app_rng() * Math.PI * 2,
      speed: app_rng() * 0.7 + 0.25,
      col:   APP_COLORS[bright ? Math.floor(app_rng() * 4) : Math.floor(app_rng() * 3)],
      boost: 0,
    });
  }

  // ── NEBULA GLOWS ──
  const app_nebulae = [];
  for (let i = 0; i < 5; i++) {
    app_nebulae.push({
      nx:  app_rng(),
      ny:  app_rng(),
      rn:  app_rng() * 0.25 + 0.12,
      warm: app_rng() > 0.5,
    });
  }

  // ── MOUSE / TOUCH ──
  let app_mX = -600;
  let app_mY = -600;
  let app_lX = -600;
  let app_lY = -600;
  let app_touched = false;
  let app_touchFade = 0;
  let app_touchLift = false;

  app_hero.addEventListener('mousemove', (e) => {
    const r = app_hero.getBoundingClientRect();
    app_mX = e.clientX - r.left;
    app_mY = e.clientY - r.top;
  });

  app_hero.addEventListener('mouseleave', () => {
    app_mX = -600;
    app_mY = -600;
  });

  app_hero.addEventListener('touchstart', (e) => {
    app_touched = true;
    app_touchLift = false;
    app_touchFade = 1;
    const touch = e.touches[0];
    const r = app_hero.getBoundingClientRect();
    app_mX = touch.clientX - r.left;
    app_mY = touch.clientY - r.top;
  }, { passive: true });

  app_hero.addEventListener('touchmove', (e) => {
    app_touchFade = 1;
    app_touchLift = false;
    const touch = e.touches[0];
    const r = app_hero.getBoundingClientRect();
    app_mX = touch.clientX - r.left;
    app_mY = touch.clientY - r.top;
  }, { passive: true });

  app_hero.addEventListener('touchend', () => {
    app_touchLift = true;
  });

  // ── DRAW LOOP ──
  const APP_LENS_R = 135;
  const APP_CONN_D = 85;
  const APP_ARM_DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let app_t = 0;
  let app_raf = 0;
  let app_rafRunning = false;

  function app_draw() {
    app_raf = requestAnimationFrame(app_draw);
    app_rafRunning = true;
    app_t += 0.007;

    // Lerp cursor
    app_lX += (app_mX - app_lX) * 0.065;
    app_lY += (app_mY - app_lY) * 0.065;

    // Touch fade-out
    if (app_touchLift) {
      app_touchFade = Math.max(0, app_touchFade - 0.018);
      if (app_touchFade <= 0) { app_mX = -600; app_mY = -600; }
    }

    const W = app_cW;
    const H = app_cH;

    // Clear
    app_ctx.fillStyle = 'rgb(9, 9, 19)';
    app_ctx.fillRect(0, 0, W, H);

    // Nebula glows
    for (const nb of app_nebulae) {
      const cx = nb.nx * W;
      const cy = nb.ny * H;
      const nr = nb.rn * Math.min(W, H);
      const col = nb.warm ? '25, 18, 55' : '14, 22, 70';
      const g = app_ctx.createRadialGradient(cx, cy, 0, cx, cy, nr);
      g.addColorStop(0,   'rgba(' + col + ', 0.09)');
      g.addColorStop(0.5, 'rgba(' + col + ', 0.03)');
      g.addColorStop(1,   'rgba(0,0,0,0)');
      app_ctx.fillStyle = g;
      app_ctx.beginPath();
      app_ctx.arc(cx, cy, nr, 0, Math.PI * 2);
      app_ctx.fill();
    }

    // Update & draw stars
    const inLens = [];

    for (const star of app_stars) {
      const sx = star.nx * W;
      const sy = star.ny * H;
      const dx = sx - app_lX;
      const dy = sy - app_lY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const tgt = dist < APP_LENS_R ? (1 - dist / APP_LENS_R) * 1.3 : 0;
      star.boost += (tgt - star.boost) * 0.1;

      if (star.boost > 0.04) inLens.push({ star, sx, sy });

      const twinkle = app_reduced ? 1 : (Math.sin(app_t * star.speed + star.phase) * 0.08 + 0.93);
      const alpha = Math.min(star.base * twinkle + star.boost * 0.55, 1);
      const radius = star.r + star.boost * 1.8;
      const [cr, cg, cb] = star.col;

      // Glow for bright/boosted stars
      if (star.boost > 0.08 || star.r > 1.1) {
        const gr = app_ctx.createRadialGradient(sx, sy, 0, sx, sy, radius * 4.5);
        gr.addColorStop(0, 'rgba(' + cr + ',' + cg + ',' + cb + ',' + Math.min(alpha * 0.35, 0.28) + ')');
        gr.addColorStop(1, 'rgba(0,0,0,0)');
        app_ctx.fillStyle = gr;
        app_ctx.beginPath();
        app_ctx.arc(sx, sy, radius * 4.5, 0, Math.PI * 2);
        app_ctx.fill();
      }

      app_ctx.fillStyle = 'rgba(' + cr + ',' + cg + ',' + cb + ',' + alpha + ')';
      app_ctx.beginPath();
      app_ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      app_ctx.fill();
    }

    // Constellation lines
    if (inLens.length > 1) {
      for (let i = 0; i < inLens.length; i++) {
        for (let j = i + 1; j < inLens.length; j++) {
          const a = inLens[i];
          const b = inLens[j];
          const cx = a.sx - b.sx;
          const cy = a.sy - b.sy;
          const cd = Math.sqrt(cx * cx + cy * cy);
          if (cd < APP_CONN_D) {
            const la = (1 - cd / APP_CONN_D) * Math.min(a.star.boost, b.star.boost) * 0.4;
            app_ctx.beginPath();
            app_ctx.moveTo(a.sx, a.sy);
            app_ctx.lineTo(b.sx, b.sy);
            app_ctx.strokeStyle = 'rgba(200, 178, 118, ' + la + ')';
            app_ctx.lineWidth = 0.5;
            app_ctx.stroke();
          }
        }
      }
    }

    // Lens reticle
    const inView = app_lX > 0 && app_lX < W && app_lY > 0 && app_lY < H;
    if (inView) {
      const reticleAlpha = app_touched ? app_touchFade * 0.55 : 0.55;

      app_ctx.save();
      app_ctx.strokeStyle = 'rgba(185, 162, 105, ' + (reticleAlpha * 0.65) + ')';
      app_ctx.lineWidth = 0.7;
      app_ctx.setLineDash([3, 8]);
      app_ctx.beginPath();
      app_ctx.arc(app_lX, app_lY, APP_LENS_R, 0, Math.PI * 2);
      app_ctx.stroke();

      app_ctx.setLineDash([]);
      app_ctx.strokeStyle = 'rgba(185, 162, 105, ' + (reticleAlpha * 0.4) + ')';
      app_ctx.lineWidth = 0.6;
      const ARM = 11;

      // Cardinal arm ticks at circumference
      for (const [ax, ay] of APP_ARM_DIRS) {
        const ex = app_lX + ax * APP_LENS_R;
        const ey = app_lY + ay * APP_LENS_R;
        app_ctx.beginPath();
        app_ctx.moveTo(ex - ax * ARM, ey - ay * ARM);
        app_ctx.lineTo(ex + ax * ARM, ey + ay * ARM);
        app_ctx.stroke();
      }

      // Center dot
      app_ctx.fillStyle = 'rgba(185, 162, 105, ' + (reticleAlpha * 0.8) + ')';
      app_ctx.beginPath();
      app_ctx.arc(app_lX, app_lY, 1.5, 0, Math.PI * 2);
      app_ctx.fill();

      app_ctx.restore();
    }
  }

  app_draw();

  // ── VISIBILITY PAUSE ──
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(app_raf);
      app_rafRunning = false;
    } else if (!app_rafRunning) {
      app_draw();
    }
  });

  // ── GSAP SCROLL REVEALS ──
  if (!app_reduced) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from('.philosophy-text', {
      y: 44,
      opacity: 0,
      duration: 1.3,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.section-philosophy',
        start: 'top 76%',
      },
    });

    gsap.from('.data-item', {
      x: 28,
      opacity: 0,
      duration: 0.85,
      stagger: 0.11,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.philosophy-data',
        start: 'top 80%',
      },
    });

    gsap.from('.programs-header', {
      y: 28,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.section-programs-wrap',
        start: 'top 76%',
      },
    });

    gsap.from('.program-item', {
      y: 48,
      opacity: 0,
      duration: 1.05,
      stagger: 0.14,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.programs-list',
        start: 'top 80%',
      },
    });

    gsap.from('.visit-info', {
      y: 32,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.section-visit',
        start: 'top 76%',
      },
    });

    gsap.from('.visit-coords', {
      x: 32,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.section-visit',
        start: 'top 76%',
      },
    });
  }

})();
