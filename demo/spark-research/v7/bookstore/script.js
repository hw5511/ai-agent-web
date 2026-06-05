(function () {
  'use strict';

  // ── 모바일 내비게이션 토글
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      navLinks.classList.toggle('is-open', !expanded);
      toggle.setAttribute('aria-label', expanded ? '메뉴 열기' : '메뉴 닫기');
    });

    // 링크 클릭 시 메뉴 닫기
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('is-open');
        toggle.setAttribute('aria-label', '메뉴 열기');
      });
    });
  }

  // ── 헤더 스크롤 배경
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── 앵커 스무스 스크롤 (reduced-motion 감지)
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({
        behavior: prefersReduced ? 'auto' : 'smooth',
        block: 'start',
      });
      // 포커스 이동 (접근성)
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  // ── 스크롤 리빌 (IntersectionObserver)
  if ('IntersectionObserver' in window && !prefersReduced) {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach(el => observer.observe(el));
  } else {
    // 폴백: 모두 즉시 표시
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
  }

})();
