(function () {
  'use strict';

  /* ── Reduced motion gate ──────────────────── */
  const spark_rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── GSAP register ────────────────────────── */
  gsap.registerPlugin(ScrollTrigger);

  /* ── Lenis ────────────────────────────────── */
  let spark_lenis = null;
  if (!spark_rm) {
    spark_lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    });
    spark_lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => spark_lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ── Progress bar ─────────────────────────── */
  const spark_bar = document.getElementById('progressBar');
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const pct = (self.progress * 100).toFixed(1);
      spark_bar.style.setProperty('--progress', pct + '%');
      spark_bar.setAttribute('aria-valuenow', Math.round(self.progress * 100));
    }
  });

  /* ── Nav scroll state ─────────────────────── */
  const spark_nav = document.querySelector('.nav');
  ScrollTrigger.create({
    start: 80,
    onEnter:     () => spark_nav.classList.add('nav--scrolled'),
    onLeaveBack: () => spark_nav.classList.remove('nav--scrolled'),
  });

  /* ── Anchor smooth scroll ─────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      if (spark_lenis) {
        spark_lenis.scrollTo(target, { offset: -72 });
      } else {
        const y = target.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top: y });
      }
    });
  });

  /* ── Mobile menu ──────────────────────────── */
  const spark_toggle  = document.getElementById('navToggle');
  const spark_menu    = document.getElementById('mobileMenu');
  const spark_menuClose = document.getElementById('menuClose');

  function spark_openMenu() {
    spark_menu.setAttribute('aria-hidden', 'false');
    spark_toggle.setAttribute('aria-expanded', 'true');
    spark_toggle.setAttribute('aria-label', '메뉴 닫기');
    document.body.style.overflow = 'hidden';
  }
  function spark_closeMenu() {
    spark_menu.setAttribute('aria-hidden', 'true');
    spark_toggle.setAttribute('aria-expanded', 'false');
    spark_toggle.setAttribute('aria-label', '메뉴 열기');
    document.body.style.overflow = '';
  }

  spark_toggle.addEventListener('click', () => {
    const open = spark_menu.getAttribute('aria-hidden') === 'false';
    open ? spark_closeMenu() : spark_openMenu();
  });
  spark_menuClose.addEventListener('click', spark_closeMenu);
  spark_menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', spark_closeMenu));

  /* ── HERO CANVAS — Spectral waves ─────────── */
  const spark_canvas = document.getElementById('heroCanvas');
  if (spark_canvas) {
    const spark_ctx = spark_canvas.getContext('2d');

    /* Seeded RNG for reproducible wave params */
    let spark_seed = 2847;
    function spark_rand() {
      spark_seed = (spark_seed * 1664525 + 1013904223) & 0xffffffff;
      return (spark_seed >>> 0) / 0xffffffff;
    }

    /* Spectrum bands: violet → red */
    const spark_bands = [
      { color: '#7b2fff', glow: 'rgba(123,47,255,0.55)' },
      { color: '#3b6fff', glow: 'rgba(59,111,255,0.55)'  },
      { color: '#00bfff', glow: 'rgba(0,191,255,0.55)'   },
      { color: '#00e87a', glow: 'rgba(0,232,122,0.55)'   },
      { color: '#e8d200', glow: 'rgba(232,210,0,0.55)'   },
      { color: '#ff7a00', glow: 'rgba(255,122,0,0.55)'   },
      { color: '#ff2200', glow: 'rgba(255,34,0,0.55)'    },
    ];

    /* Generate wave parameters once (seeded) */
    const spark_waves = spark_bands.map((band) => ({
      color:     band.color,
      glow:      band.glow,
      amplitude: 18 + spark_rand() * 28,
      freq:      0.0025 + spark_rand() * 0.0028,
      phase:     spark_rand() * Math.PI * 2,
      speed:     0.28 + spark_rand() * 0.42,
      width:     2.5 + spark_rand() * 2.5,
      yOffset:   0,
    }));

    /* Ambient particles (p-002 빛의 파편) */
    const PARTICLE_COUNT = 60;
    let spark_particles = [];
    function spark_initParticles(W, H) {
      spark_particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        spark_particles.push({
          x:     Math.random() * W,
          y:     Math.random() * H,
          r:     0.5 + Math.random() * 1.5,
          vx:    (Math.random() - 0.5) * 0.2,
          vy:    (Math.random() - 0.5) * 0.2,
          alpha: 0.04 + Math.random() * 0.1,
          color: spark_bands[Math.floor(Math.random() * spark_bands.length)].color,
        });
      }
    }

    /* Mouse state with lerp */
    let spark_mxTarget = -2000;
    let spark_myTarget = -2000;
    let spark_mx = -2000;
    let spark_my = -2000;

    window.addEventListener('mousemove', (e) => {
      spark_mxTarget = e.clientX;
      spark_myTarget = e.clientY;
    });
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length) {
        spark_mxTarget = e.touches[0].clientX;
        spark_myTarget = e.touches[0].clientY;
      }
    }, { passive: true });

    /* Resize */
    function spark_resize() {
      spark_canvas.width  = window.innerWidth;
      spark_canvas.height = window.innerHeight;
      const bandTop    = spark_canvas.height * 0.22;
      const bandBottom = spark_canvas.height * 0.80;
      const span = bandBottom - bandTop;
      spark_waves.forEach((w, i) => {
        w.yOffset = bandTop + (i / (spark_waves.length - 1)) * span;
      });
      spark_initParticles(spark_canvas.width, spark_canvas.height);
    }
    spark_resize();
    window.addEventListener('resize', spark_resize);

    /* Draw loop */
    let spark_t = 0;
    let spark_raf = null;

    function spark_draw() {
      const W = spark_canvas.width;
      const H = spark_canvas.height;

      /* Lerp mouse — soft follow */
      spark_mx += (spark_mxTarget - spark_mx) * 0.055;
      spark_my += (spark_myTarget - spark_my) * 0.055;

      /* Background */
      spark_ctx.fillStyle = '#050810';
      spark_ctx.fillRect(0, 0, W, H);

      /* Ambient particles */
      spark_particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        spark_ctx.beginPath();
        spark_ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        spark_ctx.fillStyle = p.color;
        spark_ctx.globalAlpha = p.alpha;
        spark_ctx.fill();
      });
      spark_ctx.globalAlpha = 1;

      /* Spectral waves */
      const STEP = 3;
      spark_waves.forEach((wave) => {
        spark_ctx.beginPath();
        spark_ctx.strokeStyle = wave.color;
        spark_ctx.lineWidth = wave.width;
        spark_ctx.lineCap = 'round';
        spark_ctx.lineJoin = 'round';
        spark_ctx.shadowColor = wave.glow;
        spark_ctx.shadowBlur = 18;

        for (let x = 0; x <= W; x += STEP) {
          /* Mouse influence: Gaussian bell in x, modulated by y-distance */
          const dx = x - spark_mx;
          const dy = wave.yOffset - spark_my;
          const xInfluence = Math.exp(-(dx * dx) / (2 * 22000));
          const yInfluence = Math.max(0, 1 - Math.abs(dy) / 160);
          const mouseBump  = xInfluence * yInfluence * 70;

          const y = wave.yOffset
            + Math.sin(x * wave.freq + wave.phase + spark_t * wave.speed) * (wave.amplitude + mouseBump)
            + Math.sin(x * wave.freq * 1.7 + spark_t * wave.speed * 0.6) * (wave.amplitude * 0.22);

          x === 0 ? spark_ctx.moveTo(x, y) : spark_ctx.lineTo(x, y);
        }
        spark_ctx.stroke();
        spark_ctx.shadowBlur = 0;
      });

      spark_t += 0.016;
      spark_raf = requestAnimationFrame(spark_draw);
    }

    if (!spark_rm) {
      spark_draw();

      /* Fade canvas out as user scrolls past hero */
      gsap.to(spark_canvas, {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'bottom 80%',
          end: 'bottom top',
          scrub: 1,
        }
      });
    } else {
      /* Static single frame for reduced-motion */
      spark_mx = window.innerWidth * 0.5;
      spark_my = window.innerHeight * 0.5;
      spark_mxTarget = spark_mx;
      spark_myTarget = spark_my;
      spark_draw();
      cancelAnimationFrame(spark_raf);
    }
  }

  /* ── Section reveals ──────────────────────── */
  if (!spark_rm) {
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      const delay = parseFloat(el.dataset.revealDelay || 0);
      gsap.fromTo(el,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 87%',
            toggleActions: 'play none none none',
          }
        }
      );
    });

    /* Season fill bars: scale from 0 to full width */
    document.querySelectorAll('.season__fill').forEach((fill) => {
      gsap.fromTo(fill,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.1,
          ease: 'power2.out',
          transformOrigin: 'left center',
          scrollTrigger: {
            trigger: fill,
            start: 'top 82%',
            toggleActions: 'play none none none',
          }
        }
      );
    });
  }

})();
