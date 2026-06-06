/**
 * 백색소음 갤러리 — script.js
 * 건축 도면 제도사의 시선: 중앙 수렴 + 콜라주 마스킹 + 도달 반경
 *
 * 성능 THE LAW: 모든 애니메이션 프레임에서 transform/opacity만 변경.
 * 움직이는 레이어에 blur/shadow/filter/blend 없음.
 */

(function () {
  'use strict';

  /* ============================================================
     prefers-reduced-motion 감지 — CSS가 처리하지만 JS도 확인
  ============================================================ */
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  /* ============================================================
     Lenis — 부드러운 스크롤 (Lenis 가드: html scroll-behavior:smooth 없음)
  ============================================================ */
  let lenis;

  function initLenis() {
    if (prefersReducedMotion) return;
    if (typeof Lenis === 'undefined') return;

    lenis = new Lenis({
      duration: 1.1,
      easing: function (t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      },
      smoothWheel: true,
      syncTouch: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // GSAP ScrollTrigger와 Lenis 연동
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* ============================================================
     GSAP + ScrollTrigger 초기화
  ============================================================ */
  function initGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      // GSAP 없으면 reveal 요소를 즉시 노출
      revealAllFallback();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    initHeroCollage();
    initReveal();
    initWorkCards();
  }

  /* ============================================================
     Hero 콜라주 — 원형 마스크 내부 이미지 크로스페이드
     opacity만 변경 (THE LAW 준수)
     움직이는 레이어에 blur/filter 없음
  ============================================================ */
  function initHeroCollage() {
    if (prefersReducedMotion) return;

    var imgs = document.querySelectorAll('.hero__collage-img');
    if (!imgs || imgs.length < 2) return;

    var current = 0;
    var total = imgs.length;

    // 초기 상태: 첫 이미지만 보임 (CSS에서 설정)
    // 나머지는 opacity 0

    function crossfade() {
      var next = (current + 1) % total;

      // will-change 는 애니메이션 직전/직후에만 설정
      imgs[current].style.willChange = 'opacity';
      imgs[next].style.willChange = 'opacity';

      gsap.to(imgs[current], {
        opacity: 0,
        duration: 1.4,
        ease: 'power2.inOut',
        onComplete: function () {
          imgs[current].style.willChange = 'auto';
        },
      });
      gsap.to(imgs[next], {
        opacity: 1,
        duration: 1.4,
        ease: 'power2.inOut',
        onComplete: function () {
          imgs[next].style.willChange = 'auto';
          current = next;
        },
      });
    }

    // 4초마다 크로스페이드
    setInterval(crossfade, 4000);
  }

  /* ============================================================
     Hero 진입 애니메이션
     transform + opacity만 사용 (THE LAW 준수)
  ============================================================ */
  function initHeroEntrance() {
    if (prefersReducedMotion) return;
    if (typeof gsap === 'undefined') return;

    var overline = document.querySelector('.hero__overline');
    var titleLines = document.querySelectorAll('.hero__title-line');
    var sub = document.querySelector('.hero__sub');
    var cta = document.querySelector('.hero__cta');
    var scrollHint = document.querySelector('.hero__scroll-hint');
    var fragments = document.querySelectorAll('.hero__fragment');
    var mask = document.querySelector('.hero__collage-mask');

    // 초기 상태
    var elements = [overline, sub, cta, scrollHint];
    elements.forEach(function (el) {
      if (!el) return;
      gsap.set(el, { opacity: 0, y: 18 });
    });
    gsap.set(titleLines, { opacity: 0, y: 24 });

    if (mask) gsap.set(mask, { opacity: 0, scale: 0.92 });
    fragments.forEach(function (f) {
      gsap.set(f, { opacity: 0, scale: 0.96 });
    });

    var tl = gsap.timeline({ delay: 0.2 });

    // 마스크 수렴 등장
    if (mask) {
      tl.to(mask, {
        opacity: 1,
        scale: 1,
        duration: 1.1,
        ease: 'power3.out',
      });
    }

    // 제목 라인 순차 등장 (transform+opacity만)
    tl.to(
      titleLines,
      {
        opacity: 1,
        y: 0,
        duration: 0.75,
        stagger: 0.12,
        ease: 'power2.out',
      },
      '-=0.5'
    );

    // 나머지 요소
    if (overline) {
      tl.to(overline, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }, '-=0.4');
    }
    if (sub) {
      tl.to(sub, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }, '-=0.3');
    }
    if (cta) {
      tl.to(cta, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.25');
    }

    // 파편 이미지
    fragments.forEach(function (f, i) {
      tl.to(
        f,
        { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' },
        0.3 + i * 0.12
      );
    });

    // 스크롤 힌트
    if (scrollHint) {
      tl.to(
        scrollHint,
        { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' },
        '-=0.1'
      );
    }
  }

  /* ============================================================
     Reveal 애니메이션 — 스크롤 진입 시 (GSAP ScrollTrigger)
     transform(translateY) + opacity만 (THE LAW 준수)
  ============================================================ */
  function initReveal() {
    if (prefersReducedMotion) {
      revealAllFallback();
      return;
    }

    var revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    revealEls.forEach(function (el) {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: function () {
          // will-change 애니메이션 직전
          el.style.willChange = 'transform, opacity';
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: 'power2.out',
            onComplete: function () {
              // 애니메이션 완료 후 해제
              el.style.willChange = 'auto';
            },
          });
        },
        once: true,
      });
    });
  }

  /* ============================================================
     Work Cards — 전시 그리드 섹션 reveal
     (section 자체가 스크롤 트리거)
  ============================================================ */
  function initWorkCards() {
    if (prefersReducedMotion) return;

    var cards = document.querySelectorAll('.work-card');
    if (!cards.length) return;

    cards.forEach(function (card, i) {
      gsap.set(card, { opacity: 0, y: 24 });
      ScrollTrigger.create({
        trigger: card,
        start: 'top 90%',
        onEnter: function () {
          card.style.willChange = 'transform, opacity';
          gsap.to(card, {
            opacity: 1,
            y: 0,
            duration: 0.65,
            delay: (i % 3) * 0.08,
            ease: 'power2.out',
            onComplete: function () {
              card.style.willChange = 'auto';
            },
          });
        },
        once: true,
      });
    });
  }

  /* ============================================================
     폴백 — JS/GSAP 없을 때 reveal 요소 즉시 노출
  ============================================================ */
  function revealAllFallback() {
    var els = document.querySelectorAll('.reveal');
    els.forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    var cards = document.querySelectorAll('.work-card');
    cards.forEach(function (c) {
      c.style.opacity = '1';
      c.style.transform = 'none';
    });
  }

  /* ============================================================
     모바일 메뉴 토글
  ============================================================ */
  function initMobileMenu() {
    var btn = document.querySelector('.nav__menu-btn');
    var menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', function () {
      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isOpen));
      menu.setAttribute('aria-hidden', String(isOpen));
      menu.classList.toggle('is-open', !isOpen);
    });

    // 메뉴 링크 클릭 시 닫기
    var links = menu.querySelectorAll('.nav__mobile-link');
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        btn.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
        menu.classList.remove('is-open');
      });
    });
  }

  /* ============================================================
     헤더 스크롤 상태
  ============================================================ */
  function initHeaderScroll() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          if (window.scrollY > 40) {
            header.style.borderBottomColor = 'rgba(200, 194, 184, 0.8)';
          } else {
            header.style.borderBottomColor = '';
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ============================================================
     앵커 스크롤 — Lenis 사용 시
  ============================================================ */
  function initAnchorScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var id = this.getAttribute('href').slice(1);
        if (!id) return;
        var target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(target, { offset: -60, duration: 1.1 });
        } else {
          target.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
      });
    });
  }

  /* ============================================================
     도달 반경 — 히어로 SVG 원형 반경 미묘한 호흡 (opacity만)
     작은 pulse로 도면이 살아있음을 암시
  ============================================================ */
  function initBlueprintPulse() {
    if (prefersReducedMotion) return;
    if (typeof gsap === 'undefined') return;

    // 내부 원 (r=50) 만 opacity 애니메이션
    var circles = document.querySelectorAll('.hero__blueprint-svg circle');
    if (!circles.length) return;

    // 첫 번째 원 (가장 안쪽) — opacity pulse
    var innerCircle = circles[0];
    innerCircle.style.willChange = 'auto'; // 정적 유지 원칙 — will-change 없음
    gsap.to(innerCircle, {
      opacity: 0.65,
      duration: 2.4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }

  /* ============================================================
     DOMContentLoaded — 순서 보장
  ============================================================ */
  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHeaderScroll();
    initAnchorScroll();

    // Lenis + GSAP (CDN 스크립트가 defer 없이 head에 로드됨)
    initLenis();
    initGSAP();
    initHeroEntrance();
    initBlueprintPulse();
  });

})();
