/* ============================================================
   FORM 2026 — script.js
   VISUAL_MECHANISM: 컬러필드 / 그라디언트 상태 전이
   MACRO_STRUCTURE: 대각선·회전축 구성
   ALL animated frames change only transform / opacity (THE LAW)
   No blur/shadow/filter on any moving layer (THE TRAP avoided)
   ============================================================ */

(function () {
  'use strict';

  /* ── 1. Lenis smooth scroll setup ─────────────────── */
  const lenis = new Lenis({
    duration: 1.1,
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    smoothWheel: true,
    syncTouch: false,
  });

  function lenisRaf(time) {
    lenis.raf(time);
    requestAnimationFrame(lenisRaf);
  }
  requestAnimationFrame(lenisRaf);

  /* Sync Lenis with GSAP ScrollTrigger */
  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add(function (time) {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  /* ── 2. Register ScrollTrigger ─────────────────────── */
  gsap.registerPlugin(ScrollTrigger);

  /* ── 3. Reduced-motion guard ───────────────────────── */
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    /* Restore all reveal elements immediately — no animation */
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    /* Still run tab logic and nav highlight — those are not motion-dependent */
  }

  /* ── 4. Hero colorfield — scroll-driven opacity transition ──
     VISUAL_MECHANISM: 그라디언트 상태 전이
     Only opacity changes per frame (THE LAW: transform/opacity only).
     The gradients themselves are static CSS — no re-paint on scroll.
  ─────────────────────────────────────────────────────────── */
  if (!prefersReducedMotion) {
    var cfZones = document.querySelectorAll('.cf-zone');

    /* Colorfield state transition: as user scrolls out of hero,
       the warm zone fades and cool zone brightens —
       a "destination change" feeling (GOVERNING_METAPHOR: arriving at a new city). */
    ScrollTrigger.create({
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.2,
      onUpdate: function (self) {
        var progress = self.progress;
        /* warm zone fades out */
        gsap.set('.cf-zone--a', { opacity: 0.7 - progress * 0.55 });
        /* cool zone fades in */
        gsap.set('.cf-zone--b', { opacity: 0.45 + progress * 0.35 });
        /* rust accent shifts */
        gsap.set('.cf-zone--c', { opacity: 1 - progress * 0.6 });
      }
    });

    /* Hero route path draw animation */
    var routePath = document.querySelector('.route-path');
    if (routePath) {
      var pathLength = routePath.getTotalLength ? routePath.getTotalLength() : 800;
      gsap.set(routePath, {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength,
        opacity: 0
      });

      gsap.to(routePath, {
        strokeDashoffset: 0,
        opacity: 0.55,
        duration: 2.4,
        ease: 'power2.out',
        delay: 0.5
      });

      /* Station markers: staggered pop-in (scale via transform only) */
      var stations = document.querySelectorAll('.route-station');
      gsap.from(stations, {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        ease: 'back.out(1.6)',
        stagger: 0.25,
        delay: 1.2,
        transformOrigin: 'center center'
      });
    }

    /* Hero content entrance — transform + opacity only */
    var heroElements = [
      '.hero-eyebrow',
      '.hero-headline',
      '.hero-desc',
      '.hero-actions',
      '.hero-meta'
    ];

    gsap.from(heroElements, {
      y: 32,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.12,
      delay: 0.1
    });

    /* ── 5. Section reveal — ScrollTrigger ─────────────── */
    var revealEls = document.querySelectorAll('.reveal');

    revealEls.forEach(function (el) {
      gsap.to(el, {
        y: 0,
        opacity: 1,
        duration: 0.75,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
          once: true
        }
      });
    });

    /* ── 6. Speaker cards — diagonal stagger ──────────── */
    var speakerCards = document.querySelectorAll('.speaker-card');
    if (speakerCards.length > 0) {
      gsap.from(speakerCards, {
        y: 48,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out',
        stagger: {
          amount: 0.6,
          from: 'start'
        },
        scrollTrigger: {
          trigger: '.speakers-grid',
          start: 'top 82%',
          toggleActions: 'play none none none',
          once: true
        }
      });
    }

    /* ── 7. Timetable rows — sequential reveal ──────── */
    var ttRows = document.querySelectorAll('#day1-panel .timetable-row');
    if (ttRows.length > 0) {
      gsap.from(ttRows, {
        x: -20,
        opacity: 0,
        duration: 0.55,
        ease: 'power2.out',
        stagger: 0.07,
        scrollTrigger: {
          trigger: '.timetable',
          start: 'top 85%',
          toggleActions: 'play none none none',
          once: true
        }
      });
    }

    /* ── 8. Ticket cards — diagonal entrance ─────────── */
    var ticketCards = document.querySelectorAll('.ticket-card');
    if (ticketCards.length > 0) {
      gsap.from(ticketCards, {
        y: 40,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: '.tickets-grid',
          start: 'top 85%',
          toggleActions: 'play none none none',
          once: true
        }
      });
    }
  }

  /* ── 9. Schedule tab switching ─────────────────────── */
  var tabBtns = document.querySelectorAll('.tab-btn');
  var panels = document.querySelectorAll('.schedule-panel');

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var targetId = btn.getAttribute('aria-controls');

      /* Update tab states */
      tabBtns.forEach(function (b) {
        b.classList.remove('tab-btn--active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('tab-btn--active');
      btn.setAttribute('aria-selected', 'true');

      /* Show/hide panels */
      panels.forEach(function (panel) {
        if (panel.id === targetId) {
          panel.classList.remove('schedule-panel--hidden');

          /* Animate day 2 rows in (transform + opacity only) */
          if (!prefersReducedMotion) {
            var rows = panel.querySelectorAll('.timetable-row');
            gsap.from(rows, {
              x: -16,
              opacity: 0,
              duration: 0.45,
              ease: 'power2.out',
              stagger: 0.05
            });
          } else {
            /* Reduced motion: ensure visibility */
            panel.querySelectorAll('.timetable-row').forEach(function (r) {
              r.style.opacity = '1';
              r.style.transform = 'none';
            });
          }
        } else {
          panel.classList.add('schedule-panel--hidden');
        }
      });

      /* Refresh ScrollTrigger after DOM change */
      ScrollTrigger.refresh();
    });
  });

  /* ── 10. Nav active link highlight on scroll ─────── */
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-links a');

  function updateActiveNav() {
    var scrollY = window.scrollY || window.pageYOffset;
    var active = '';

    sections.forEach(function (sec) {
      var top = sec.offsetTop - 80;
      var height = sec.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        active = sec.id;
      }
    });

    navLinks.forEach(function (link) {
      var href = link.getAttribute('href').replace('#', '');
      if (href === active) {
        link.style.color = 'var(--col-rust)';
      } else {
        link.style.color = '';
      }
    });
  }

  /* Use lenis scroll event (not window scroll) to avoid double handler */
  lenis.on('scroll', updateActiveNav);
  updateActiveNav();

  /* ── 11. Nav background on scroll ────────────────── */
  var siteHeader = document.querySelector('.site-header');
  ScrollTrigger.create({
    start: 80,
    onEnter: function () {
      siteHeader.style.boxShadow = '0 2px 16px rgba(26,21,16,0.08)';
    },
    onLeaveBack: function () {
      siteHeader.style.boxShadow = '';
    }
  });

})();
