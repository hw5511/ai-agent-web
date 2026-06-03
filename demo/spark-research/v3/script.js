/* ─────────────────────────────────────────────────────────
   NOCTURNE — script.js
   ───────────────────────────────────────────────────────── */

(function () {
  'use strict';

  /* ── Reduced-motion guard ─────────────────────────────── */
  const spark_prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Lenis smooth scroll ──────────────────────────────── */
  const spark_lenis = new Lenis({
    duration: 1.2,
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }
  });

  if (spark_prefersReduced) {
    spark_lenis.destroy();
  } else {
    spark_lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { spark_lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ── GSAP setup ───────────────────────────────────────── */
  gsap.registerPlugin(ScrollTrigger);

  /* ── Hero canvas — moonlit night sky ─────────────────── */
  {
    const spark_canvas = document.getElementById('spark_heroCanvas');
    if (spark_canvas && !spark_prefersReduced) {
      const spark_ctx = spark_canvas.getContext('2d');

      /* Seeded RNG — Mulberry32, seed = 0x4E4F4354 ("NOCT") */
      function spark_mulberry32(seed) {
        return function () {
          let t = (seed += 0x6D2B79F5) >>> 0;
          t = Math.imul(t ^ (t >>> 15), t | 1);
          t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
      }

      const spark_rng = spark_mulberry32(0x4E4F4354);

      /* Stars: seeded, deterministic */
      const spark_stars = Array.from({ length: 240 }, function () {
        return {
          rx:      spark_rng(),
          ry:      spark_rng(),
          size:    spark_rng() * 1.4 + 0.2,
          alpha:   spark_rng() * 0.65 + 0.1,
          phase:   spark_rng() * Math.PI * 2,
          depth:   spark_rng() * 0.8 + 0.2
        };
      });

      let spark_canvasW = 0;
      let spark_canvasH = 0;

      function spark_resizeCanvas() {
        spark_canvasW = spark_canvas.offsetWidth;
        spark_canvasH = spark_canvas.offsetHeight;
        spark_canvas.width  = spark_canvasW * window.devicePixelRatio;
        spark_canvas.height = spark_canvasH * window.devicePixelRatio;
        spark_ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }

      spark_resizeCanvas();
      window.addEventListener('resize', spark_resizeCanvas, { passive: true });

      /* Mouse parallax — smooth interpolation */
      let spark_mx = 0;
      let spark_my = 0;
      let spark_tx = 0;
      let spark_ty = 0;

      const spark_heroEl = document.getElementById('spark_hero');
      if (spark_heroEl) {
        spark_heroEl.addEventListener('mousemove', function (e) {
          const rect = spark_heroEl.getBoundingClientRect();
          spark_mx = (e.clientX - rect.left) / rect.width  - 0.5;
          spark_my = (e.clientY - rect.top)  / rect.height - 0.5;
        }, { passive: true });
      }

      let spark_rafId = null;

      function spark_renderFrame(ts) {
        if (!spark_canvasW || !spark_canvasH) {
          spark_rafId = requestAnimationFrame(spark_renderFrame);
          return;
        }

        const t = ts * 0.001;

        /* Lerp mouse */
        spark_tx += (spark_mx - spark_tx) * 0.04;
        spark_ty += (spark_my - spark_ty) * 0.04;

        const W = spark_canvasW;
        const H = spark_canvasH;

        spark_ctx.clearRect(0, 0, W, H);

        /* Moon haze — upper-right quadrant, parallaxed */
        const hx = W * 0.66 + spark_tx * 28;
        const hy = H * 0.24 + spark_ty * 18;
        const hr = Math.min(W, H) * 0.45;

        const grdHaze = spark_ctx.createRadialGradient(hx, hy, 0, hx, hy, hr);
        grdHaze.addColorStop(0,    'rgba(220, 200, 160, 0.07)');
        grdHaze.addColorStop(0.45, 'rgba(170, 148, 110, 0.035)');
        grdHaze.addColorStop(1,    'rgba(0,0,0,0)');
        spark_ctx.fillStyle = grdHaze;
        spark_ctx.fillRect(0, 0, W, H);

        /* Moon core */
        const mcx = W * 0.68 + spark_tx * 12;
        const mcy = H * 0.20 + spark_ty * 8;
        const mcr = Math.min(W, H) * 0.07;
        const grdMoon = spark_ctx.createRadialGradient(mcx, mcy, 0, mcx, mcy, mcr);
        grdMoon.addColorStop(0,   'rgba(245, 235, 215, 0.28)');
        grdMoon.addColorStop(0.5, 'rgba(210, 190, 155, 0.10)');
        grdMoon.addColorStop(1,   'rgba(0,0,0,0)');
        spark_ctx.fillStyle = grdMoon;
        spark_ctx.fillRect(0, 0, W, H);

        /* Stars — batched by similar alpha for performance */
        spark_ctx.beginPath();
        for (let i = 0; i < spark_stars.length; i++) {
          const s = spark_stars[i];
          const px = s.rx * W + spark_tx * s.depth * 14;
          const py = s.ry * H + spark_ty * s.depth * 8;
          const twinkle = Math.sin(t * 0.55 + s.phase) * 0.12;
          const a = Math.max(0, Math.min(1, s.alpha + twinkle));
          spark_ctx.globalAlpha = a;
          spark_ctx.moveTo(px + s.size, py);
          spark_ctx.arc(px, py, s.size, 0, 6.283185307);
        }
        spark_ctx.fillStyle = 'rgb(228, 218, 198)';
        spark_ctx.fill();
        spark_ctx.globalAlpha = 1;

        /* Subtle ground mist — lower quarter */
        const gmY = H * 0.78;
        const grdMist = spark_ctx.createLinearGradient(0, gmY, 0, H);
        grdMist.addColorStop(0, 'rgba(0,0,0,0)');
        grdMist.addColorStop(1, 'rgba(14, 12, 20, 0.55)');
        spark_ctx.fillStyle = grdMist;
        spark_ctx.fillRect(0, gmY, W, H - gmY);

        spark_rafId = requestAnimationFrame(spark_renderFrame);
      }

      /* Pause canvas when hero is out of view */
      const spark_heroObserver = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          if (!spark_rafId) spark_rafId = requestAnimationFrame(spark_renderFrame);
        } else {
          if (spark_rafId) { cancelAnimationFrame(spark_rafId); spark_rafId = null; }
        }
      }, { threshold: 0.01 });

      spark_heroObserver.observe(spark_canvas);
    }
  }

  /* ── Navigation ───────────────────────────────────────── */
  {
    const spark_navEl     = document.getElementById('spark_nav');
    const spark_navToggle = document.getElementById('spark_navToggle');
    const spark_navLinks  = document.getElementById('spark_navLinks');

    /* Scroll state */
    let spark_lastScrollY = 0;
    window.addEventListener('scroll', function () {
      const sy = window.scrollY;
      if (sy > 60) {
        spark_navEl.classList.add('nav--scrolled');
      } else {
        spark_navEl.classList.remove('nav--scrolled');
      }
      spark_lastScrollY = sy;
    }, { passive: true });

    /* Mobile toggle */
    if (spark_navToggle && spark_navLinks) {
      spark_navToggle.addEventListener('click', function () {
        const isOpen = spark_navToggle.getAttribute('aria-expanded') === 'true';
        spark_navToggle.setAttribute('aria-expanded', String(!isOpen));
        spark_navToggle.setAttribute('aria-label', isOpen ? '메뉴 열기' : '메뉴 닫기');
        spark_navLinks.classList.toggle('nav-links--open', !isOpen);
        document.body.style.overflow = isOpen ? '' : 'hidden';
      });

      /* Close on link click */
      spark_navLinks.querySelectorAll('.nav-link').forEach(function (link) {
        link.addEventListener('click', function () {
          spark_navToggle.setAttribute('aria-expanded', 'false');
          spark_navToggle.setAttribute('aria-label', '메뉴 열기');
          spark_navLinks.classList.remove('nav-links--open');
          document.body.style.overflow = '';
        });
      });

      /* Close on outside click */
      document.addEventListener('click', function (e) {
        if (
          spark_navLinks.classList.contains('nav-links--open') &&
          !spark_navEl.contains(e.target)
        ) {
          spark_navToggle.setAttribute('aria-expanded', 'false');
          spark_navToggle.setAttribute('aria-label', '메뉴 열기');
          spark_navLinks.classList.remove('nav-links--open');
          document.body.style.overflow = '';
        }
      });
    }

    /* Smooth anchor scroll via Lenis */
    document.querySelectorAll('a[href^="#spark_"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const targetId = anchor.getAttribute('href').slice(1);
        const target   = document.getElementById(targetId);
        if (target && !spark_prefersReduced) {
          e.preventDefault();
          spark_lenis.scrollTo(target, { offset: -64 });
        }
      });
    });
  }

  /* ── Scroll Progress Bar ──────────────────────────────── */
  {
    const spark_progress = document.getElementById('spark_progressBar');
    if (spark_progress) {
      window.addEventListener('scroll', function () {
        const docH   = document.documentElement.scrollHeight - window.innerHeight;
        const pct    = docH > 0 ? (window.scrollY / docH) * 100 : 0;
        spark_progress.style.width = pct.toFixed(2) + '%';
        spark_progress.setAttribute('aria-valuenow', Math.round(pct));
      }, { passive: true });
    }
  }

  /* ── Animations (motion only) ─────────────────────────── */
  const spark_mm = gsap.matchMedia();

  spark_mm.add('(prefers-reduced-motion: no-preference)', function () {

    /* Set initial hidden state before timeline plays */
    gsap.set(['.hero-kicker', '.hero-title-top', '.hero-title-bot', '.hero-tagline', '.hero-cta'], {
      opacity: 0,
      y: 28
    });

    /* Hero entrance timeline */
    gsap.timeline({ delay: 0.25 })
      .to('.hero-kicker',    { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' })
      .to('.hero-title-top', { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' }, '-=0.5')
      .to('.hero-title-bot', { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' }, '-=0.8')
      .to('.hero-tagline',   { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.6')
      .to('.hero-cta',       { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.5');

    /* Scroll-triggered reveals */
    gsap.utils.toArray('[data-reveal]').forEach(function (el) {
      gsap.fromTo(el,
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 82%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    });

    /* Quote reveal with extra punch */
    gsap.fromTo('[data-reveal="quote"]',
      { opacity: 0, x: -40 },
      {
        opacity: 1,
        x: 0,
        duration: 1.1,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: '[data-reveal="quote"]',
          start: 'top 80%',
          once: true
        }
      }
    );

    /* Process steps — staggered from left */
    gsap.fromTo('.process-step',
      { opacity: 0, x: -36 },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.process-list',
          start: 'top 78%',
          once: true
        }
      }
    );

    /* Hero parallax — content drifts up on scroll */
    gsap.to('.hero-inner', {
      y: -80,
      ease: 'none',
      scrollTrigger: {
        trigger: '#spark_hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });

    /* Collection cards spring hover */
    document.querySelectorAll('.frag-card').forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        gsap.to(card, {
          y: -6,
          scale: 1.013,
          duration: 0.65,
          ease: 'elastic.out(1, 0.55)',
          overwrite: 'auto'
        });
      });

      card.addEventListener('mouseleave', function () {
        gsap.to(card, {
          y: 0,
          scale: 1,
          duration: 0.55,
          ease: 'elastic.out(1, 0.6)',
          overwrite: 'auto'
        });
      });
    });

    /* Process step number accent on hover */
    document.querySelectorAll('.process-step').forEach(function (step) {
      const num = step.querySelector('.step-num');
      if (!num) return;
      step.addEventListener('mouseenter', function () {
        gsap.to(num, { color: 'var(--c-accent-dim)', duration: 0.35 });
      });
      step.addEventListener('mouseleave', function () {
        gsap.to(num, { color: 'var(--c-border)', duration: 0.4 });
      });
    });

    /* Form submit button spring press */
    const spark_submitBtn = document.querySelector('.form-submit');
    if (spark_submitBtn) {
      spark_submitBtn.addEventListener('mousedown', function () {
        gsap.to(spark_submitBtn, { scale: 0.96, duration: 0.12, ease: 'power2.in' });
      });
      spark_submitBtn.addEventListener('mouseup', function () {
        gsap.to(spark_submitBtn, { scale: 1, duration: 0.45, ease: 'elastic.out(1, 0.5)' });
      });
      spark_submitBtn.addEventListener('mouseleave', function () {
        gsap.to(spark_submitBtn, { scale: 1, duration: 0.3, ease: 'power2.out' });
      });
    }

  }); /* end matchMedia */

  /* ── Reservation form ─────────────────────────────────── */
  {
    const spark_form    = document.getElementById('spark_reservationForm');
    const spark_success = document.getElementById('spark_formSuccess');

    if (spark_form && spark_success) {
      spark_form.addEventListener('submit', function (e) {
        e.preventDefault();

        const nameVal  = spark_form.querySelector('#res-name').value.trim();
        const emailVal = spark_form.querySelector('#res-email').value.trim();
        const dateVal  = spark_form.querySelector('#res-date').value;

        if (!nameVal || !emailVal || !dateVal) {
          /* Basic validation — focus first empty field */
          if (!nameVal)  { spark_form.querySelector('#res-name').focus();  return; }
          if (!emailVal) { spark_form.querySelector('#res-email').focus(); return; }
          if (!dateVal)  { spark_form.querySelector('#res-date').focus();  return; }
        }

        /* Success state */
        const spark_submitEl = spark_form.querySelector('.form-submit');
        if (spark_submitEl) spark_submitEl.disabled = true;

        spark_success.hidden = false;
        spark_form.reset();

        if (spark_submitEl && !spark_prefersReduced) {
          gsap.fromTo(spark_success,
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
          );
        }
      });
    }
  }

})();
