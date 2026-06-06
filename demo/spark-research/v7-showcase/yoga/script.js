/**
 * 숨 스튜디오 — script.js
 * VISUAL_MECHANISM: 듀오톤 이미지 + 인터랙티브 마스크 (분할선 translateX)
 * THE LAW: 모든 애니메이션 = transform / opacity only
 * Lenis 가드 포함
 */

'use strict';

/* ============================================================
   1. Lenis 스무스 스크롤 초기화
   ============================================================ */
function initLenis() {
  if (typeof Lenis === 'undefined') return;

  const lenis = new Lenis({
    duration: 1.2,
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    smooth: true,
    smoothTouch: false,
  });

  // GSAP ScrollTrigger와 Lenis 동기화
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  } else {
    // GSAP 없을 때 순수 rAF
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  return lenis;
}

/* ============================================================
   2. GSAP + ScrollTrigger 등록 및 reveal 애니메이션
   ============================================================ */
function initScrollReveal() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // .reveal 요소: 아래에서 위로 fade in
  // transform: translateY + opacity only → THE LAW 준수
  const revealElements = document.querySelectorAll('.reveal');

  revealElements.forEach(function (el) {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.85,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    });
  });

  // 히어로 텍스트 순차 등장 (page load)
  const heroEyebrow = document.querySelector('.hero-eyebrow');
  const heroHeadline = document.querySelector('.hero-headline');
  const heroBody = document.querySelector('.hero-body');
  const heroActions = document.querySelector('.hero-actions');
  const breathIndicator = document.querySelector('.breath-indicator');

  if (heroEyebrow) {
    var heroTl = gsap.timeline({ delay: 0.3 });

    heroTl
      .fromTo(heroEyebrow,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }
      )
      .fromTo(heroHeadline,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' },
        '-=0.3'
      )
      .fromTo(heroBody,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
        '-=0.4'
      )
      .fromTo(heroActions,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.35'
      )
      .fromTo(breathIndicator,
        { opacity: 0 },
        { opacity: 1, duration: 1, ease: 'power2.out' },
        '-=0.2'
      );
  }

  // 히어로 좌측 이미지 scale-in (transform only)
  var heroLeft = document.querySelector('.hero-left');
  if (heroLeft) {
    gsap.fromTo(heroLeft,
      { opacity: 0, scale: 1.04 },
      { opacity: 1, scale: 1, duration: 1.4, ease: 'power3.out', delay: 0.1 }
    );
  }
}

/* ============================================================
   3. 인터랙티브 분할선 마스크
   VISUAL_MECHANISM: 마우스 X 위치에 따라 divider가 translateX로 이동
   THE LAW: transform only, will-change는 인터랙션 중에만 ON
   ============================================================ */
function initHeroDivider() {
  var divider = document.getElementById('hero-divider');
  var heroEl = document.querySelector('.hero');
  if (!divider || !heroEl) return;

  // 반응형: 900px 이하에서는 divider 숨김 (CSS로도 처리)
  var isActive = window.innerWidth > 900;
  var baseLeft = 0.48; // 기본 분할 비율 (hero-left: 48%)
  var raf = null;
  var targetX = 0;
  var currentX = 0;

  // 분할선이 히어로 폭 기준으로 -10% ~ +10% 범위에서 이동
  var range = 80; // px

  function setWillChange(on) {
    divider.style.willChange = on ? 'transform' : 'auto';
  }

  function onMouseMove(e) {
    if (!isActive) return;

    var rect = heroEl.getBoundingClientRect();
    // 마우스 X의 히어로 내 상대 위치 (-0.5 ~ +0.5)
    var relX = (e.clientX - rect.left) / rect.width - baseLeft;
    // -range ~ +range px 로 매핑
    targetX = relX * range * 1.5;
    targetX = Math.max(-range, Math.min(range, targetX));
  }

  function onMouseEnter() {
    if (!isActive) return;
    setWillChange(true);
    if (!raf) loop();
  }

  function onMouseLeave() {
    targetX = 0; // 복귀
    // will-change는 애니메이션 끝나면 해제
    setTimeout(function () {
      setWillChange(false);
    }, 600);
  }

  function loop() {
    raf = requestAnimationFrame(loop);
    // lerp (선형 보간) — smooth follow
    currentX += (targetX - currentX) * 0.08;

    // transform only — THE LAW 준수
    divider.style.transform = 'translateX(' + currentX.toFixed(2) + 'px)';

    // 완전히 정착하면 rAF 중단
    if (Math.abs(targetX - currentX) < 0.05 && targetX === 0) {
      cancelAnimationFrame(raf);
      raf = null;
      divider.style.transform = 'translateX(0)';
    }
  }

  heroEl.addEventListener('mousemove', onMouseMove, { passive: true });
  heroEl.addEventListener('mouseenter', onMouseEnter);
  heroEl.addEventListener('mouseleave', onMouseLeave);

  window.addEventListener('resize', function () {
    isActive = window.innerWidth > 900;
    if (!isActive) {
      divider.style.transform = '';
      setWillChange(false);
    }
  });
}

/* ============================================================
   4. 네비게이션 스크롤 상태 / 모바일 메뉴
   ============================================================ */
function initNav() {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var mobileMenu = document.getElementById('mobile-menu');
  var menuLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];

  // 스크롤 시 헤더 배경 강화
  var ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(function () {
        if (window.scrollY > 20) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // 모바일 메뉴 토글
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      mobileMenu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    });

    // 메뉴 링크 클릭 시 닫기
    menuLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
      });
    });
  }
}

/* ============================================================
   5. reduced-motion 감지 — GSAP 애니메이션 즉시 완료
   FLOOR: 모든 reveal 요소 최종 가시 상태로 복원
   ============================================================ */
function handleReducedMotion() {
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (prefersReduced.matches) {
    // CSS에서도 처리되지만, GSAP 초기화 전에 opacity/transform 강제 복원
    var reveals = document.querySelectorAll('.reveal');
    reveals.forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });

    // 히어로 텍스트도 즉시 표시
    var heroElements = document.querySelectorAll(
      '.hero-eyebrow, .hero-headline, .hero-body, .hero-actions, .breath-indicator, .hero-left'
    );
    heroElements.forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });

    return true; // reduced motion 활성
  }

  return false;
}

/* ============================================================
   6. 스케줄 표 수평 스크롤 힌트
   ============================================================ */
function initScheduleScroll() {
  var scheduleGrid = document.querySelector('.schedule-grid');
  if (!scheduleGrid) return;

  // 터치 디바이스에서 가로 스크롤 가능함을 표시
  if ('ontouchstart' in window) {
    scheduleGrid.setAttribute('tabindex', '0');
    scheduleGrid.setAttribute('role', 'region');
    scheduleGrid.setAttribute('aria-label', '가로 스크롤 가능한 스케줄 표');
  }
}

/* ============================================================
   7. 비정형 마스크 호흡 애니메이션 보조 (CSS animation 우선, JS는 fallback)
   SVG path의 d attribute 변경은 CSS animation으로 처리 (transform 아님)
   — 단, SVG d animation은 browser composite이 아닌 paint이므로
      opacity 방식으로 대체하여 GSAP으로 크로스페이드
   ============================================================ */
function initAmorphousMask() {
  // CSS animation이 이미 담당하므로 JS는 intersection observer로
  // 화면 밖일 때 animation-play-state: paused 처리 (성능 절약)
  var amorphousPath = document.querySelector('.amorphous-path');
  if (!amorphousPath) return;

  var heroRight = document.querySelector('.hero-right');
  if (!heroRight) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        amorphousPath.style.animationPlayState = 'running';
      } else {
        amorphousPath.style.animationPlayState = 'paused';
      }
    });
  }, { threshold: 0 });

  observer.observe(heroRight);
}

/* ============================================================
   8. 섹션 내비게이션 active 표시 (IntersectionObserver)
   ============================================================ */
function initActiveNav() {
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-links a');
  if (!sections.length || !navLinks.length) return;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          navLinks.forEach(function (link) {
            var href = link.getAttribute('href');
            if (href === '#' + id) {
              link.style.color = 'var(--clr-ink)';
            } else {
              link.style.color = '';
            }
          });
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sections.forEach(function (section) {
    observer.observe(section);
  });
}

/* ============================================================
   초기화 진입점
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
  var isReduced = handleReducedMotion();

  // Lenis 초기화 (reduced-motion에서도 스크롤 자체는 정상)
  initLenis();

  // 인터랙션
  initNav();
  initScheduleScroll();
  initActiveNav();
  initHeroDivider();
  initAmorphousMask();

  if (!isReduced) {
    // GSAP reveal은 reduced-motion이 아닐 때만
    initScrollReveal();
  }
});
