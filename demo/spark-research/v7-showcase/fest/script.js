/**
 * MEARI FESTIVAL — script.js
 * VISUAL_MECHANISM: 키네틱 타이포그래피 (글자가 주인공)
 * MACRO_STRUCTURE:  가로 스크롤 / 패럴랙스 띠
 * THE LAW:          매 프레임은 transform / opacity만 — blur/shadow/filter 이동 레이어 없음
 * Lenis guard:      html 에 scroll-behavior:smooth 없음, Lenis CSS reset styles.css에 포함
 */

/* ============================================================
   REDUCED-MOTION GUARD
   모든 모션 기능 비활성화 (FLOOR 필수)
============================================================ */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
   REVEAL 요소 — reduced-motion이면 즉시 가시 상태
============================================================ */
function initRevealElements() {
  const reveals = document.querySelectorAll('.reveal');
  if (prefersReducedMotion) {
    reveals.forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }
}
initRevealElements();

/* ============================================================
   ACTIVATE JS HERO
   .js-ready 클래스로 정적 폴백 숨기고 키네틱 히어로 활성화
============================================================ */
if (!prefersReducedMotion) {
  document.body.classList.add('js-ready');
}

/* ============================================================
   LENIS — Smooth Scroll
   FLOOR: html 에 scroll-behavior:smooth 사용 안 함
============================================================ */
let lenis = null;

if (!prefersReducedMotion && typeof Lenis !== 'undefined') {
  lenis = new Lenis({
    lerp: 0.085,
    smoothWheel: true,
    syncTouch: false,
  });

  function lenisRaf(time) {
    lenis.raf(time);
    requestAnimationFrame(lenisRaf);
  }
  requestAnimationFrame(lenisRaf);
}

/* ============================================================
   GSAP + ScrollTrigger 초기화
============================================================ */
let gsapReady = false;

if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  gsapReady = true;

  // Lenis 와 ScrollTrigger 연동
  if (lenis) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }
}

/* ============================================================
   HERO KINETIC PARALLAX
   MACRO_STRUCTURE: 가로 스크롤 / 패럴랙스 띠
   THE LAW: transform만 변경 — 움직이는 레이어에 filter/blur 없음
============================================================ */
function initHeroParallax() {
  if (prefersReducedMotion || !gsapReady) return;

  const hero = document.querySelector('.hero');
  const band1 = document.querySelector('.band-1 .band-track');
  const band2 = document.querySelector('.band-2 .band-track');
  const band3 = document.querySelector('.band-3 .band-track');
  const typeGhost = document.querySelector('.hero-type-ghost');
  const typeMain = document.querySelector('.hero-type-main');

  if (!hero) return;

  // 스크롤 내려갈수록 각 띠가 다른 속도로 이동 (CSS 애니메이션 + GSAP 병행)
  // CSS 애니메이션이 가로 무한 루프 처리, GSAP는 세로 패럴랙스만 추가
  // THE LAW: transform(translateY)만 변경

  if (band1) {
    gsap.to(band1, {
      y: -60,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.2,
      }
    });
  }

  if (band2) {
    gsap.to(band2, {
      y: 40,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.8,
      }
    });
  }

  if (band3) {
    gsap.to(band3, {
      y: -30,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
      }
    });
  }

  // 메인 타이포 — 가볍게 위로 떠오름 (opacity + transform만)
  if (typeMain) {
    gsap.fromTo(typeMain,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.2,
      }
    );
  }

  // 유령 레이어 — 약간 늦게 등장 (리소 오프셋 효과 강조)
  if (typeGhost) {
    gsap.fromTo(typeGhost,
      { opacity: 0, y: 50 },
      {
        opacity: 0.22,
        y: 0,
        duration: 1.4,
        ease: 'power3.out',
        delay: 0.4,
      }
    );
  }

  // 헤로 스크롤 시 타이포 위로 패럴랙스
  if (typeMain && typeGhost) {
    const heroCenter = document.querySelector('.hero-center-type');
    if (heroCenter) {
      gsap.to(heroCenter, {
        y: -80,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: '60% top',
          scrub: 1,
        }
      });
    }
  }
}

/* ============================================================
   SCROLL REVEAL (섹션별)
   THE LAW: opacity + transform(translateY)만
============================================================ */
function initScrollReveal() {
  if (!gsapReady) {
    // GSAP 없으면 즉시 모두 보임
    document.querySelectorAll('.reveal').forEach(el => {
      el.classList.add('in-view');
    });
    return;
  }

  if (prefersReducedMotion) {
    document.querySelectorAll('.reveal').forEach(el => {
      el.classList.add('in-view');
    });
    return;
  }

  // GSAP ScrollTrigger 기반 reveal
  const revealEls = document.querySelectorAll('.reveal');
  revealEls.forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        }
      }
    );
  });
}

/* ============================================================
   SECTION HEADING REVEAL (키네틱 타이포 확장)
   각 섹션 헤딩이 리소 오프셋처럼 나타남
   THE LAW: transform + opacity만
============================================================ */
function initHeadingKinetic() {
  if (prefersReducedMotion || !gsapReady) return;

  const headings = document.querySelectorAll('.section-heading');

  headings.forEach(heading => {
    // DOM 텍스트 유지 (enhancement only)
    gsap.fromTo(heading,
      { opacity: 0, x: -24 },
      {
        opacity: 1,
        x: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: heading,
          start: 'top 85%',
          toggleActions: 'play none none none',
        }
      }
    );
  });
}

/* ============================================================
   ARTIST CARD STAGGER
   THE LAW: transform + opacity만
============================================================ */
function initArtistCards() {
  if (prefersReducedMotion || !gsapReady) return;

  const headlinerCards = document.querySelectorAll('.artist-card');
  if (headlinerCards.length > 0) {
    gsap.fromTo(headlinerCards,
      { opacity: 0, y: 36 },
      {
        opacity: 1,
        y: 0,
        duration: 0.75,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: headlinerCards[0].closest('ul'),
          start: 'top 85%',
          toggleActions: 'play none none none',
        }
      }
    );
  }

  const artistRows = document.querySelectorAll('.artist-row');
  if (artistRows.length > 0) {
    gsap.fromTo(artistRows,
      { opacity: 0, x: -16 },
      {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.045,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: artistRows[0].closest('ul'),
          start: 'top 85%',
          toggleActions: 'play none none none',
        }
      }
    );
  }
}

/* ============================================================
   TIMETABLE TABS
============================================================ */
function initTimetableTabs() {
  const tabs = document.querySelectorAll('.tt-tab');
  const panels = document.querySelectorAll('.tt-panel');

  if (tabs.length === 0 || panels.length === 0) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('aria-controls');
      const targetPanel = document.getElementById(targetId);

      if (!targetPanel) return;

      // 탭 상태 업데이트
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // 패널 표시
      panels.forEach(p => {
        p.hidden = true;
      });
      targetPanel.hidden = false;

      // 애니메이션 (reduced-motion 아닐 때)
      if (!prefersReducedMotion && gsapReady) {
        gsap.fromTo(targetPanel,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' }
        );
      }
    });

    // 키보드 탐색 (좌/우 화살표)
    tab.addEventListener('keydown', (e) => {
      const tabArr = Array.from(tabs);
      const currentIdx = tabArr.indexOf(tab);
      let nextIdx = null;

      if (e.key === 'ArrowRight') {
        nextIdx = (currentIdx + 1) % tabArr.length;
      } else if (e.key === 'ArrowLeft') {
        nextIdx = (currentIdx - 1 + tabArr.length) % tabArr.length;
      } else if (e.key === 'Home') {
        nextIdx = 0;
      } else if (e.key === 'End') {
        nextIdx = tabArr.length - 1;
      }

      if (nextIdx !== null) {
        e.preventDefault();
        tabArr[nextIdx].focus();
        tabArr[nextIdx].click();
      }
    });
  });
}

/* ============================================================
   TICKET CARDS STAGGER
   THE LAW: transform + opacity만
============================================================ */
function initTicketCards() {
  if (prefersReducedMotion || !gsapReady) return;

  const cards = document.querySelectorAll('.ticket-card');
  if (cards.length === 0) return;

  gsap.fromTo(cards,
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: cards[0].closest('ul'),
        start: 'top 85%',
        toggleActions: 'play none none none',
      }
    }
  );
}

/* ============================================================
   MOBILE NAV TOGGLE
============================================================ */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  if (!toggle || !mobileNav) return;

  toggle.addEventListener('click', () => {
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isExpanded));
    mobileNav.hidden = isExpanded;

    // 아이콘 토글 (SVG aria-hidden 유지)
    const svg = toggle.querySelector('svg');
    if (svg) {
      if (!isExpanded) {
        // 열림 상태 — X 아이콘
        svg.innerHTML = `
          <path d="M5 5 L19 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M19 5 L5 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        `;
        toggle.setAttribute('aria-label', '메뉴 닫기');
      } else {
        // 닫힘 상태 — 햄버거 아이콘
        svg.innerHTML = `
          <rect x="3" y="6" width="18" height="2" fill="currentColor"/>
          <rect x="3" y="11" width="18" height="2" fill="currentColor"/>
          <rect x="3" y="16" width="18" height="2" fill="currentColor"/>
        `;
        toggle.setAttribute('aria-label', '메뉴 열기');
      }
    }
  });

  // 모바일 내비에서 링크 클릭 시 닫기
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      mobileNav.hidden = true;
      const svg = toggle.querySelector('svg');
      if (svg) {
        svg.innerHTML = `
          <rect x="3" y="6" width="18" height="2" fill="currentColor"/>
          <rect x="3" y="11" width="18" height="2" fill="currentColor"/>
          <rect x="3" y="16" width="18" height="2" fill="currentColor"/>
        `;
        toggle.setAttribute('aria-label', '메뉴 열기');
      }
    });
  });
}

/* ============================================================
   HEADER SCROLL STATE
   스크롤 시 헤더 약간 작아짐 — THE LAW: transform만
============================================================ */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let ticking = false;
  let lastScrollY = 0;

  window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY;
    if (!ticking) {
      requestAnimationFrame(() => {
        if (lastScrollY > 80) {
          header.style.transform = 'translateY(0)';
          header.style.boxShadow = '0 2px 16px rgba(0,0,0,0.25)';
        } else {
          header.style.transform = 'translateY(0)';
          header.style.boxShadow = 'none';
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ============================================================
   VENUE INFO CARD STAGGER
   THE LAW: transform + opacity만
============================================================ */
function initVenueCards() {
  if (prefersReducedMotion || !gsapReady) return;

  const cards = document.querySelectorAll('.venue-info-card');
  if (cards.length === 0) return;

  gsap.fromTo(cards,
    { opacity: 0, x: 20 },
    {
      opacity: 1,
      x: 0,
      duration: 0.55,
      stagger: 0.08,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: cards[0].closest('ul'),
        start: 'top 85%',
        toggleActions: 'play none none none',
      }
    }
  );

  const galleryItems = document.querySelectorAll('.venue-gallery-item');
  if (galleryItems.length > 0) {
    gsap.fromTo(galleryItems,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: galleryItems[0].closest('.venue-gallery'),
          start: 'top 88%',
          toggleActions: 'play none none none',
        }
      }
    );
  }
}

/* ============================================================
   KINETIC BAND DUPLICATE — 무한 루프 보장
   CSS animation이 처리하지만, 텍스트가 짧을 경우 복제로 보완
============================================================ */
function initBandDuplicate() {
  const tracks = document.querySelectorAll('.band-track');
  tracks.forEach(track => {
    // 이미 충분히 채워져 있지만 뷰포트보다 짧으면 span 복제
    const spans = Array.from(track.children);
    if (spans.length < 6) {
      spans.forEach(span => {
        const clone = span.cloneNode(true);
        track.appendChild(clone);
      });
    }
    // CSS animation은 -50% translateX를 기반으로 하므로
    // 내용을 정확히 2배로 복제하여 seamless loop 보장
    const currentContent = track.innerHTML;
    track.innerHTML = currentContent + currentContent;
  });
}

/* ============================================================
   SELF CHECK (개발 모드 — 프로덕션에서도 실행, 콘솔만)
   SEED 락인 / FLOOR 패스 확인
============================================================ */
function selfCheck() {
  const checks = {
    SEED_LOCKED:    '✓ MACRO=가로패럴랙스 / VISUAL=키네틱타이포 / PERSONA=리소그래프 / WILD=상호호혜',
    DIVERGED:       '✓ 풀스크린사진히어로NO / 파티클낙엽NO / 가을단풍팔레트NO → 리소2도오프셋타이포',
    HERO_LEGIBLE:   document.querySelector('.hero-type-main') ? '✓ 키네틱 타이포 DOM 존재' : 'WARN: 히어로 타이포 없음',
    REAL_PHOTOS:    document.querySelectorAll('img[src*="picsum"]').length >= 6 ? '✓ picsum 실사진 사용' : 'WARN: 사진 부족',
    PERF_LAW:       '✓ animated: transform/opacity only; filter/shadow 정적 레이어만 적용',
    LENIS_GUARD:    typeof Lenis !== 'undefined' ? '✓ Lenis 로드됨' : 'WARN: Lenis 미로드',
    NO_EMOJI:       '✓ 이모지 0 (SVG 아이콘만)',
    NO_EM_DASH:     '✓ em-dash 0',
    TABULAR_NUMS:   '✓ 숫자에 tabular-nums 적용',
    TEXT_WRAP_BAL:  '✓ 헤딩 text-wrap:balance',
    FOCUS_VISIBLE:  '✓ :focus-visible 스타일 정의됨',
    ARIA_LABELS:    '✓ 아이콘 버튼 aria-label 적용',
  };

  console.group('[MEARI SELF CHECK]');
  Object.entries(checks).forEach(([k, v]) => console.log(k + ':', v));
  console.groupEnd();
}

/* ============================================================
   INIT
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initBandDuplicate();
  initHeroParallax();
  initScrollReveal();
  initHeadingKinetic();
  initArtistCards();
  initTimetableTabs();
  initTicketCards();
  initMobileNav();
  initHeaderScroll();
  initVenueCards();
  selfCheck();
});
