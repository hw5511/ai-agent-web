/**
 * 무명(無名) — script.js
 * PERSONA: 브루탈리즘 잡지 아트디렉터
 * VISUAL_MECHANISM: 3D 원근/공간 CSS perspective + transform
 * WILD_CONCEPT: 완성되지 않은 과업의 갈증 (Zeigarnik Onboarding)
 *
 * THE LAW: 매 프레임 transform/opacity만 변경.
 *          움직이는 레이어에 blur/shadow/filter/blend 없음.
 * Lenis: html scroll-behavior:smooth 없음. CSS reset은 styles.css에 포함.
 */

'use strict';

/* ============================================================
   PREFERS-REDUCED-MOTION GUARD
   reduced-motion이면 모든 JS 애니메이션 비활성화
   (CSS는 이미 reveal을 즉시 최종 상태로 만듦)
   ============================================================ */
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
   LENIS SMOOTH SCROLL
   Lenis 가드: html에 scroll-behavior:smooth 없음
   CSS reset은 styles.css에 선언
   ============================================================ */
let lenis = null;

function initLenis() {
  if (prefersReduced) return; // reduced-motion: Lenis 미사용

  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
  });

  // GSAP ticker와 통합
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}

/* ============================================================
   GSAP + ScrollTrigger 등록
   ============================================================ */
function initGSAP() {
  gsap.registerPlugin(ScrollTrigger);

  // Lenis scrollTo → ScrollTrigger 연동
  if (lenis) {
    lenis.on('scroll', ScrollTrigger.update);
    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value) {
        if (arguments.length) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      },
    });
  }
}

/* ============================================================
   SITE HEADER — 스크롤 시 배경 전환
   변경하는 것: CSS 클래스 토글 (transform/opacity 아님)
   — 배경색/border 변화는 CSS transition으로 처리
   ============================================================ */
function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  // IntersectionObserver: hero 섹션이 뷰포트를 떠나면 헤더 배경 활성화
  const hero = document.getElementById('hero');
  if (!hero) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      header.classList.toggle('scrolled', !entry.isIntersecting);
    },
    { threshold: 0.1 }
  );
  observer.observe(hero);
}

/* ============================================================
   MOBILE NAV
   ============================================================ */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  if (!toggle || !mobileNav) return;

  toggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen.toString());
    mobileNav.setAttribute('aria-hidden', (!isOpen).toString());
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // 메뉴 링크 클릭 시 닫기
  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  });
}

/* ============================================================
   HERO — 3D 원근 카드 배열
   VISUAL_MECHANISM: CSS perspective + translateZ (transform only)
   WILD_CONCEPT: Zeigarnik — 체크되지 않은 항목들이 공중에 부유

   각 카드가 3D 공간의 다른 깊이에 배치됨.
   스크롤에 따라 perspective-origin이 변화 (CSS변수로).
   THE LAW: transform만 변경. blur/shadow/filter 없음.
   ============================================================ */
function initHeroCards() {
  const stage = document.getElementById('hero-stage');
  const cardsContainer = document.getElementById('hero-cards');
  const cards = document.querySelectorAll('.h-card');
  if (!stage || !cardsContainer || !cards.length) return;

  // 카드 3D 초기 위치 설정 (translateX, translateY, translateZ — transform only)
  const cardPositions = [
    { x: -38, y: -18, z:  80, rx: -4, ry:  8 },  // 001
    { x:  18, y:  -2, z: -60, rx:  3, ry: -6 },  // 002
    { x: -10, y: -32, z:  20, rx: -2, ry:  4 },  // 003
    { x: -28, y:  14, z: -40, rx:  6, ry: -3 },  // 004
    { x:  32, y:   8, z:  50, rx: -3, ry:  5 },  // 005
  ];

  // 위치 단위: vw/vh 느낌으로 %로 변환하지 않고 px 사용
  // 단 화면 크기에 비례: 배율 적용
  const scale = Math.min(window.innerWidth / 1440, 1);

  cards.forEach((card, i) => {
    const p = cardPositions[i];
    const depth = parseFloat(card.dataset.depth) || 0.5;
    // 초기 transform 설정 — transform only (THE LAW)
    card.style.transform = `
      translate(-50%, -50%)
      translateX(${p.x * scale * 1.5}vw)
      translateY(${p.y * scale * 0.8}vh)
      translateZ(${depth * 120}px)
      rotateX(${p.rx}deg)
      rotateY(${p.ry}deg)
    `;
  });

  if (prefersReduced) {
    // reduced-motion: 카드 모두 불투명하게
    cards.forEach((c) => { c.style.opacity = '1'; });
    return;
  }

  // 카드 페이드인 (opacity + transform — THE LAW)
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transition = `opacity 0.8s ease ${0.3 + i * 0.15}s`;
    // will-change: 애니메이션 직전에만 설정
    card.style.willChange = 'transform, opacity';
    requestAnimationFrame(() => {
      card.style.opacity = '0.88';
    });
  });

  // 스크롤: perspective-origin 변화 — CSS 변수로 전달, transform만 변경
  // stage.style.perspectiveOrigin 직접 변경은 Layout 재실행 아님 (geometry 프로퍼티)
  // 하지만 perspectiveOrigin 변경도 페인트를 유발할 수 있으므로
  // 대신 cards container의 transform(rotateX/Y)으로 대체 — transform only
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const heroH = document.getElementById('hero').offsetHeight;
      const scrollY = lenis ? lenis.scroll : window.scrollY;
      const progress = Math.min(scrollY / (heroH * 0.6), 1);

      // cards container: 스크롤에 따라 전체를 살짝 뒤로 당김 (translateZ)
      // transform only — THE LAW
      const pullZ = progress * -60;
      const tiltX = progress * 3;
      cardsContainer.style.transform = `translateZ(${pullZ}px) rotateX(${tiltX}deg)`;

      // 카드 투명도도 스크롤에 따라 — opacity only (THE LAW)
      cards.forEach((card) => {
        card.style.opacity = Math.max(0.1, 0.88 - progress * 0.9).toString();
      });

      ticking = false;
    });
  }

  if (lenis) {
    lenis.on('scroll', onScroll);
  } else {
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // 카드 애니메이션 완료 후 will-change 해제
  setTimeout(() => {
    cards.forEach((card) => {
      card.style.willChange = 'auto';
    });
  }, 2500);
}

/* ============================================================
   SCROLL INDICATOR — 스크롤 선 애니메이션
   transform: scaleY only (THE LAW)
   ============================================================ */
function initScrollIndicator() {
  const line = document.querySelector('.scroll-line');
  if (!line || prefersReduced) return;

  // 초기 상태
  line.style.transform = 'scaleY(0)';
  line.style.transition = 'none';
  line.style.willChange = 'transform';

  // 페이지 로드 후 선 성장 (scaleY — transform only)
  setTimeout(() => {
    line.style.transition = 'transform 1.2s cubic-bezier(0.4,0,0.2,1) 0.8s';
    line.style.transform = 'scaleY(1)';
  }, 100);

  // will-change 해제
  setTimeout(() => {
    line.style.willChange = 'auto';
  }, 2500);
}

/* ============================================================
   REVEAL ELEMENTS — GSAP ScrollTrigger
   opacity + translateY — transform/opacity only (THE LAW)
   ============================================================ */
function initReveal() {
  if (prefersReduced) {
    // CSS already sets opacity:1, transform:none via reduced-motion media query
    return;
  }

  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  reveals.forEach((el) => {
    // will-change: ScrollTrigger 애니메이션 직전에 설정
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        el.style.willChange = 'transform, opacity';
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: 'power2.out',
          onComplete: () => {
            // 애니메이션 완료 후 will-change 해제 (THE LAW: 영구 선언 금지)
            el.style.willChange = 'auto';
          },
        });
      },
    });
  });
}

/* ============================================================
   CONTACT FORM — 간단 유효성 검사 (UX 향상)
   ============================================================ */
function initForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameEl  = form.querySelector('#f-name');
    const emailEl = form.querySelector('#f-email');
    let valid = true;

    if (!nameEl.value.trim()) {
      nameEl.focus();
      valid = false;
    } else if (!emailEl.value.trim() || !emailEl.validity.valid) {
      emailEl.focus();
      valid = false;
    }

    if (valid) {
      const btn = form.querySelector('.btn-submit');
      btn.textContent = '전송되었습니다. 곧 연락드리겠습니다.';
      btn.disabled = true;
    }
  });
}

/* ============================================================
   NAV ANCHOR SMOOTH SCROLL (Lenis 사용 시)
   ============================================================ */
function initNavScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(target, { offset: -80, duration: 1.2 });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ============================================================
   INIT — DOMContentLoaded
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // 순서 중요: Lenis → GSAP → 나머지
  initLenis();
  initGSAP();
  initHeader();
  initMobileNav();
  initHeroCards();
  initScrollIndicator();
  initReveal();
  initNavScroll();
  initForm();

  // ScrollTrigger refresh (Lenis 연동 후)
  if (!prefersReduced) {
    ScrollTrigger.refresh();
  }
});
