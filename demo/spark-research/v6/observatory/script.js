/* ─────────────────────────────────────────
   이안 천문대 — script.js
   SURPRISE_ELEMENT: 보케 캔버스 — 마우스 근접 시 빛망울 초점 맞춤
   CHOSEN_SPARK: lb-147 보케 효과의 시각적 심도
───────────────────────────────────────── */

(function () {
  'use strict';

  /* ── 유틸: 결정론적 PRNG (보케 배치용 시드 난수) ── */
  function spark_mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const spark_rng = spark_mulberry32(20240604);

  function spark_lerp(a, b, t) { return a + (b - a) * t; }
  function spark_clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /* ── 보케 구체 색상 팔레트 (RGB 문자열) ── */
  const spark_colors = [
    '194, 149, 88',   /* 따뜻한 황금 */
    '180, 192, 225',  /* 차가운 청백 */
    '220, 205, 160',  /* 연한 금빛 */
    '200, 196, 188',  /* 부드러운 흰빛 */
    '160, 175, 215',  /* 연한 파랑 */
    '210, 185, 130',  /* 황갈색 */
  ];

  /* ── 보케 구체 생성 ── */
  const BOKEH_COUNT = 68;
  const spark_spheres = [];

  for (let spark_i = 0; spark_i < BOKEH_COUNT; spark_i++) {
    const spark_depth = 0.3 + spark_rng() * 0.7; // 0.3~1.0 (가까울수록 작음)
    spark_spheres.push({
      xRatio:      spark_rng(),
      yRatio:      spark_rng() * 0.95,
      baseRadius:  3 + spark_rng() * 12,
      depth:       spark_depth,
      colorIdx:    Math.floor(spark_rng() * spark_colors.length),
      floatAmp:    0.5 + spark_rng() * 1.5,
      floatSpeed:  0.0003 + spark_rng() * 0.0006,
      floatPhase:  spark_rng() * Math.PI * 2,
      focus:       0,       /* 현재 초점 비율 (0=흐림, 1=선명) */
    });
  }
  /* 깊이순 정렬 — 먼 것 먼저 그리기 */
  spark_spheres.sort(function (a, b) { return b.depth - a.depth; });

  /* ── Canvas 초기화 ── */
  const spark_canvas = document.getElementById('hero-canvas');
  const spark_ctx = spark_canvas.getContext('2d');

  let spark_cw = 0;
  let spark_ch = 0;

  function spark_resizeCanvas() {
    spark_cw = spark_canvas.offsetWidth;
    spark_ch = spark_canvas.offsetHeight;
    spark_canvas.width = spark_cw * window.devicePixelRatio;
    spark_canvas.height = spark_ch * window.devicePixelRatio;
    spark_ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  spark_resizeCanvas();
  window.addEventListener('resize', spark_resizeCanvas);

  /* ── 마우스 추적 (lerp 관성) ── */
  const spark_mouseTarget = { x: -9999, y: -9999 };
  const spark_mouseCurrent = { x: -9999, y: -9999 };

  window.addEventListener('mousemove', function (e) {
    const spark_rect = spark_canvas.getBoundingClientRect();
    spark_mouseTarget.x = e.clientX - spark_rect.left;
    spark_mouseTarget.y = e.clientY - spark_rect.top;
    /* 첫 감지 시 힌트 표시 */
    const spark_hint = document.querySelector('.hero-hint');
    if (spark_hint && !spark_hint.classList.contains('visible')) {
      spark_hint.classList.add('visible');
    }
  });

  /* 터치 지원 */
  window.addEventListener('touchmove', function (e) {
    if (!e.touches.length) return;
    const spark_touchRect = spark_canvas.getBoundingClientRect();
    spark_mouseTarget.x = e.touches[0].clientX - spark_touchRect.left;
    spark_mouseTarget.y = e.touches[0].clientY - spark_touchRect.top;
  }, { passive: true });

  /* ── 보케 구체 그리기 함수 ── */
  function spark_drawSphere(sphere, screenX, screenY, focusRatio) {
    const spark_colorStr = spark_colors[sphere.colorIdx];
    const spark_focused = focusRatio;
    const spark_blurRadius = sphere.baseRadius + (1 - spark_focused) * sphere.baseRadius * (12 * sphere.depth);
    const spark_coreAlpha = 0.08 + spark_focused * 0.55;
    const spark_glowAlpha = 0.04 + spark_focused * 0.12;

    /* 외곽 글로우 (haze) */
    const spark_glowGrad = spark_ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, spark_blurRadius * 2.8);
    spark_glowGrad.addColorStop(0,   'rgba(' + spark_colorStr + ', ' + spark_glowAlpha + ')');
    spark_glowGrad.addColorStop(0.5, 'rgba(' + spark_colorStr + ', ' + (spark_glowAlpha * 0.3) + ')');
    spark_glowGrad.addColorStop(1,   'rgba(' + spark_colorStr + ', 0)');
    spark_ctx.beginPath();
    spark_ctx.arc(screenX, screenY, spark_blurRadius * 2.8, 0, Math.PI * 2);
    spark_ctx.fillStyle = spark_glowGrad;
    spark_ctx.fill();

    /* 내부 코어 */
    const spark_coreR = spark_blurRadius * spark_lerp(0.55, 0.18, spark_focused);
    const spark_coreGrad = spark_ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, spark_coreR);
    spark_coreGrad.addColorStop(0,   'rgba(' + spark_colorStr + ', ' + spark_coreAlpha + ')');
    spark_coreGrad.addColorStop(0.6, 'rgba(' + spark_colorStr + ', ' + (spark_coreAlpha * 0.4) + ')');
    spark_coreGrad.addColorStop(1,   'rgba(' + spark_colorStr + ', 0)');
    spark_ctx.beginPath();
    spark_ctx.arc(screenX, screenY, spark_coreR, 0, Math.PI * 2);
    spark_ctx.fillStyle = spark_coreGrad;
    spark_ctx.fill();

    /* 초점 맞았을 때 핵 하이라이트 */
    if (spark_focused > 0.4) {
      const spark_pip = sphere.baseRadius * 0.25 * ((spark_focused - 0.4) / 0.6);
      const spark_pipGrad = spark_ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, spark_pip);
      spark_pipGrad.addColorStop(0,   'rgba(' + spark_colorStr + ', ' + (spark_focused * 0.75) + ')');
      spark_pipGrad.addColorStop(1,   'rgba(' + spark_colorStr + ', 0)');
      spark_ctx.beginPath();
      spark_ctx.arc(screenX, screenY, spark_pip, 0, Math.PI * 2);
      spark_ctx.fillStyle = spark_pipGrad;
      spark_ctx.fill();
    }
  }

  /* ── 렌더 루프 ── */
  const INFLUENCE_RADIUS = 220; /* px */
  let spark_time = 0;

  function spark_render(ts) {
    spark_time = ts;

    /* 마우스 lerp */
    spark_mouseCurrent.x = spark_lerp(spark_mouseCurrent.x, spark_mouseTarget.x, 0.07);
    spark_mouseCurrent.y = spark_lerp(spark_mouseCurrent.y, spark_mouseTarget.y, 0.07);

    spark_ctx.clearRect(0, 0, spark_cw, spark_ch);

    for (let spark_k = 0; spark_k < spark_spheres.length; spark_k++) {
      const spark_s = spark_spheres[spark_k];

      /* 부동 위치 계산 */
      const spark_floatX = Math.sin(spark_time * spark_s.floatSpeed + spark_s.floatPhase) * spark_s.floatAmp;
      const spark_floatY = Math.cos(spark_time * spark_s.floatSpeed * 0.73 + spark_s.floatPhase) * spark_s.floatAmp * 0.6;
      const spark_sx = spark_s.xRatio * spark_cw + spark_floatX;
      const spark_sy = spark_s.yRatio * spark_ch + spark_floatY;

      /* 거리 기반 초점 계산 */
      const spark_dx = spark_sx - spark_mouseCurrent.x;
      const spark_dy = spark_sy - spark_mouseCurrent.y;
      const spark_dist = Math.sqrt(spark_dx * spark_dx + spark_dy * spark_dy);
      const spark_targetFocus = 1 - spark_clamp(spark_dist / INFLUENCE_RADIUS, 0, 1);
      spark_s.focus = spark_lerp(spark_s.focus, spark_targetFocus, 0.04);

      spark_drawSphere(spark_s, spark_sx, spark_sy, spark_s.focus);
    }

    requestAnimationFrame(spark_render);
  }

  requestAnimationFrame(spark_render);

  /* ── 스크롤 진행 바 ── */
  const spark_progressFill = document.getElementById('js-progress');
  const spark_progressBar = spark_progressFill ? spark_progressFill.parentElement : null;

  function spark_updateProgress() {
    if (!spark_progressFill) return;
    const spark_scrollTop = window.scrollY || document.documentElement.scrollTop;
    const spark_docH = document.documentElement.scrollHeight - window.innerHeight;
    const spark_pct = spark_docH > 0 ? (spark_scrollTop / spark_docH) * 100 : 0;
    spark_progressFill.style.width = spark_pct + '%';
    if (spark_progressBar) {
      spark_progressBar.setAttribute('aria-valuenow', Math.round(spark_pct));
    }
  }

  /* ── 네비 스크롤 상태 ── */
  const spark_nav = document.querySelector('.site-nav');

  function spark_updateNav() {
    if (!spark_nav) return;
    if (window.scrollY > 80) {
      spark_nav.classList.add('scrolled');
    } else {
      spark_nav.classList.remove('scrolled');
    }
  }

  /* ── IntersectionObserver 기반 섹션 reveal ── */
  const spark_revealEls = document.querySelectorAll('.reveal-section');

  if ('IntersectionObserver' in window) {
    const spark_observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          spark_observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    spark_revealEls.forEach(function (el) { spark_observer.observe(el); });
  } else {
    /* 옵저버 미지원: 모두 표시 */
    spark_revealEls.forEach(function (el) { el.classList.add('revealed'); });
  }

  /* ── Lenis + GSAP ScrollTrigger 설정 ── */
  const spark_prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let spark_lenis = null;

  if (!spark_prefersReduced && typeof Lenis !== 'undefined') {
    spark_lenis = new Lenis({
      duration: 1.2,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }
    });

    if (typeof ScrollTrigger !== 'undefined') {
      spark_lenis.on('scroll', ScrollTrigger.update);
    }

    if (typeof gsap !== 'undefined') {
      gsap.ticker.add(function (time) { spark_lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* ── GSAP 카드 stagger reveal (ScrollTrigger) ── */
  if (!spark_prefersReduced && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    /* 프로그램 카드 순차 등장 */
    const spark_cards = document.querySelectorAll('.program-card');
    if (spark_cards.length) {
      gsap.fromTo(
        spark_cards,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.programs-grid',
            start: 'top 82%',
            once: true,
          },
          clearProps: 'transform,opacity',
        }
      );
    }

    /* 방문 안내 행 순차 등장 */
    const spark_rows = document.querySelectorAll('.visit-row');
    if (spark_rows.length) {
      gsap.fromTo(
        spark_rows,
        { opacity: 0, x: -20 },
        {
          opacity: 1, x: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.visit-details',
            start: 'top 85%',
            once: true,
          },
          clearProps: 'transform,opacity',
        }
      );
    }
  } else if (spark_prefersReduced) {
    /* reduced-motion: 모든 카드/행 즉시 표시 */
    document.querySelectorAll('.program-card, .visit-row').forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  /* ── 스크롤 이벤트 묶기 ── */
  window.addEventListener('scroll', function () {
    spark_updateProgress();
    spark_updateNav();
  }, { passive: true });

  spark_updateProgress();
  spark_updateNav();

  /* ── 부드러운 앵커 이동 (Lenis 우선, 폴백 네이티브) ── */
  document.querySelectorAll('a[href^="#"]').forEach(function (spark_link) {
    spark_link.addEventListener('click', function (e) {
      const spark_targetId = spark_link.getAttribute('href');
      if (spark_targetId === '#') return;
      const spark_targetEl = document.querySelector(spark_targetId);
      if (!spark_targetEl) return;
      e.preventDefault();
      if (spark_lenis) {
        spark_lenis.scrollTo(spark_targetEl, { offset: -80, duration: 1.4 });
      } else {
        const spark_yPos = spark_targetEl.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: spark_yPos });
      }
    });
  });

})();
