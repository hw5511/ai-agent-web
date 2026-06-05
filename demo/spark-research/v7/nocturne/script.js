/* NOCTURNE — script.js
   MECHANISM: 듀오톤 인터랙티브 마스크 + 스크롤 reveal + Nav
*/

(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Nav: scroll state ---- */
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Nav: mobile toggle ---- */
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? '메뉴 열기' : '메뉴 닫기');
      menu.classList.toggle('is-open', !open);
    });

    // Close on nav link click
    menu.querySelectorAll('.nav__link').forEach((link) => {
      link.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', '메뉴 열기');
        menu.classList.remove('is-open');
      });
    });
  }

  /* ---- Hero: interactive mask follows cursor ---- */
  const hero = document.getElementById('hero');
  const heroMask = document.getElementById('heroMask');

  if (hero && heroMask && !prefersReduced) {
    let rafId = null;
    let tx = 50;
    let ty = 50;
    let cx = 50;
    let cy = 50;

    const lerp = (a, b, t) => a + (b - a) * t;

    const onMove = (e) => {
      const rect = hero.getBoundingClientRect();
      tx = ((e.clientX - rect.left) / rect.width) * 100;
      ty = ((e.clientY - rect.top) / rect.height) * 100;
    };

    const onTouch = (e) => {
      if (!e.touches.length) return;
      const t = e.touches[0];
      const rect = hero.getBoundingClientRect();
      tx = ((t.clientX - rect.left) / rect.width) * 100;
      ty = ((t.clientY - rect.top) / rect.height) * 100;
    };

    const tick = () => {
      cx = lerp(cx, tx, 0.06);
      cy = lerp(cy, ty, 0.06);
      hero.style.setProperty('--mx', cx.toFixed(2) + '%');
      hero.style.setProperty('--my', cy.toFixed(2) + '%');
      rafId = requestAnimationFrame(tick);
    };

    hero.addEventListener('mousemove', onMove, { passive: true });
    hero.addEventListener('touchmove', onTouch, { passive: true });

    const startTick = () => { if (!rafId) rafId = requestAnimationFrame(tick); };
    const stopTick = () => {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      // Gently return to center
      const returnTick = () => {
        tx = lerp(tx, 50, 0.04);
        ty = lerp(ty, 50, 0.04);
        cx = lerp(cx, tx, 0.06);
        cy = lerp(cy, ty, 0.06);
        hero.style.setProperty('--mx', cx.toFixed(2) + '%');
        hero.style.setProperty('--my', cy.toFixed(2) + '%');
        if (Math.abs(cx - 50) > 0.5 || Math.abs(cy - 50) > 0.5) {
          requestAnimationFrame(returnTick);
        }
      };
      requestAnimationFrame(returnTick);
    };

    hero.addEventListener('mouseenter', startTick);
    hero.addEventListener('mouseleave', stopTick);
  }

  /* ---- Duotone proximity warm effect (hero cells) ---- */
  const duotoneCells = hero ? hero.querySelectorAll('[data-duotone]') : [];

  if (duotoneCells.length && !prefersReduced) {
    const WARM_RADIUS = 240;

    const checkProximity = (e) => {
      const mx = e.clientX;
      const my = e.clientY;
      duotoneCells.forEach((cell) => {
        const rect = cell.getBoundingClientRect();
        const ccx = rect.left + rect.width / 2;
        const ccy = rect.top + rect.height / 2;
        const dist = Math.hypot(mx - ccx, my - ccy);
        cell.classList.toggle('is-warm', dist < WARM_RADIUS);
      });
    };

    window.addEventListener('mousemove', checkProximity, { passive: true });
  }

  /* ---- Scroll reveal via IntersectionObserver ---- */
  const reveals = document.querySelectorAll('[data-reveal]');
  if (reveals.length) {
    if (prefersReduced) {
      reveals.forEach((el) => el.classList.add('is-visible'));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Stagger siblings
              const parent = entry.target.parentElement;
              const siblings = parent
                ? Array.from(parent.querySelectorAll('[data-reveal]'))
                : [];
              const idx = siblings.indexOf(entry.target);
              const delay = Math.min(idx * 80, 320);
              setTimeout(() => entry.target.classList.add('is-visible'), delay);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
      );
      reveals.forEach((el) => observer.observe(el));
    }
  }

  /* ---- Smooth anchor scrolling (no Lenis — native) ---- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  });

  /* ---- Collection card: subtle tilt on hover (desktop only) ---- */
  if (!prefersReduced && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.ccard').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const rx = ((e.clientY - rect.top) / rect.height - 0.5) * 4;
        const ry = ((e.clientX - rect.left) / rect.width - 0.5) * -4;
        card.style.transform = `translateY(-4px) perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ---- Active nav link based on scroll position ---- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');
  if (sections.length && navLinks.length) {
    const navH = () => parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64;
    const onScrollSpy = () => {
      const scrollY = window.scrollY + navH() + 40;
      let current = '';
      sections.forEach((sec) => {
        if (sec.offsetTop <= scrollY) current = sec.id;
      });
      navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        link.classList.toggle('nav__link--active', href === '#' + current);
      });
    };
    window.addEventListener('scroll', onScrollSpy, { passive: true });
    onScrollSpy();
  }

})();
