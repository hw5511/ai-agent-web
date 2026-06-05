/* ============================================================
   토림 — script.js
   ============================================================ */

(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------
     HERO CANVAS — 가마 속 탐색: dark curtain with cursor reveal
     Canvas 2D only; no CSS layout/paint properties changed per frame.
     ---------------------------------------------------------- */

  (function initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    const hero   = document.getElementById('hero');
    if (!canvas || !hero) return;

    const ctx = canvas.getContext('2d');
    let rafId = null;
    let initialized = false;
    let targetX, targetY, curX, curY;
    const RADIUS = 190;
    const LERP   = 0.1;

    function setSize() {
      canvas.width  = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
      if (!initialized) {
        curX = targetX = canvas.width  / 2;
        curY = targetY = canvas.height / 2;
        initialized = true;
      }
    }

    function draw() {
      const w = canvas.width;
      const h = canvas.height;

      curX += (targetX - curX) * LERP;
      curY += (targetY - curY) * LERP;

      ctx.clearRect(0, 0, w, h);

      /* Dark curtain */
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(13, 9, 4, 0.92)';
      ctx.fillRect(0, 0, w, h);

      /* Torch reveal — destination-out punches a hole */
      ctx.globalCompositeOperation = 'destination-out';
      const grd = ctx.createRadialGradient(curX, curY, 0, curX, curY, RADIUS);
      grd.addColorStop(0,    'rgba(0,0,0,1)');
      grd.addColorStop(0.5,  'rgba(0,0,0,0.88)');
      grd.addColorStop(0.85, 'rgba(0,0,0,0.3)');
      grd.addColorStop(1,    'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(curX, curY, RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';

      rafId = requestAnimationFrame(draw);
    }

    function start() {
      if (rafId) cancelAnimationFrame(rafId);
      draw();
    }

    setSize();

    if (prefersReduced) {
      /* Leave canvas empty so the duotone image shows fully */
      return;
    }

    start();

    hero.addEventListener('mousemove', function (e) {
      const rect = canvas.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
    });

    hero.addEventListener('touchmove', function (e) {
      const t    = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      targetX = t.clientX - rect.left;
      targetY = t.clientY - rect.top;
    }, { passive: true });

    let resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        setSize();
        start();
      }, 160);
    });
  })();

  /* ----------------------------------------------------------
     SCROLL REVEAL — IntersectionObserver, no scroll listener
     Only opacity + transform transitions (compositor safe).
     ---------------------------------------------------------- */

  (function initReveal() {
    if (prefersReduced) return; /* CSS already sets opacity:1, transform:none */

    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

    items.forEach(function (el) {
      observer.observe(el);
    });
  })();

  /* ----------------------------------------------------------
     MOBILE NAV — hamburger toggle
     ---------------------------------------------------------- */

  (function initNav() {
    const toggle = document.querySelector('.nav-toggle');
    const links  = document.querySelector('.nav-links');
    const brand  = document.querySelector('.nav-brand');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
      const isOpen = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
      document.body.style.overflow = isOpen ? 'hidden' : '';
      /* Tint brand color when menu overlays */
      if (brand) brand.style.color = isOpen ? 'var(--bone)' : '';
    });

    links.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', '메뉴 열기');
        document.body.style.overflow = '';
        if (brand) brand.style.color = '';
      });
    });
  })();

})();
