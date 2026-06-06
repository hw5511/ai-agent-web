/* =====================================================
   공간연구소 — script.js
   PERSONA: 영화 타이틀 시퀀스 디자이너
   VISUAL_MECHANISM: SVG 도형 모핑 / 경로 드로잉
   WILD_CONCEPT: 나이키의 서사적 전개 (3막 구조)

   PERFORMANCE LAW:
   - Every animated frame changes ONLY transform / opacity
   - SVG stroke-dashoffset is paint but on isolated SVG layer (no repaint of DOM)
   - No blur / shadow / filter / blend on any moving layer
   - will-change set/cleared dynamically
   ===================================================== */

(function () {
  'use strict';

  /* ── Guard: reduced-motion ──────────────────────── */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Lenis smooth scroll ────────────────────────── */
  let lenis;
  if (!prefersReduced) {
    lenis = new Lenis({
      duration: 1.1,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    /* connect Lenis to GSAP ScrollTrigger */
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  /* ── Footer year ────────────────────────────────── */
  var yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ── GSAP + ScrollTrigger registration ─────────── */
  gsap.registerPlugin(ScrollTrigger);

  /* ── Helper: get total path length ─────────────── */
  function setDashArray(el) {
    if (!el) return;
    var len = el.getTotalLength ? el.getTotalLength() : 2000;
    el.style.strokeDasharray = len;
    el.style.strokeDashoffset = len;
    return len;
  }

  /* ── Hero intro sequence ────────────────────────── */
  /* Mirrors a film title sequence: label fades, then headline
     lines slide up one by one (like title cards), then sub + CTA */

  /* Wrap each hero headline span text in an inner span for clip reveal */
  var heroLines = document.querySelectorAll('.hero-line');
  heroLines.forEach(function (line) {
    var text = line.innerHTML;
    line.innerHTML = '<span class="hero-line-inner">' + text + '</span>';
  });

  var heroLabel = document.querySelector('.hero-sequence-label');
  var heroInners = document.querySelectorAll('.hero-line-inner');
  var heroSub = document.querySelector('.hero-sub');
  var heroCta = document.querySelector('.cta-primary');
  var scrollHint = document.querySelector('.scroll-hint');

  if (!prefersReduced) {
    var tl = gsap.timeline({ delay: 0.25 });

    /* Label */
    if (heroLabel) {
      tl.to(heroLabel, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
      });
    }

    /* Headline lines — clip-reveal via translateY */
    if (heroInners.length) {
      tl.to(heroInners, {
        y: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power4.out',
      }, '-=0.2');
    }

    /* Sub + CTA */
    if (heroSub) {
      tl.to(heroSub, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
      }, '-=0.3');
    }
    if (heroCta) {
      tl.to(heroCta, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power3.out',
      }, '-=0.4');
    }
    if (scrollHint) {
      tl.to(scrollHint, {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
      }, '-=0.2');
    }

    /* ── SVG path drawing — hero arch (VISUAL_MECHANISM) ── */
    /* stroke-dashoffset animates on isolated SVG element — composite-safe */
    var drawPaths = document.querySelectorAll('.draw-path');
    drawPaths.forEach(function (path, i) {
      var len = setDashArray(path);

      tl.to(path, {
        strokeDashoffset: 0,
        duration: 1.4,
        ease: 'power2.inOut',
        onStart: function () {
          /* will-change only while animating */
          path.style.willChange = 'stroke-dashoffset';
        },
        onComplete: function () {
          path.style.willChange = 'auto';
        },
      }, i * 0.18);
    });

    /* Morph circle — fade in after arch */
    var morphCircle = document.querySelector('.morph-circle');
    if (morphCircle) {
      tl.to(morphCircle, {
        opacity: 0.6,
        duration: 0.6,
        ease: 'power2.out',
      }, '-=0.4');

      /* Subtle breathing scale on morph circle (transform only, composite) */
      gsap.to(morphCircle, {
        attr: { r: 38 },
        duration: 3,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 2.5,
      });
    }
  } else {
    /* Reduced-motion: make everything immediately visible */
    [heroLabel, heroSub, heroCta, scrollHint].forEach(function (el) {
      if (el) { el.style.opacity = '1'; el.style.transform = 'none'; }
    });
    heroInners.forEach(function (el) { el.style.transform = 'none'; });
    drawPaths && document.querySelectorAll('.draw-path').forEach(function (p) {
      p.style.strokeDashoffset = '0';
    });
    if (scrollHint) scrollHint.style.opacity = '1';
  }

  /* ── Header scroll state ────────────────────────── */
  var header = document.querySelector('.site-header');
  if (header) {
    ScrollTrigger.create({
      start: 'top+=80 top',
      onEnter: function () { header.classList.add('scrolled'); },
      onLeaveBack: function () { header.classList.remove('scrolled'); },
    });
  }

  /* ── Act counter update on scroll ──────────────── */
  var acts = document.querySelectorAll('.act');
  var actSections = ['#projects', '#philosophy', '#studio'];

  actSections.forEach(function (selector, i) {
    var el = document.querySelector(selector);
    if (!el || !acts.length) return;

    ScrollTrigger.create({
      trigger: el,
      start: 'top center',
      end: 'bottom center',
      onEnter: function () { updateAct(i + 1); },
      onLeaveBack: function () { updateAct(i); },
    });
  });

  function updateAct(index) {
    acts.forEach(function (act, i) {
      act.classList.toggle('act--active', i === index);
    });
  }

  /* ── Scroll reveal ──────────────────────────────── */
  /* opacity + translateY only — THE LAW compliant */
  var revealEls = document.querySelectorAll('.reveal');

  if (!prefersReduced) {
    revealEls.forEach(function (el, i) {
      var delay = el.dataset.revealDelay ? parseFloat(el.dataset.revealDelay) : 0;

      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: function () {
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.65,
            delay: delay,
            ease: 'power3.out',
            onStart: function () {
              el.style.willChange = 'transform, opacity';
            },
            onComplete: function () {
              el.classList.add('is-visible');
              el.style.willChange = 'auto';
            },
          });
        },
      });
    });
  } else {
    /* Restore all to visible immediately */
    revealEls.forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.classList.add('is-visible');
    });
  }

  /* ── Philosophy SVG path draw on scroll ─────────── */
  var philoPaths = document.querySelectorAll('.philo-path');
  philoPaths.forEach(function (path) {
    var len = setDashArray(path);
  });

  if (!prefersReduced && philoPaths.length) {
    var philosophySvg = document.querySelector('.philosophy-svg');
    if (philosophySvg) {
      gsap.to(philoPaths, {
        strokeDashoffset: 0,
        duration: 1.6,
        stagger: 0.25,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: philosophySvg,
          start: 'top 75%',
          once: true,
        },
      });
    }
  } else {
    philoPaths.forEach(function (p) { p.style.strokeDashoffset = '0'; });
  }

  /* ── Contact SVG draw on scroll ─────────────────── */
  var contactPath = document.querySelector('.contact-draw-path');
  if (contactPath) {
    setDashArray(contactPath);
    if (!prefersReduced) {
      gsap.to(contactPath, {
        strokeDashoffset: 0,
        duration: 1.2,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: contactPath,
          start: 'top 90%',
          once: true,
        },
      });
    } else {
      contactPath.style.strokeDashoffset = '0';
    }
  }

  /* ── Mobile nav toggle ───────────────────────────── */
  var navToggle = document.querySelector('.nav-toggle');
  var mobileNav = document.getElementById('main-nav-mobile');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isOpen));
      mobileNav.hidden = isOpen;

      /* Pause lenis when nav open */
      if (lenis) {
        if (!isOpen) {
          lenis.stop();
        } else {
          lenis.start();
        }
      }
    });

    /* Close on link click */
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navToggle.setAttribute('aria-expanded', 'false');
        mobileNav.hidden = true;
        if (lenis) lenis.start();
      });
    });
  }

  /* ── Project card stagger on scroll ─────────────── */
  if (!prefersReduced) {
    var projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(function (card, i) {
      /* Override default reveal delay for grid stagger */
      card.style.transitionDelay = (i % 2) * 0.12 + 's';
    });
  }

  /* ── Subtle parallax on hero SVG stage (transform only) ─ */
  /* Only translateY — composite, no paint */
  if (!prefersReduced) {
    var heroSvgStage = document.querySelector('.hero-svg-stage');
    if (heroSvgStage) {
      gsap.to(heroSvgStage, {
        y: '-8%',
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
        onStart: function () {
          heroSvgStage.style.willChange = 'transform';
        },
        onComplete: function () {
          heroSvgStage.style.willChange = 'auto';
        },
      });
    }
  }

})();
