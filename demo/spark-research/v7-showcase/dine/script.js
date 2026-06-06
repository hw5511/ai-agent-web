/**
 * 절기(節氣) — script.js
 * VISUAL_MECHANISM: 타입·이미지 스크램블 / 셔플
 * FLOOR: 모든 animated frame은 transform/opacity만 변경
 *        Lenis guard, reduced-motion 처리 포함
 */

'use strict';

/* ─────────────────────────────────────────────
   Utility: prefers-reduced-motion 감지
───────────────────────────────────────────── */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─────────────────────────────────────────────
   Lenis — 스무스 스크롤 초기화
   FLOOR: html에 scroll-behavior:smooth 대신 Lenis 사용
───────────────────────────────────────────── */
let lenis;

function initLenis() {
  if (prefersReducedMotion) return;

  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
  });

  // GSAP ticker integration
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // ScrollTrigger sync
  lenis.on('scroll', ScrollTrigger.update);
}

/* ─────────────────────────────────────────────
   HERO — 스크램블 / 셔플 메커니즘
   VISUAL_MECHANISM: 타입·이미지 스크램블 / 셔플
   FLOOR: transform/opacity만 변경, NO filter/blur on moving layers
───────────────────────────────────────────── */

// 절기 글자 풀 — 24개 절기명에서 추출된 한자 글자들
const JEOIGI_CHARS = [
  '立','春','雨','水','驚','蟄','春','分','淸','明',
  '穀','雨','立','夏','小','滿','芒','種','夏','至',
  '小','暑','大','暑','立','秋','處','暑','白','露',
  '秋','分','寒','露','霜','降','立','冬','小','雪',
  '大','雪','冬','至','小','寒','大','寒',
  '절','기','節','氣','봄','여','름','가','을','겨','울','사','계'
];

const KOREAN_JEOIGI = [
  '입춘','우수','경칩','춘분','청명','곡우',
  '입하','소만','망종','하지','소서','대서',
  '입추','처서','백로','추분','한로','상강',
  '입동','소설','대설','동지','소한','대한'
];

function initScramble() {
  if (prefersReducedMotion) return;

  const stage = document.getElementById('scrambleStage');
  const staticMark = document.getElementById('heroStaticMark');
  if (!stage || !staticMark) return;

  const stageRect = () => stage.getBoundingClientRect();
  let rect = stageRect();

  // Create scramble chars — spawn a pool of floating characters
  const CHAR_COUNT = 18;
  const chars = [];

  // Build all chars at once (DOM write batch)
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < CHAR_COUNT; i++) {
    const el = document.createElement('span');
    el.className = 'scramble-char';
    const char = JEOIGI_CHARS[Math.floor(Math.random() * JEOIGI_CHARS.length)];
    el.textContent = char;

    const fontSize = Math.random() * 2.5 + 0.7; // 0.7rem ~ 3.2rem
    el.style.fontSize = fontSize + 'rem';
    el.style.fontWeight = Math.random() > 0.5 ? '700' : '300';

    // Initial position (random, spread across center stage)
    const x = Math.random() * 80 + 5;  // 5% ~ 85%
    const y = Math.random() * 80 + 5;  // 5% ~ 85%
    el.style.left = x + '%';
    el.style.top = y + '%';

    fragment.appendChild(el);
    chars.push({ el, x, y, fontSize, vx: 0, vy: 0, life: 0, maxLife: 0, char });
  }

  stage.appendChild(fragment);

  // Hide static mark once JS chars are ready
  staticMark.style.opacity = '0';

  // Staggered entrance — transform/opacity only
  chars.forEach((c, i) => {
    gsap.fromTo(c.el,
      { opacity: 0, y: 20 },
      {
        opacity: () => Math.random() * 0.18 + 0.04,
        y: 0,
        delay: i * 0.08 + 0.3,
        duration: 0.7,
        ease: 'power2.out',
      }
    );
  });

  // Periodic shuffle — reassign chars to new positions + new glyph
  // Only changes transform (via gsap.to with x/y) and opacity — THE LAW satisfied
  function shuffleChar(c) {
    const newChar = JEOIGI_CHARS[Math.floor(Math.random() * JEOIGI_CHARS.length)];
    const newX = Math.random() * 82 + 4;
    const newY = Math.random() * 82 + 4;
    const newOpacity = Math.random() * 0.22 + 0.04;
    const dur = Math.random() * 0.8 + 0.5;

    gsap.to(c.el, {
      opacity: 0,
      duration: dur * 0.4,
      ease: 'power1.in',
      onComplete: () => {
        // DOM write: text + position (not animated, so no layout during animation)
        c.el.textContent = newChar;
        c.el.style.left = newX + '%';
        c.el.style.top = newY + '%';
        gsap.to(c.el, {
          opacity: newOpacity,
          duration: dur * 0.6,
          ease: 'power2.out',
        });
      }
    });
  }

  // Stagger shuffle cycles per char with randomised intervals
  chars.forEach((c, i) => {
    function cycle() {
      if (!document.hidden) {
        shuffleChar(c);
      }
      // Next shuffle: 2s to 8s random
      setTimeout(cycle, Math.random() * 6000 + 2000);
    }
    // Stagger first shuffle so they don't all fire at once
    setTimeout(cycle, i * 300 + 1500);
  });

  // On hero section resize, no layout reflow needed — chars use % positioning
  // so they naturally adapt.
}

/* ─────────────────────────────────────────────
   HERO HEADLINE — controlled scramble on load
   The visible headline text stays in DOM always
───────────────────────────────────────────── */
function initHeadlineEntrance() {
  if (prefersReducedMotion) return;

  const headline = document.getElementById('heroHeadline');
  if (!headline) return;

  // Simple entrance: opacity + translateY (THE LAW: only transform/opacity)
  gsap.from(headline, {
    opacity: 0,
    y: 30,
    duration: 1.1,
    delay: 0.6,
    ease: 'power3.out',
  });

  const eyebrow = document.querySelector('.hero__eyebrow');
  const desc = document.querySelector('.hero__desc');
  const cta = document.querySelector('.hero .cta-primary');
  const enLabel = document.querySelector('.hero__headline-en');
  const seasonTag = document.querySelector('.hero__season-tag');
  const trackIndex = document.querySelector('.hero__track-index');

  const targets = [trackIndex, seasonTag, eyebrow, enLabel, desc, cta].filter(Boolean);
  gsap.from(targets, {
    opacity: 0,
    y: 20,
    duration: 0.8,
    delay: 0.3,
    stagger: 0.1,
    ease: 'power2.out',
  });
}

/* ─────────────────────────────────────────────
   SCROLL REVEALS — ScrollTrigger
   Only transform + opacity (THE LAW)
───────────────────────────────────────────── */
function initReveal() {
  if (prefersReducedMotion) {
    // Immediately make all reveals visible — FLOOR requirement
    document.querySelectorAll('.reveal').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const reveals = document.querySelectorAll('.reveal');

  reveals.forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
        }
      }
    );
  });

  // Track items — slight stagger per list
  const trackLists = document.querySelectorAll('.course__tracks');
  trackLists.forEach(list => {
    const items = list.querySelectorAll('.track');
    gsap.fromTo(items,
      { opacity: 0, x: -16 },
      {
        opacity: 1,
        x: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: list,
          start: 'top 85%',
          once: true,
        }
      }
    );
  });
}

/* ─────────────────────────────────────────────
   DISH ITEMS — subtle parallax on scroll
   FLOOR: only transform changes per frame
───────────────────────────────────────────── */
function initDishParallax() {
  if (prefersReducedMotion) return;

  const items = document.querySelectorAll('.dish-item');
  items.forEach((item, i) => {
    const speed = (i % 2 === 0) ? -20 : 20;
    gsap.fromTo(item,
      { y: speed },
      {
        y: -speed,
        ease: 'none',
        scrollTrigger: {
          trigger: item,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        }
      }
    );
  });
}

/* ─────────────────────────────────────────────
   MOBILE NAV toggle
───────────────────────────────────────────── */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('mobile-menu');
  const closeBtn = document.querySelector('.mobile-menu__close');
  if (!toggle || !menu) return;

  function openMenu() {
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    menu.querySelector('a')?.focus();
  }

  function closeMenu() {
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.focus();
  }

  toggle.addEventListener('click', openMenu);
  closeBtn?.addEventListener('click', closeMenu);

  // Close on nav link click
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeMenu);
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      closeMenu();
    }
  });
}

/* ─────────────────────────────────────────────
   HEADER — scroll state
───────────────────────────────────────────── */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let lastY = 0;
  let ticking = false;

  function updateHeader() {
    const y = window.scrollY;
    if (y > 60) {
      header.style.borderBottomColor = 'rgba(28,21,8,0.18)';
    } else {
      header.style.borderBottomColor = 'rgba(28,21,8,0.12)';
    }
    lastY = y;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });
}

/* ─────────────────────────────────────────────
   FOOTER YEAR
───────────────────────────────────────────── */
function updateFooterYear() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
}

/* ─────────────────────────────────────────────
   BOOT
───────────────────────────────────────────── */
function boot() {
  initLenis();
  initMobileNav();
  initHeaderScroll();
  updateFooterYear();

  // Motion-dependent after GSAP + Lenis ready
  if (!prefersReducedMotion) {
    gsap.registerPlugin(ScrollTrigger);

    // If Lenis is active, proxy scroll for ScrollTrigger
    if (lenis) {
      ScrollTrigger.scrollerProxy(document.documentElement, {
        scrollTop(value) {
          if (arguments.length) {
            lenis.scrollTo(value, { immediate: true });
          }
          return lenis.scroll;
        },
        getBoundingClientRect() {
          return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight
          };
        },
        pinType: document.documentElement.style.transform ? 'transform' : 'fixed'
      });
    }
  }

  initHeadlineEntrance();
  initScramble();
  initReveal();
  initDishParallax();

  if (!prefersReducedMotion && lenis) {
    ScrollTrigger.addEventListener('refresh', () => lenis.resize());
    ScrollTrigger.refresh();
  }
}

// Wait for DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
