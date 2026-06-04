(function () {
  'use strict';

  // ─── REDUCED MOTION GUARD ───────────────────────────────────────────────────
  const spark_prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ─── LENIS SMOOTH SCROLL ─────────────────────────────────────────────────────
  let spark_lenis = null;

  if (!spark_prefersReduced) {
    spark_lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    });
    spark_lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => spark_lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ─── PROGRESS BAR ────────────────────────────────────────────────────────────
  const app_progressFill = document.querySelector('.progress-fill');
  const app_progressBar  = document.querySelector('.progress-bar');

  function app_updateProgress() {
    const scrollTop  = window.scrollY || document.documentElement.scrollTop;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const pct        = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
    if (app_progressFill) {
      app_progressFill.style.width = pct + '%';
    }
    if (app_progressBar) {
      app_progressBar.setAttribute('aria-valuenow', pct);
    }
  }
  window.addEventListener('scroll', app_updateProgress, { passive: true });

  // ─── NAV SCROLL STATE ────────────────────────────────────────────────────────
  const app_nav = document.querySelector('.site-nav');

  function app_onNavScroll() {
    if (!app_nav) return;
    if (window.scrollY > 60) {
      app_nav.classList.add('nav-scrolled');
    } else {
      app_nav.classList.remove('nav-scrolled');
    }
  }
  window.addEventListener('scroll', app_onNavScroll, { passive: true });

  // ─── NAV TOGGLE (mobile) ─────────────────────────────────────────────────────
  const app_navToggle = document.querySelector('.nav-toggle');
  const app_navMenu   = document.querySelector('.nav-menu');

  if (app_navToggle && app_navMenu) {
    app_navToggle.addEventListener('click', () => {
      const expanded = app_navToggle.getAttribute('aria-expanded') === 'true';
      app_navToggle.setAttribute('aria-expanded', String(!expanded));
      app_navMenu.classList.toggle('is-open', !expanded);
    });

    app_navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        app_navToggle.setAttribute('aria-expanded', 'false');
        app_navMenu.classList.remove('is-open');
      });
    });
  }

  // ─── NAV SMOOTH SCROLL (lenis.scrollTo) ──────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      if (spark_lenis) {
        spark_lenis.scrollTo(target, { offset: -80, duration: 1.4 });
      } else {
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80 });
      }
    });
  });

  // ─── WAVE CANVAS (HERO — SURPRISE ELEMENT) ───────────────────────────────────
  // GOVERNING_METAPHOR: 공기의 진동/파동
  // Multiple interference-wave sources, mouse creates inertial ripple source
  const app_canvas  = document.getElementById('wave-canvas');

  if (app_canvas && !spark_prefersReduced) {
    const app_ctx = app_canvas.getContext('2d');

    let app_W = 0;
    let app_H = 0;

    function app_resizeCanvas() {
      app_W = app_canvas.offsetWidth;
      app_H = app_canvas.offsetHeight;
      app_canvas.width  = app_W;
      app_canvas.height = app_H;
    }

    // Wave sources: fixed + mouse
    const app_fixedSources = [
      { x: 0.18, y: 0.35, amp: 22, freq: 0.014, phase: 0 },
      { x: 0.78, y: 0.65, amp: 18, freq: 0.011, phase: 1.4 },
      { x: 0.55, y: 0.12, amp: 15, freq: 0.018, phase: 2.7 },
    ];

    // Mouse source with inertia
    const app_mouse = {
      rawX: 0.5, rawY: 0.5,
      x: 0.5,    y: 0.5,
      vx: 0,     vy: 0,
      amp: 28, freq: 0.016, phase: 0,
      active: false
    };

    window.addEventListener('mousemove', (e) => {
      app_mouse.rawX  = e.clientX / window.innerWidth;
      app_mouse.rawY  = e.clientY / window.innerHeight;
      app_mouse.active = true;
    }, { passive: true });

    let app_waveT = 0;
    let app_rafId = null;

    function app_drawWaves() {
      app_waveT += 0.008;

      // Lerp mouse position (inertia)
      const lerpF = 0.055;
      app_mouse.x += (app_mouse.rawX - app_mouse.x) * lerpF;
      app_mouse.y += (app_mouse.rawY - app_mouse.y) * lerpF;

      app_ctx.clearRect(0, 0, app_W, app_H);

      // Background
      app_ctx.fillStyle = 'oklch(12% 0.008 320)';
      app_ctx.fillRect(0, 0, app_W, app_H);

      // Build sources list
      const sources = [...app_fixedSources];
      if (app_mouse.active) {
        sources.push({
          x: app_mouse.x, y: app_mouse.y,
          amp: app_mouse.amp, freq: app_mouse.freq,
          phase: app_waveT * 2.1
        });
      }

      // Scanline interference rendering
      const lineCount = Math.floor(app_H / 3);
      const step      = app_H / lineCount;

      for (let li = 0; li < lineCount; li++) {
        const py = li * step;
        const yN = py / app_H;

        app_ctx.beginPath();

        for (let px = 0; px < app_W; px += 2) {
          const xN = px / app_W;

          let sum = 0;
          for (const src of sources) {
            const dx   = xN - src.x;
            const dy   = yN - src.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const wave = Math.sin(dist * app_W * src.freq - app_waveT * 3.5 + src.phase);
            const env  = Math.exp(-dist * 2.8);
            sum += wave * src.amp * env;
          }

          const drawY = py + sum;

          if (px === 0) {
            app_ctx.moveTo(px, drawY);
          } else {
            app_ctx.lineTo(px, drawY);
          }
        }

        // Opacity based on position for depth
        const distCenter = Math.abs(yN - 0.5);
        const alpha      = 0.03 + (1 - distCenter) * 0.07;

        app_ctx.strokeStyle = `rgba(62,140,147,${alpha})`;
        app_ctx.lineWidth   = 0.8;
        app_ctx.stroke();
      }

      // Mouse halo glow
      if (app_mouse.active) {
        const gx = app_mouse.x * app_W;
        const gy = app_mouse.y * app_H;
        const grad = app_ctx.createRadialGradient(gx, gy, 0, gx, gy, 140);
        grad.addColorStop(0,   'rgba(50, 140, 147, 0.08)');
        grad.addColorStop(0.5, 'rgba(50, 140, 147, 0.03)');
        grad.addColorStop(1,   'rgba(50, 140, 147, 0)');
        app_ctx.fillStyle = grad;
        app_ctx.fillRect(0, 0, app_W, app_H);
      }

      app_rafId = requestAnimationFrame(app_drawWaves);
    }

    const app_resizeObs = new ResizeObserver(() => { app_resizeCanvas(); });
    app_resizeObs.observe(app_canvas.parentElement);
    app_resizeCanvas();
    app_drawWaves();
  }

  // ─── HERO TITLE REVEAL ───────────────────────────────────────────────────────
  if (!spark_prefersReduced) {
    // Wrap inner spans for translate animation
    document.querySelectorAll('.ht-line').forEach((line) => {
      const text  = line.textContent;
      line.textContent = '';
      const inner = document.createElement('span');
      inner.className = 'ht-line-inner';
      inner.textContent = text;
      line.appendChild(inner);
    });

    gsap.to('.ht-line-inner', {
      y: 0,
      duration: 1.1,
      ease: 'expo.out',
      stagger: 0.12,
      delay: 0.3
    });

    gsap.from('.hero-eyebrow', { opacity: 0, y: 12, duration: 0.9, ease: 'expo.out', delay: 0.2 });
    gsap.from('.hero-sub',     { opacity: 0, y: 16, duration: 0.9, ease: 'expo.out', delay: 0.6 });
    gsap.from('.hero-cta',     { opacity: 0, y: 12, duration: 0.8, ease: 'expo.out', delay: 0.75 });
  }

  // ─── SCROLL REVEAL ───────────────────────────────────────────────────────────
  if (!spark_prefersReduced) {
    gsap.registerPlugin(ScrollTrigger);

    const app_revealEls = document.querySelectorAll('.reveal');
    app_revealEls.forEach((el, i) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        onEnter: () => {
          setTimeout(() => el.classList.add('is-visible'), i % 3 * 80);
        },
        once: true
      });
    });
  } else {
    // Ensure all reveals are visible in reduced-motion context
    document.querySelectorAll('.reveal').forEach((el) => {
      el.classList.add('is-visible');
    });
  }

  // ─── CUSTOM CURSOR ───────────────────────────────────────────────────────────
  if (!spark_prefersReduced && window.matchMedia('(pointer: fine)').matches) {
    const ui_ring = document.createElement('div');
    const ui_dot  = document.createElement('div');
    ui_ring.className = 'cursor-ring';
    ui_dot.className  = 'cursor-dot';
    document.body.appendChild(ui_ring);
    document.body.appendChild(ui_dot);

    let ui_cx = -100, ui_cy = -100;
    let ui_rx = -100, ui_ry = -100;

    document.addEventListener('mousemove', (e) => {
      ui_cx = e.clientX;
      ui_cy = e.clientY;
    }, { passive: true });

    function ui_animCursor() {
      ui_rx += (ui_cx - ui_rx) * 0.12;
      ui_ry += (ui_cy - ui_ry) * 0.12;

      ui_ring.style.transform = `translate(${ui_rx}px, ${ui_ry}px) translate(-50%, -50%)`;
      ui_dot.style.transform  = `translate(${ui_cx}px, ${ui_cy}px) translate(-50%, -50%)`;

      requestAnimationFrame(ui_animCursor);
    }
    ui_animCursor();
  }

  // ─── FRAGRANCE CARD PARALLAX (subtle) ────────────────────────────────────────
  if (!spark_prefersReduced) {
    document.querySelectorAll('.fcard-img img').forEach((img) => {
      gsap.fromTo(img,
        { yPercent: -4 },
        {
          yPercent: 4,
          ease: 'none',
          scrollTrigger: {
            trigger: img.closest('.fragrance-card'),
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5
          }
        }
      );
    });
  }

  // ─── PROCESS STEP WAVE GLYPH ANIM ────────────────────────────────────────────
  if (!spark_prefersReduced) {
    const app_waveSvg = document.querySelector('.wave-glyph svg path');
    if (app_waveSvg) {
      gsap.to(app_waveSvg, {
        attr: { d: 'M0,30 C20,50 40,10 60,30 C80,50 100,10 120,30 C140,50 160,10 180,30 C190,40 195,35 200,30' },
        duration: 3,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
      });
    }
  }

})();
