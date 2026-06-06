/**
 * 여백 (YEOBAG) — script.js
 * MECHANISM: Cutout / parallax depth layers
 * MACRO: Full-screen interactive stage
 * All animated frames: transform / opacity ONLY (THE LAW)
 * No blur/shadow/filter/blend on any moving layer
 */

/* ── Lenis smooth scroll ── */
const lenis = new Lenis({
  duration: 1.1,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
});

function rafLoop(time) {
  lenis.raf(time);
  requestAnimationFrame(rafLoop);
}
requestAnimationFrame(rafLoop);

// Connect Lenis to GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.lagSmoothing(0);

/* ── GSAP + ScrollTrigger registration ── */
gsap.registerPlugin(ScrollTrigger);

/* ── Reduced motion guard ── */
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
   PARALLAX DEPTH — cutout layer system
   Each layer moves at a different rate relative to scroll.
   Only transform is changed per frame (THE LAW compliant).
   No blur/shadow/filter/blend on any moving layer.
   ============================================================ */
function initParallax() {
  if (prefersReduced) return;

  const stage = document.getElementById('parallaxStage');
  if (!stage) return;

  const layers = stage.querySelectorAll('.layer[data-depth]');

  // Scroll-driven parallax via GSAP ScrollTrigger
  layers.forEach((layer) => {
    const depth = parseFloat(layer.dataset.depth) || 0;
    const yRange = depth * 120; // pixels of travel

    gsap.to(layer, {
      y: yRange,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6,
      },
    });
  });
}

/* ============================================================
   HERO MOUSE PARALLAX
   Subtle shift of layers on mouse move within hero.
   Only transform changes per frame (no blur/shadow/filter).
   Uses requestAnimationFrame with read-then-write to avoid
   forced reflow.
   ============================================================ */
function initMouseParallax() {
  if (prefersReduced) return;

  const hero = document.querySelector('.hero');
  if (!hero) return;

  const layers = hero.querySelectorAll('.layer[data-depth]');

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let rafId = null;
  let isHovering = false;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function tick() {
    if (!isHovering && Math.abs(currentX) < 0.01 && Math.abs(currentY) < 0.01) {
      rafId = null;
      return;
    }

    // Lerp toward target (smooth follow)
    currentX = lerp(currentX, targetX, 0.06);
    currentY = lerp(currentY, targetY, 0.06);

    // Write: only transform, no layout/paint triggers
    layers.forEach((layer) => {
      const depth = parseFloat(layer.dataset.depth) || 0;
      const shiftX = currentX * depth * 18;
      const shiftY = currentY * depth * 10;
      // Set CSS custom property, apply in transform
      layer.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
    });

    rafId = requestAnimationFrame(tick);
  }

  hero.addEventListener('mousemove', (e) => {
    // Read phase (no write here)
    const rect = hero.getBoundingClientRect();
    targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    isHovering = true;

    if (!rafId) {
      rafId = requestAnimationFrame(tick);
    }
  });

  hero.addEventListener('mouseleave', () => {
    isHovering = false;
    targetX = 0;
    targetY = 0;
    if (!rafId) {
      rafId = requestAnimationFrame(tick);
    }
  });
}

/* ============================================================
   HEADER SCROLL STATE
   Adds .scrolled class when past hero.
   Uses ScrollTrigger (composite-safe, no per-frame DOM reads).
   ============================================================ */
function initHeaderState() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  ScrollTrigger.create({
    trigger: '.hero',
    start: 'bottom 80%',
    onEnter: () => header.classList.add('scrolled'),
    onLeaveBack: () => header.classList.remove('scrolled'),
  });
}

/* ============================================================
   REVEAL ANIMATIONS — scroll-triggered
   Only opacity + transform (THE LAW compliant).
   ============================================================ */
function initReveal() {
  if (prefersReduced) {
    // Immediately show all — CSS handles this via media query,
    // but be explicit for JS-driven classes too.
    document.querySelectorAll('.reveal, .book-card').forEach((el) => {
      el.classList.add('is-visible');
    });
    return;
  }

  // Book cards: staggered per group
  document.querySelectorAll('.gallery').forEach((gallery) => {
    const cards = gallery.querySelectorAll('.book-card');
    ScrollTrigger.create({
      trigger: gallery,
      start: 'top 82%',
      onEnter: () => {
        gsap.to(cards, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.1,
          onStart: () => cards.forEach((c) => c.classList.add('is-visible')),
        });
      },
      once: true,
    });
  });

  // Program cards: staggered
  document.querySelectorAll('.programs__grid .reveal').forEach((el, i) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.65,
          delay: i * 0.12,
          ease: 'power2.out',
          onStart: () => el.classList.add('is-visible'),
        });
      },
      once: true,
    });
  });

  // Visit section reveals
  document.querySelectorAll('.visit .reveal').forEach((el, i) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      onEnter: () => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          delay: i * 0.15,
          ease: 'power2.out',
          onStart: () => el.classList.add('is-visible'),
        });
      },
      once: true,
    });
  });
}

/* ============================================================
   HERO INTRO ANIMATION
   Layers stagger in on load — only opacity + transform.
   ============================================================ */
function initHeroIntro() {
  if (prefersReduced) return;

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Frame bars slide in from edges
  tl.from('.frame-bar--top', { y: '-100%', duration: 1.1 }, 0)
    .from('.frame-bar--bottom', { y: '100%', duration: 1.1 }, 0)
    // Eyebrow + title fade up
    .from('.hero__eyebrow', { opacity: 0, y: 20, duration: 0.8 }, 0.5)
    .from('.hero__title-line', {
      opacity: 0,
      y: 40,
      duration: 0.9,
      stagger: 0.1,
    }, 0.65)
    .from('.hero__subtitle', { opacity: 0, y: 16, duration: 0.7 }, 0.9)
    // HUD corners fade in last
    .from('.hud__corner', {
      opacity: 0,
      duration: 0.6,
      stagger: 0.08,
    }, 1.1)
    .from('.hero__cta-block', { opacity: 0, y: 10, duration: 0.5 }, 1.3)
    .from('.hero__scroll-hint', { opacity: 0, duration: 0.5 }, 1.5);
}

/* ============================================================
   SECTION NUMBER COUNTER (tabular, no layout impact)
   Purely a visual enhancement; numbers are already in DOM.
   ============================================================ */

/* ============================================================
   SMOOTH ANCHOR SCROLL
   Let Lenis handle it; just prevent default.
   ============================================================ */
function initAnchorScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -64, duration: 1.2 });
    });
  });
}

/* ============================================================
   INIT
   ============================================================ */
function init() {
  initHeroIntro();
  initParallax();
  initMouseParallax();
  initHeaderState();
  initReveal();
  initAnchorScroll();
}

// Run after DOM + fonts are ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
