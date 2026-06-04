(function () {
  'use strict';

  /* ——— HERO CANVAS: seeded grain texture ——— */
  function spark_initCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    function spark_drawGrain() {
      const ctx = canvas.getContext('2d');
      const W = canvas.width = canvas.offsetWidth;
      const H = canvas.height = canvas.offsetHeight;

      let spark_seed = 2024;
      const spark_rng = function () {
        spark_seed = (spark_seed * 1664525 + 1013904223) & 0x7fffffff;
        return spark_seed / 0x7fffffff;
      };

      ctx.clearRect(0, 0, W, H);

      const count = Math.floor(W * H / 32);
      ctx.beginPath();
      for (let i = 0; i < count; i++) {
        const x = spark_rng() * W;
        const y = spark_rng() * H;
        const v = spark_rng();
        if (v > 0.89) {
          const a = (v - 0.89) / 0.11 * 0.055;
          ctx.globalAlpha = a;
          ctx.fillStyle = 'rgb(72, 48, 28)';
          const r = spark_rng() * 1.2 + 0.3;
          ctx.moveTo(x + r, y);
          ctx.arc(x, y, r, 0, Math.PI * 2);
        }
      }
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    spark_drawGrain();

    let spark_resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(spark_resizeTimer);
      spark_resizeTimer = setTimeout(spark_drawGrain, 200);
    });
  }

  /* ——— LENIS SMOOTH SCROLL ——— */
  function spark_initLenis() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return null;

    const spark_lenis = new Lenis({
      duration: 1.2,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }
    });

    spark_lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { spark_lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    return spark_lenis;
  }

  /* ——— PROGRESS BAR ——— */
  function spark_initProgress() {
    const bar = document.getElementById('progressBar');
    if (!bar) return;

    ScrollTrigger.create({
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: function (self) {
        bar.style.transform = 'scaleX(' + self.progress + ')';
      }
    });
  }

  /* ——— NAV: scroll state + mobile toggle ——— */
  function spark_initNav() {
    const nav = document.getElementById('mainNav');
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (!nav || !toggle || !links) return;

    ScrollTrigger.create({
      start: 80,
      onEnter: function () { nav.classList.add('is-scrolled'); },
      onLeaveBack: function () { nav.classList.remove('is-scrolled'); }
    });

    toggle.addEventListener('click', function () {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      toggle.setAttribute('aria-label', isOpen ? '메뉴 열기' : '메뉴 닫기');
      links.classList.toggle('is-open', !isOpen);
      nav.classList.toggle('is-open', !isOpen);
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    links.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', '메뉴 열기');
        links.classList.remove('is-open');
        nav.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ——— HERO ENTRY ANIMATIONS ——— */
  function spark_initHeroAnims() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const tl = gsap.timeline({ delay: 0.2 });

    tl.from('.hero-wheel-deco', {
      opacity: 0,
      scale: 0.6,
      duration: 0.9,
      ease: 'power2.out'
    })
    .from('.hero-title-main', {
      opacity: 0,
      y: 60,
      duration: 1.1,
      ease: 'power3.out'
    }, '-=0.5')
    .from('.hero-title-sub', {
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: 'power2.out'
    }, '-=0.6')
    .from('.hero-desc', {
      opacity: 0,
      y: 24,
      duration: 0.8,
      ease: 'power2.out'
    }, '-=0.5')
    .from('.hero-cta', {
      opacity: 0,
      y: 16,
      duration: 0.7,
      ease: 'power2.out'
    }, '-=0.5')
    .from('.hero-image-frame', {
      opacity: 0,
      y: 50,
      scale: 0.97,
      duration: 1.2,
      ease: 'power3.out'
    }, '-=0.9')
    .from('.hero-image-tag', {
      opacity: 0,
      x: -10,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.3')
    .from('.hero-scroll-hint', {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out'
    }, '-=0.2');
  }

  /* ——— GENERIC REVEAL ANIMATIONS ——— */
  function spark_initReveals() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      const dir = el.getAttribute('data-reveal');
      const delay = parseFloat(el.getAttribute('data-delay') || '0');
      let fromVars = { opacity: 0, duration: 0.95, ease: 'power3.out', delay: delay };

      if (dir === 'up')    { fromVars.y = 48; }
      if (dir === 'left')  { fromVars.x = -56; }
      if (dir === 'right') { fromVars.x = 56; }

      gsap.from(el, Object.assign({}, fromVars, {
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
        }
      }));
    });
  }

  /* ——— GALLERY CIRCLE REVEAL — SURPRISE ELEMENT ——— */
  function spark_initGalleryReveal() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.querySelectorAll('.gallery-item').forEach(function (item, idx) {
      const img = item.querySelector('.gallery-img');
      if (!img) return;

      if (prefersReduced) {
        gsap.set(img, { clipPath: 'circle(100% at 50% 50%)' });
        return;
      }

      gsap.fromTo(img,
        { clipPath: 'circle(0% at 50% 50%)' },
        {
          clipPath: 'circle(75% at 50% 50%)',
          duration: 1.1,
          ease: 'power2.inOut',
          delay: (idx % 2) * 0.12,
          scrollTrigger: {
            trigger: item,
            start: 'top 90%',
          }
        }
      );
    });
  }

  /* ——— PROCESS HORIZONTAL SCROLL ——— */
  function spark_initProcess() {
    const track = document.getElementById('processTrack');
    const wrapper = document.getElementById('processWrapper');
    if (!track || !wrapper) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const spark_mm = gsap.matchMedia();

    spark_mm.add('(min-width: 769px)', function () {
      ScrollTrigger.refresh();

      const spark_scrollDist = track.scrollWidth - window.innerWidth;
      if (spark_scrollDist <= 0) return;

      gsap.to(track, {
        x: -spark_scrollDist,
        ease: 'none',
        scrollTrigger: {
          trigger: wrapper,
          start: 'top top',
          end: '+=' + spark_scrollDist,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        }
      });
    });
  }

  /* ——— ABOUT PARALLAX (subtle) ——— */
  function spark_initAboutParallax() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    gsap.to('.about-image-wrap', {
      yPercent: -8,
      ease: 'none',
      scrollTrigger: {
        trigger: '.about',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
      }
    });
  }

  /* ——— ANCHOR SCROLL (Lenis) ——— */
  function spark_initAnchorScroll(spark_lenisRef) {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        if (spark_lenisRef) {
          spark_lenisRef.scrollTo(target, { duration: 1.2 });
        } else {
          target.scrollIntoView();
        }
      });
    });
  }

  /* ——— INIT ——— */
  document.addEventListener('DOMContentLoaded', function () {
    gsap.registerPlugin(ScrollTrigger);

    spark_initCanvas();
    const spark_lenisInst = spark_initLenis();

    spark_initProgress();
    spark_initNav();
    spark_initAnchorScroll(spark_lenisInst);
    spark_initHeroAnims();
    spark_initReveals();
    spark_initGalleryReveal();
    spark_initProcess();
    spark_initAboutParallax();

    ScrollTrigger.refresh();
  });

})();
