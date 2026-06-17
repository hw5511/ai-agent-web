/* ===================================================
   GROOVE 회현 — script.js
   SPARK 씨드: 세로형텍스트×그리드교차 / 새벽서늘함
   DARING_MOVE: writing-mode 교차 + 안개 radial-gradient 커서
   60fps: transform/opacity만 / Lenis 필수
=================================================== */

'use strict';

/* ─── 전역 변수 (spark_ 접두사 필수) ─────────── */
const spark_fogEl     = document.getElementById('spark_fogCursor');
const spark_entryEl   = document.getElementById('spark_entry');
const spark_vinylEl   = document.getElementById('spark_vinylRing');
const spark_strip     = document.getElementById('spark_recordStrip');

let spark_rafId       = null;
let spark_mouseX      = 0;
let spark_mouseY      = 0;
let spark_targetX     = 0;
let spark_targetY     = 0;
let spark_lenis       = null;
let spark_gsapReady   = false;
let spark_initDone    = false;

/* ─── prefers-reduced-motion 감지 ────────────── */
const spark_prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─── 라이브러리 로드 대기 ────────────────────── */
function spark_waitForLibs(callback) {
  const interval = setInterval(() => {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && typeof Lenis !== 'undefined') {
      clearInterval(interval);
      callback();
    }
  }, 50);
}

/* ─── 안개 커서 (AESTHETIC_PINCH + DARING_MOVE) ─
   매 프레임 transform 대신 CSS custom property로
   background 위치를 바꾼다 — background-position은
   will-change: contents 없이 GPU에 올라가지 않으므로
   radial-gradient 중심을 CSS variable로 제어.
   레이아웃/페인트 재실행 없음 (background-position
   변경은 composite에서 처리되지 않으나 fog-cursor는
   독립 레이어이므로 허용 범위 내).
─────────────────────────────────────────────────── */
function spark_initFogCursor() {
  if (spark_prefersReducedMotion) {
    if (spark_fogEl) spark_fogEl.style.opacity = '0';
    return;
  }
  document.addEventListener('mousemove', (e) => {
    spark_targetX = (e.clientX / window.innerWidth)  * 100;
    spark_targetY = (e.clientY / window.innerHeight) * 100;
  });

  function spark_fogLoop() {
    spark_mouseX += (spark_targetX - spark_mouseX) * 0.06;
    spark_mouseY += (spark_targetY - spark_mouseY) * 0.06;
    if (spark_fogEl) {
      spark_fogEl.style.setProperty('--mx', spark_mouseX.toFixed(2) + '%');
      spark_fogEl.style.setProperty('--my', spark_mouseY.toFixed(2) + '%');
    }
    spark_rafId = requestAnimationFrame(spark_fogLoop);
  }
  spark_fogLoop();
}

/* ─── Lenis 초기화 ───────────────────────────── */
function spark_initLenis() {
  spark_lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });
  spark_lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    spark_lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}

/* ─── CTA 스크롤 (lenis.scrollTo — scrollIntoView 금지) */
function spark_initCTA() {
  const spark_ctaBtn = document.getElementById('spark_ctaBtn');
  if (!spark_ctaBtn) return;
  spark_ctaBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const spark_target = document.getElementById('spark_floor');
    if (spark_target && spark_lenis) {
      spark_lenis.scrollTo(spark_target, { offset: -40, duration: 1.6 });
    }
  });
}

/* ─── Entry 진입 애니메이션 ──────────────────── */
function spark_animateEntry() {
  if (spark_prefersReducedMotion) {
    document.querySelectorAll('.store-label, .site-title, .entry-sub, .entry-cta').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  const spark_tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  spark_tl
    .to('.store-label',  { opacity: 1, y: 0, duration: 0.9 }, 0.2)
    .to('.site-title',   { opacity: 1, y: 0, duration: 1.1 }, 0.45)
    .to('.entry-sub',    { opacity: 1, y: 0, duration: 0.9 }, 0.75)
    .to('.entry-cta',    { opacity: 1, y: 0, duration: 0.8 }, 0.95);
}

/* ─── 바이닐 배경 링 패럴랙스 ──────────────── */
function spark_initVinylParallax() {
  if (!spark_vinylEl || spark_prefersReducedMotion) return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.to(spark_vinylEl, {
    rotate: 120,
    ease: 'none',
    scrollTrigger: {
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
    },
  });
}

/* ─── Floor 셀 공개 ──────────────────────────── */
function spark_initFloorReveal() {
  if (spark_prefersReducedMotion) return;

  gsap.from('.cell-a', {
    opacity: 0,
    x: 40,
    duration: 1.1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.floor-section',
      start: 'top 75%',
      toggleActions: 'play none none none',
    },
  });

  gsap.from('.cell-b', {
    opacity: 0,
    x: -30,
    duration: 1.1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.floor-section',
      start: 'top 70%',
      toggleActions: 'play none none none',
    },
  });

  gsap.from('.mood-quote', {
    opacity: 0,
    y: 20,
    duration: 0.9,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.cell-d',
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
  });

  gsap.from('.genre-item', {
    opacity: 0,
    y: 16,
    stagger: 0.12,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.cell-e',
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
  });
}

/* ─── 레코드 카드 진입 애니 ─────────────────── */
function spark_initRecordCards() {
  if (spark_prefersReducedMotion) return;

  gsap.from('.record-card', {
    opacity: 0,
    y: 30,
    stagger: 0.15,
    duration: 1.0,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.spotlight-section',
      start: 'top 75%',
      toggleActions: 'play none none none',
    },
  });
}

/* ─── 방문 섹션 진입 ─────────────────────────── */
function spark_initVisit() {
  if (spark_prefersReducedMotion) return;

  gsap.from('.visit-text-col', {
    opacity: 0,
    x: -20,
    duration: 0.9,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.visit-section',
      start: 'top 75%',
      toggleActions: 'play none none none',
    },
  });

  gsap.from('.map-placeholder', {
    opacity: 0,
    x: 20,
    duration: 0.9,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.visit-section',
      start: 'top 75%',
      toggleActions: 'play none none none',
    },
  });

  /* 지도 점 pulse */
  const spark_mapDot = document.getElementById('spark_mapDot');
  if (spark_mapDot) {
    gsap.to(spark_mapDot, {
      scale: 1.3,
      repeat: -1,
      yoyo: true,
      duration: 1.4,
      ease: 'sine.inOut',
      transformOrigin: '50% 50%',
    });
  }
}

/* ─── INTERACTION_SPARK: 슬롯머신 당김 효과
   레코드 카드 hover 시 sleeve가 위로 살짝 드러나며
   새 "슬롯" 느낌을 준다 (INTERACTION_SPARK 당기기 미학)
   — transform/opacity만 사용 ─────────────────────── */
function spark_initSlotPull() {
  if (spark_prefersReducedMotion) return;

  document.querySelectorAll('.record-card').forEach((card) => {
    const spark_img = card.querySelector('.rc-sleeve img');
    const spark_info = card.querySelector('.rc-info');
    if (!spark_img || !spark_info) return;

    card.addEventListener('mouseenter', () => {
      gsap.to(spark_img, {
        y: -8,
        duration: 0.55,
        ease: 'back.out(1.4)',
        overwrite: 'auto',
      });
      gsap.to(spark_info, {
        y: -4,
        duration: 0.45,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(spark_img, {
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
        overwrite: 'auto',
      });
      gsap.to(spark_info, {
        y: 0,
        duration: 0.5,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    });
  });
}

/* ─── Spotlight 세로 텍스트 패럴랙스 (LAYOUT_SPARK) */
function spark_initSpotlightParallax() {
  if (spark_prefersReducedMotion) return;

  gsap.to('.sh-vertical', {
    y: -40,
    ease: 'none',
    scrollTrigger: {
      trigger: '.spotlight-section',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1,
    },
  });
}

/* ─── 초기화 진입점 ──────────────────────────── */
function spark_init() {
  if (spark_initDone) return;
  spark_initDone = true;

  spark_initFogCursor();
  spark_waitForLibs(() => {
    gsap.registerPlugin(ScrollTrigger);
    spark_initLenis();
    spark_initCTA();
    spark_animateEntry();
    spark_initVinylParallax();
    spark_initFloorReveal();
    spark_initRecordCards();
    spark_initVisit();
    spark_initSlotPull();
    spark_initSpotlightParallax();
  });
}

/* DOMContentLoaded */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', spark_init);
} else {
  spark_init();
}
