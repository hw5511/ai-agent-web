/* ============================================================
   토림 — script.js
   - Nav scroll state
   - Mobile menu toggle
   - Hero 3D parallax (transform/opacity only, no backdrop-filter)
   - Depth bar fill on load
   - IntersectionObserver reveal
   ============================================================ */

(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- NAV SCROLL --- */
  const nav = document.querySelector('.nav');
  function updateNav() {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* --- MOBILE MENU --- */
  const toggle = document.querySelector('.nav-toggle');
  const navList = document.getElementById('nav-list');
  if (toggle && navList) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      navList.classList.toggle('open', !expanded);
      document.body.style.overflow = expanded ? '' : 'hidden';
    });
    navList.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        navList.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* --- DEPTH BAR --- */
  const depthFill = document.querySelector('.depth-fill');
  if (depthFill && !prefersReduced) {
    requestAnimationFrame(() => {
      setTimeout(() => { depthFill.style.transform = 'scaleX(1)'; }, 300);
    });
  } else if (depthFill) {
    depthFill.style.transform = 'scaleX(1)';
  }

  /* --- HERO 3D MOUSE PARALLAX ---
       Only transform/opacity — no layout-triggering properties.
       Gentle tilt to reinforce depth perception of the satellite system. */
  const heroStage = document.querySelector('.hero-stage');
  const heroCenter = document.getElementById('hero-center');

  if (heroStage && heroCenter && !prefersReduced) {
    let ticking = false;
    let mx = 0, my = 0;
    let cx = window.innerWidth / 2;
    let cy = window.innerHeight / 2;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(applyParallax);
      }
    }, { passive: true });

    function applyParallax() {
      const dx = (mx - cx) / cx;   // -1 to 1
      const dy = (my - cy) / cy;
      const rotY = dx * 4;          // max 4deg
      const rotX = -dy * 2.5;       // max 2.5deg
      heroCenter.style.transform =
        `translate(-50%, -50%) translateZ(0px) rotateY(${rotY}deg) rotateX(${rotX}deg)`;
      ticking = false;
    }

    window.addEventListener('resize', () => {
      cx = window.innerWidth / 2;
      cy = window.innerHeight / 2;
    });
  }

  /* --- INTERSECTION REVEAL --- */
  const revealEls = document.querySelectorAll(
    '.about-grid, .gallery-grid .gal-item, .process-step, .class-card, .gallery-header, .class-header, .process-header'
  );

  revealEls.forEach(el => el.classList.add('reveal'));

  if (!prefersReduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => {
      el.classList.add('visible');
    });
  }

})();
