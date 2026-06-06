/**
 * 흙손 공방 — script.js
 * PERSONA: 데이터 시각화 저널리스트
 * VISUAL_MECHANISM: 그리드·셀 디스토션 / 픽셀 정렬
 * GOVERNING_METAPHOR: 게슈탈트 폐쇄성 × 분청사기
 *
 * PERF LAW: 모든 animated value는 transform/opacity만.
 * 이동하는 레이어에 blur/shadow/filter/blend 없음.
 */

'use strict';

/* ============================================================
   LENIS — smooth scroll init (FLOOR guard included in CSS)
   ============================================================ */
function initLenis() {
  if (typeof Lenis === 'undefined') return;

  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
  });

  // GSAP ticker integration
  if (typeof gsap !== 'undefined') {
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  return lenis;
}

/* ============================================================
   HERO CANVAS — 그리드 셀 디스토션 / 픽셀 정렬
   게슈탈트 폐쇄성: 셀들이 분산되어 있다가 항아리 형태로 수렴

   PERF LAW compliant:
   - Canvas 2D fillRect — paint는 canvas 내부, composite layer
   - 매 프레임 변하는 건 canvas 내부 drawImage 뿐
   - canvas element 자체는 translate 없이 static position
   ============================================================ */
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const fallback = canvas.parentElement.querySelector('.hero-fallback-img');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Show fallback if canvas context fails
  if (!ctx) {
    if (fallback) fallback.style.opacity = '1';
    return;
  }

  // Vessel silhouette as a set of grid cells (gestalt closure)
  // Cells that are "on" form the implied vessel shape
  // Grid: 14 cols x 20 rows — vessel outline cells
  const COLS = 14;
  const ROWS = 20;

  // Vessel mask — 1 = cell participates in vessel shape, 0 = empty
  // This forms an abstract buncheong vessel / onggi jar silhouette
  // read as [row][col], origin top-left
  const VESSEL_MASK = [
    [0,0,0,0,1,1,1,1,1,1,0,0,0,0], // 0
    [0,0,0,1,1,0,0,0,0,1,1,0,0,0], // 1
    [0,0,1,1,0,0,0,0,0,0,1,1,0,0], // 2
    [0,0,1,0,0,0,0,0,0,0,0,1,0,0], // 3
    [0,1,1,0,0,0,0,0,0,0,0,1,1,0], // 4 widest shoulder
    [0,1,0,0,0,0,0,0,0,0,0,0,1,0], // 5
    [1,1,0,0,0,0,0,0,0,0,0,0,1,1], // 6
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1], // 7
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1], // 8
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1], // 9 widest body
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1], // 10
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1], // 11
    [1,1,0,0,0,0,0,0,0,0,0,0,1,1], // 12
    [0,1,0,0,0,0,0,0,0,0,0,0,1,0], // 13
    [0,1,1,0,0,0,0,0,0,0,0,1,1,0], // 14 tapering
    [0,0,1,1,0,0,0,0,0,0,1,1,0,0], // 15
    [0,0,0,1,1,0,0,0,0,1,1,0,0,0], // 16
    [0,0,0,0,1,1,1,1,1,1,0,0,0,0], // 17 base
    [0,0,0,0,0,1,1,1,1,0,0,0,0,0], // 18
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0], // 19
  ];

  // Cell state: each active cell has a position and a "dispersal" offset
  const cells = [];

  function buildCells() {
    cells.length = 0;
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (VESSEL_MASK[row][col] === 1) {
          // Random initial dispersion offset (the "fragmented" state)
          const angle = Math.random() * Math.PI * 2;
          const dist = 80 + Math.random() * 180;
          cells.push({
            col,
            row,
            // Dispersal offset
            ox: Math.cos(angle) * dist,
            oy: Math.sin(angle) * dist,
            // Current interpolated offset (starts at full dispersion)
            cx: 0,
            cy: 0,
            // Opacity
            alpha: 0,
            // Slight size jitter for texture
            sizeJitter: 0.7 + Math.random() * 0.6,
            // Phase offset for subtle flicker (static shimmer)
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
    }
  }

  let width = 0;
  let height = 0;
  let cellW = 0;
  let cellH = 0;
  let originX = 0;
  let originY = 0;

  function resize() {
    const parent = canvas.parentElement;
    width = parent.offsetWidth;
    height = parent.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    // Cell size based on available space
    const gridW = width * 0.65;
    const gridH = height * 0.75;
    cellW = gridW / COLS;
    cellH = gridH / ROWS;

    // Center the vessel grid
    originX = (width - gridW) / 2;
    originY = (height - gridH) / 2;

    buildCells();
    if (prefersReduced) {
      // Snap to final state immediately
      cells.forEach((cell) => {
        cell.cx = 0;
        cell.cy = 0;
        cell.alpha = 1;
      });
    }
  }

  // Progress: 0 = fully dispersed, 1 = fully closed/formed
  let progress = 0;
  let animating = false;
  let rafId = null;

  // Entrance animation — cells converge to form the vessel
  function startEntrance() {
    if (prefersReduced) {
      progress = 1;
      cells.forEach((cell) => {
        cell.cx = 0;
        cell.cy = 0;
        cell.alpha = 1;
      });
      drawFrame(0);
      return;
    }

    animating = true;
    let start = null;
    const DURATION = 2200; // ms

    function step(ts) {
      if (!start) start = ts;
      const elapsed = ts - start;
      // Ease out expo
      const raw = Math.min(elapsed / DURATION, 1);
      progress = 1 - Math.pow(2, -10 * raw);

      drawFrame(ts);

      if (raw < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        animating = false;
        progress = 1;
        // Start idle shimmer
        idleShimmer(ts);
      }
    }

    rafId = requestAnimationFrame(step);
  }

  // Idle: subtle cell alpha flicker (opacity only — no position change)
  // PERF LAW: only opacity changes in idle (no transform on canvas layer)
  function idleShimmer(startTs) {
    function step(ts) {
      drawFrame(ts);
      rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);
  }

  // Color palette — 분청사기 백토 / 철화 / 재
  const CELL_COLORS = [
    '#C8BFB0', // 백토 회
    '#B5AA9A', // 분청 중간 회
    '#8A7E6E', // 철화 갈
    '#D6CFCA', // 백토 밝음
    '#5C4F3A', // 먹 갈
  ];

  function getCellColor(col, row, alpha) {
    // Deterministic but varied color per cell position
    const idx = (col * 3 + row * 7) % CELL_COLORS.length;
    return CELL_COLORS[idx];
  }

  function drawFrame(ts) {
    ctx.clearRect(0, 0, width, height);

    // Background — static gradient (not animated, PERF OK)
    // Only drawn once conceptually — cheap radial gradient on static layer
    const bg = ctx.createRadialGradient(
      width * 0.5, height * 0.5, 0,
      width * 0.5, height * 0.5, Math.max(width, height) * 0.7
    );
    bg.addColorStop(0, '#EDE8E0');
    bg.addColorStop(1, '#DDD6CC');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    cells.forEach((cell) => {
      // Interpolate cx/cy toward 0 (closed form) based on progress
      const targetCx = 0;
      const targetCy = 0;
      cell.cx = cell.ox * (1 - progress);
      cell.cy = cell.oy * (1 - progress);

      // Alpha: cells fade in as they converge
      const baseAlpha = progress;
      // Idle shimmer — opacity only, safe
      const shimmer = prefersReduced
        ? 0
        : Math.sin((ts * 0.0008) + cell.phase) * 0.06;
      cell.alpha = Math.max(0, Math.min(1, baseAlpha + shimmer));

      // Final cell position
      const finalX = originX + cell.col * cellW;
      const finalY = originY + cell.row * cellH;
      const drawX = finalX + cell.cx;
      const drawY = finalY + cell.cy;

      const w = cellW * cell.sizeJitter - 2;
      const h = cellH * cell.sizeJitter - 2;

      ctx.globalAlpha = cell.alpha;
      ctx.fillStyle = getCellColor(cell.col, cell.row, cell.alpha);
      ctx.fillRect(
        drawX + (cellW - w) / 2,
        drawY + (cellH - h) / 2,
        w,
        h
      );

      // Thin border — lighter cells get a hairline
      if (cell.alpha > 0.5) {
        ctx.globalAlpha = cell.alpha * 0.35;
        ctx.strokeStyle = 'rgba(90, 80, 60, 0.4)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(
          drawX + (cellW - w) / 2,
          drawY + (cellH - h) / 2,
          w,
          h
        );
      }
    });

    ctx.globalAlpha = 1;
  }

  // Resize handler
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (rafId) cancelAnimationFrame(rafId);
      resize();
      if (progress >= 1) {
        idleShimmer(performance.now());
      } else {
        startEntrance();
      }
    }, 120);
  });

  // Initialize
  resize();
  // Short delay so hero text renders first
  setTimeout(startEntrance, 300);

  // Hide fallback once canvas is running
  if (fallback) fallback.style.opacity = '0';
}

/* ============================================================
   GSAP SCROLL REVEALS
   PERF LAW: only transform (translateY/translateX) + opacity
   No blur, no shadow, no filter on animated elements
   ============================================================ */
function initScrollReveals() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger);

  // Reveal up
  gsap.utils.toArray('.reveal-up').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // Reveal left
  gsap.utils.toArray('.reveal-left').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, x: -32 },
      {
        opacity: 1,
        x: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // Reveal right
  gsap.utils.toArray('.reveal-right').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, x: 32 },
      {
        opacity: 1,
        x: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // Stagger gallery cells
  const galleryCells = gsap.utils.toArray('.gallery-cell');
  if (galleryCells.length) {
    gsap.fromTo(
      galleryCells,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.gallery-grid',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );
    // Remove individual reveal-up from gallery cells to avoid conflict
    galleryCells.forEach((c) => c.classList.remove('reveal-up'));
  }
}

/* ============================================================
   STAT COUNTER — count up animation
   PERF LAW: only textContent changes (DOM, not CSS property)
   ============================================================ */
function initStatCounters() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const items = document.querySelectorAll('.stat-num[data-target]');
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);

        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const start = performance.now();
        const DURATION = 1400;

        function tick(ts) {
          const elapsed = ts - start;
          const raw = Math.min(elapsed / DURATION, 1);
          // Ease out cubic
          const eased = 1 - Math.pow(1 - raw, 3);
          el.textContent = Math.round(eased * target).toLocaleString('ko-KR');

          if (raw < 1) {
            requestAnimationFrame(tick);
          } else {
            el.textContent = target.toLocaleString('ko-KR');
          }
        }

        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.5 }
  );

  items.forEach((el) => observer.observe(el));
}

/* ============================================================
   MOBILE MENU TOGGLE
   ============================================================ */
function initMobileMenu() {
  const btn = document.querySelector('.nav-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    if (expanded) {
      menu.hidden = true;
    } else {
      menu.hidden = false;
    }
  });

  // Close menu on link click
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ============================================================
   HEADER SCROLL STATE
   ============================================================ */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let lastY = 0;
  let ticking = false;

  window.addEventListener('scroll', () => {
    lastY = window.scrollY;
    if (!ticking) {
      requestAnimationFrame(() => {
        if (lastY > 60) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ============================================================
   EXHIBITION ITEM CELL DISTORTION (scroll-driven, transform only)
   On scroll, exhibition items get a subtle horizontal shift
   that reverses by direction — data-journalism data scroll feel
   ============================================================ */
function initExhibitionParallax() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('.exhibition-item').forEach((item, i) => {
    const dir = i % 2 === 0 ? 1 : -1;
    gsap.fromTo(
      item,
      { x: dir * 12 },
      {
        x: dir * -8,
        ease: 'none',
        scrollTrigger: {
          trigger: item,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
      }
    );
  });
}

/* ============================================================
   GESTALT CLOSURE — closure-grid cell reveal
   Cells in the contact section activate one by one, suggesting
   a vessel silhouette (gestalt closure in action)
   ============================================================ */
function initClosureGrid() {
  const grid = document.querySelector('.closure-grid');
  if (!grid) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cells = grid.querySelectorAll('.cg-f');
  if (!cells.length) return;

  // Initially hide filled cells
  cells.forEach((c) => {
    c.style.opacity = '0';
    c.style.transform = 'scale(0.5)';
    c.style.transition = 'opacity 0.4s, transform 0.4s';
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);

        cells.forEach((c, i) => {
          setTimeout(() => {
            c.style.opacity = '1';
            c.style.transform = 'scale(1)';
          }, i * 60);
        });
      });
    },
    { threshold: 0.3 }
  );

  observer.observe(grid);
}

/* ============================================================
   INIT
   ============================================================ */
function init() {
  initLenis();
  initHeroCanvas();
  initMobileMenu();
  initHeaderScroll();
  initStatCounters();

  // GSAP-dependent inits after a tick to ensure GSAP is ready
  if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    initScrollReveals();
    initExhibitionParallax();
  }

  initClosureGrid();
}

// DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
