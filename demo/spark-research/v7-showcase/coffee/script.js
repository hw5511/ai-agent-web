/*!
 * 정오 로스터리 — script.js
 * GOVERNING METAPHOR: 스크롤 = 영화 타임라인 (필름이 감기며 로스팅이 전개된다)
 * VISUAL_MECHANISM: 실물 오브젝트 메타포 (일조계 다이얼 — 계기판)
 * MACRO_STRUCTURE: 중앙 거대 단일 오브젝트(다이얼) + 위성 배치
 * PERSONA: 보태니컬 세밀화가 (정밀·절제·주석 방식)
 *
 * PERFORMANCE LAW: every animated frame changes only transform/opacity
 * NO blur/filter/shadow on any moving layer
 */

'use strict';

/* ============================================================
   Lenis — smooth scroll guard
   ============================================================ */
let lenis;

function initLenis() {
  // Guard: do not init if reduced-motion preference is set
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
  });

  // Connect Lenis to GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}

/* ============================================================
   Footer year
   ============================================================ */
function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ============================================================
   Draw dial tick marks (SVG, botanical illustration style)
   ============================================================ */
function drawDialTicks() {
  const tickGroup = document.querySelector('.dial-ticks');
  if (!tickGroup) return;

  const cx = 240;
  const cy = 240;
  const outerR = 220;

  // 72 ticks (every 5 degrees), 12 major (every 30 degrees)
  for (let i = 0; i < 72; i++) {
    const angleDeg = i * 5 - 90; // start from top (noon position)
    const angleRad = (angleDeg * Math.PI) / 180;
    const isMajor = i % 6 === 0;
    const tickLen = isMajor ? 16 : 8;

    const x1 = cx + outerR * Math.cos(angleRad);
    const y1 = cy + outerR * Math.sin(angleRad);
    const x2 = cx + (outerR - tickLen) * Math.cos(angleRad);
    const y2 = cy + (outerR - tickLen) * Math.sin(angleRad);

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1.toFixed(2));
    line.setAttribute('y1', y1.toFixed(2));
    line.setAttribute('x2', x2.toFixed(2));
    line.setAttribute('y2', y2.toFixed(2));
    line.setAttribute('stroke-width', isMajor ? '1.5' : '0.8');
    line.setAttribute('stroke-linecap', 'round');
    tickGroup.appendChild(line);
  }
}

/* ============================================================
   Hero entrance animation
   ============================================================ */
function animateHeroEntrance() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Hero copy slides in from left + fade (from-state set only when GSAP runs;
  // if the library fails to load, CSS leaves these visible -> no blank hero)
  tl.from('.hero-copy', {
    opacity: 0,
    y: 20,
    duration: 1.0,
    delay: 0.2,
  });

  // Dial wraps fades + rises slightly
  tl.from('.hero-dial-wrap', {
    opacity: 0,
    y: 20,
    duration: 1.1,
    ease: 'power2.out',
  }, '-=0.6');
}

/* ============================================================
   Dial — slow rotation on scroll (transform only, no other props)
   VISUAL_MECHANISM: 계기판이 스크롤에 따라 조금씩 회전
   ============================================================ */
function animateDial() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const dialSvg = document.querySelector('.dial-svg');
  if (!dialSvg) return;

  // Rotate the dial as the user scrolls down the page
  // Only transform:rotate — composite-only, no layout/paint
  ScrollTrigger.create({
    trigger: 'body',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      // Rotate max 120deg over the full page scroll
      // Using transform only — THE LAW satisfied
      const rotation = self.progress * 120;
      gsap.set(dialSvg, { rotation: rotation, transformOrigin: '50% 50%' });
    },
  });
}

/* ============================================================
   Timeline chapters — scroll-triggered reveal
   WILD_CONCEPT: 스크롤 = 영화의 타임라인
   Each chapter = a film frame revealed sequentially
   ============================================================ */
function animateTimeline() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const chapters = document.querySelectorAll('.timeline-chapter');
  chapters.forEach((chapter, i) => {
    if (prefersReduced) {
      // FLOOR: immediately show in final state
      chapter.style.opacity = '1';
      chapter.style.transform = 'none';
      return;
    }

    gsap.to(chapter, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: chapter,
        start: 'top 82%',
        toggleActions: 'play none none none',
      },
      delay: i * 0.08,
    });
  });
}

/* ============================================================
   Origin cards — staggered reveal
   ============================================================ */
function animateOriginCards() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const cards = document.querySelectorAll('.origin-card');
  if (prefersReduced) {
    cards.forEach((c) => {
      c.style.opacity = '1';
      c.style.transform = 'none';
    });
    return;
  }

  gsap.to(cards, {
    opacity: 1,
    y: 0,
    duration: 0.75,
    ease: 'power2.out',
    stagger: 0.12,
    scrollTrigger: {
      trigger: '.origin-grid',
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
  });
}

/* ============================================================
   Roasting section visual reveal
   ============================================================ */
function animateRoastingVisual() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const roastingVisual = document.querySelector('.roasting-visual');
  if (!roastingVisual) return;

  if (prefersReduced) {
    roastingVisual.style.opacity = '1';
    roastingVisual.style.transform = 'none';
    return;
  }

  gsap.to(roastingVisual, {
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.roasting-inner',
      start: 'top 75%',
      toggleActions: 'play none none none',
    },
  });
}

/* ============================================================
   Plan cards reveal
   ============================================================ */
function animatePlanCards() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const cards = document.querySelectorAll('.plan-card');
  if (prefersReduced) {
    cards.forEach((c) => {
      c.style.opacity = '1';
      c.style.transform = 'none';
    });
    return;
  }

  gsap.to(cards, {
    opacity: 1,
    y: 0,
    duration: 0.75,
    ease: 'power2.out',
    stagger: 0.1,
    scrollTrigger: {
      trigger: '.plan-grid',
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
  });
}

/* ============================================================
   Visit section reveal
   ============================================================ */
function animateVisit() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const els = [
    document.querySelector('.visit-photo-wrap'),
    document.querySelector('.visit-text'),
  ].filter(Boolean);

  if (prefersReduced) {
    els.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  gsap.to(els, {
    opacity: 1,
    y: 0,
    duration: 0.85,
    ease: 'power2.out',
    stagger: 0.15,
    scrollTrigger: {
      trigger: '.visit-inner',
      start: 'top 78%',
      toggleActions: 'play none none none',
    },
  });
}

/* ============================================================
   Header scroll state — add border emphasis on scroll
   (only opacity of a border-bottom — no layout props animated)
   ============================================================ */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  // Using opacity via JS class toggle — no rAF, no layout change on scroll
  ScrollTrigger.create({
    start: 'top -60',
    onEnter: () => header.classList.add('scrolled'),
    onLeaveBack: () => header.classList.remove('scrolled'),
  });
}

/* ============================================================
   DOMContentLoaded — boot sequence
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  setYear();
  drawDialTicks();

  // Register ScrollTrigger plugin with GSAP
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Init Lenis (after GSAP so ticker is ready)
  if (typeof Lenis !== 'undefined') {
    initLenis();
  }

  // Animations
  animateHeroEntrance();
  animateDial();
  animateTimeline();
  animateOriginCards();
  animateRoastingVisual();
  animatePlanCards();
  animateVisit();
  initHeaderScroll();
});
