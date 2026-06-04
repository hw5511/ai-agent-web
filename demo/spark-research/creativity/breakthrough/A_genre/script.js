(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  // =============================================
  // SEEDED PRNG (Mulberry32 — 배경 캔버스 전용)
  // LIGHTBULB 영감 선택에는 절대 쓰지 않음
  // =============================================
  const CANVAS_SEED = 3721;

  function spark_rngFactory(seed) {
    let s = seed >>> 0;
    return function () {
      s += 0x6D2B79F5;
      let z = s;
      z = Math.imul(z ^ (z >>> 15), z | 1);
      z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
      return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
    };
  }

  // =============================================
  // STAR CANVAS
  // =============================================
  const spark_canvas = document.getElementById('star-canvas');
  const spark_ctx = spark_canvas.getContext('2d');
  const spark_rng = spark_rngFactory(CANVAS_SEED);

  const STAR_COUNT = 420;
  const spark_stars = [];

  for (let i = 0; i < STAR_COUNT; i++) {
    spark_stars.push({
      x:            spark_rng(),
      y:            spark_rng(),
      r:            spark_rng() * 1.25 + 0.18,
      mag:          spark_rng(),          // 0=brightest, 1=dimmest
      twinklePhase: spark_rng() * Math.PI * 2,
      twinkleSpeed: spark_rng() * 0.45 + 0.08,
      parallax:     spark_rng() * 0.012 + 0.002,
      warm:         spark_rng() < 0.15,   // amber tint for some bright stars
    });
  }

  let spark_scrollRatio = 0;
  let spark_animTime = 0;

  function spark_resizeCanvas() {
    spark_canvas.width  = window.innerWidth;
    spark_canvas.height = window.innerHeight;
  }
  spark_resizeCanvas();
  window.addEventListener('resize', spark_resizeCanvas);

  function spark_drawStars() {
    const w = spark_canvas.width;
    const h = spark_canvas.height;

    spark_ctx.clearRect(0, 0, w, h);

    // City warm glow at top fades as scroll deepens
    const glowAlpha = Math.max(0, 0.055 - spark_scrollRatio * 0.055);
    if (glowAlpha > 0.002) {
      const spark_grad = spark_ctx.createLinearGradient(0, 0, 0, h * 0.45);
      spark_grad.addColorStop(0, `rgba(120, 70, 20, ${glowAlpha})`);
      spark_grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      spark_ctx.fillStyle = spark_grad;
      spark_ctx.fillRect(0, 0, w, h);
    }

    spark_animTime += 0.007;

    // Threshold: brightest stars always visible; dim stars appear as scroll increases
    const visThreshold = 0.14 + spark_scrollRatio * 0.78;

    for (let i = 0; i < STAR_COUNT; i++) {
      const s = spark_stars[i];
      if (s.mag > visThreshold + 0.12) continue;

      const visAlpha = Math.min(1, (visThreshold - s.mag + 0.12) / 0.12);
      const twinkle  = Math.sin(spark_animTime * s.twinkleSpeed + s.twinklePhase) * 0.13 + 0.87;
      const alpha    = visAlpha * twinkle * 0.88;
      if (alpha < 0.01) continue;

      const px = s.x * w;
      const py = s.y * h - spark_scrollRatio * s.parallax * h * 2.5;

      if (s.warm) {
        spark_ctx.fillStyle = `rgba(255, 210, 130, ${alpha})`;
      } else {
        spark_ctx.fillStyle = `rgba(195, 215, 255, ${alpha})`;
      }

      spark_ctx.beginPath();
      spark_ctx.arc(px, py, s.r, 0, Math.PI * 2);
      spark_ctx.fill();

      // Glow halo for the brightest stars
      if (s.mag < 0.18 && s.r > 0.85) {
        const gAlpha = alpha * 0.28;
        const spark_halo = spark_ctx.createRadialGradient(px, py, 0, px, py, s.r * 5);
        if (s.warm) {
          spark_halo.addColorStop(0, `rgba(255, 210, 100, ${gAlpha})`);
        } else {
          spark_halo.addColorStop(0, `rgba(180, 205, 255, ${gAlpha})`);
        }
        spark_halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
        spark_ctx.beginPath();
        spark_ctx.arc(px, py, s.r * 5, 0, Math.PI * 2);
        spark_ctx.fillStyle = spark_halo;
        spark_ctx.fill();
      }
    }

    requestAnimationFrame(spark_drawStars);
  }

  spark_drawStars();

  // =============================================
  // REDUCED MOTION CHECK
  // =============================================
  const spark_reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // =============================================
  // LENIS INIT
  // =============================================
  let spark_lenis = null;

  if (!spark_reduced) {
    spark_lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    spark_lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => spark_lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // =============================================
  // SCROLL RATIO (star canvas density)
  // =============================================
  ScrollTrigger.create({
    trigger: document.documentElement,
    start: 'top top',
    end:   'bottom bottom',
    onUpdate: (self) => {
      spark_scrollRatio = self.progress;
    },
  });

  // =============================================
  // PROGRESS BAR
  // =============================================
  const spark_progressBar = document.querySelector('.progress-bar');

  ScrollTrigger.create({
    trigger: document.documentElement,
    start: 'top top',
    end:   'bottom bottom',
    onUpdate: (self) => {
      const pct = Math.round(self.progress * 100);
      spark_progressBar.style.width = pct + '%';
      spark_progressBar.setAttribute('aria-valuenow', String(pct));
    },
  });

  // =============================================
  // ANIMATIONS
  // =============================================
  if (!spark_reduced) {

    // Hero: title lines slide up from clip
    gsap.set('.hero-line-1, .hero-line-2', { yPercent: 110 });
    gsap.set(['.hero-sub', '.hero-cta', '.hero-badge'], { opacity: 0, y: 18 });
    gsap.set('.hero-coords', { opacity: 0 });

    const spark_heroTL = gsap.timeline({ defaults: { ease: 'power3.out' } });
    spark_heroTL
      .to('.hero-line-1', { yPercent: 0, duration: 1.05, delay: 0.25 })
      .to('.hero-line-2', { yPercent: 0, duration: 1.05 }, '-=0.78')
      .to('.hero-sub',   { opacity: 1, y: 0, duration: 0.75 }, '-=0.55')
      .to('.hero-cta',   { opacity: 1, y: 0, duration: 0.55 }, '-=0.45')
      .to('.hero-badge', { opacity: 1, y: 0, duration: 0.5  }, '<-=0.9')
      .to('.hero-coords',{ opacity: 1, duration: 0.6        }, '-=0.5');

    // Constellation lines draw in
    gsap.to('.c-line', {
      strokeDashoffset: 0,
      duration: 2.2,
      ease: 'power2.inOut',
      stagger: 0.18,
      delay: 1.1,
    });

    // Section reveals
    document.querySelectorAll('.reveal').forEach((el) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 84%',
          toggleActions: 'play none none none',
        },
      });
    });

    // Sky items — staggered by index
    document.querySelectorAll('.sky-reveal').forEach((el, idx) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.65,
        ease: 'power3.out',
        delay: idx * 0.1,
        scrollTrigger: {
          trigger: el,
          start: 'top 87%',
          toggleActions: 'play none none none',
        },
      });
    });

    // Visit cards — staggered
    document.querySelectorAll('.visit-reveal').forEach((el, idx) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.65,
        ease: 'power3.out',
        delay: idx * 0.12,
        scrollTrigger: {
          trigger: el,
          start: 'top 87%',
          toggleActions: 'play none none none',
        },
      });
    });

  } else {
    // Reduced motion: show everything immediately
    document.querySelectorAll('.reveal, .sky-reveal, .visit-reveal').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    document.querySelectorAll('.c-line').forEach((el) => {
      el.style.strokeDashoffset = '0';
    });
  }

  // =============================================
  // SMOOTH SCROLL — intercept all #hash links
  // =============================================
  document.querySelectorAll('a[href^="#"].js-scroll-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      const target   = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      if (spark_lenis) {
        spark_lenis.scrollTo(target, { offset: -72 });
      } else {
        const targetY = target.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top: targetY });
      }
    });
  });

  // =============================================
  // MOBILE MENU
  // =============================================
  const spark_navToggle  = document.querySelector('.nav-toggle');
  const spark_mobileMenu = document.getElementById('mobile-menu');
  const spark_mobileClose = document.querySelector('.mobile-close');
  const spark_mobileLinks = document.querySelectorAll('.mobile-link');

  function spark_openMenu() {
    spark_mobileMenu.classList.add('is-open');
    spark_mobileMenu.setAttribute('aria-hidden', 'false');
    spark_navToggle.setAttribute('aria-expanded', 'true');
    spark_mobileClose.focus();
    if (spark_lenis) spark_lenis.stop();
  }

  function spark_closeMenu() {
    spark_mobileMenu.classList.remove('is-open');
    spark_mobileMenu.setAttribute('aria-hidden', 'true');
    spark_navToggle.setAttribute('aria-expanded', 'false');
    spark_navToggle.focus();
    if (spark_lenis) spark_lenis.start();
  }

  spark_navToggle.addEventListener('click', spark_openMenu);
  spark_mobileClose.addEventListener('click', spark_closeMenu);
  spark_mobileLinks.forEach((link) => link.addEventListener('click', spark_closeMenu));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && spark_mobileMenu.classList.contains('is-open')) {
      spark_closeMenu();
    }
  });

  // =============================================
  // VISIT CTA — spring hover (lb-006 반영)
  // =============================================
  const spark_ctaBtn = document.querySelector('.visit-cta-btn');
  if (spark_ctaBtn && !spark_reduced) {
    spark_ctaBtn.addEventListener('mouseenter', () => {
      gsap.to(spark_ctaBtn, {
        y: -3,
        duration: 0.45,
        ease: 'back.out(2)',
        overwrite: true,
      });
    });
    spark_ctaBtn.addEventListener('mouseleave', () => {
      gsap.to(spark_ctaBtn, {
        y: 0,
        duration: 0.55,
        ease: 'elastic.out(1, 0.5)',
        overwrite: true,
      });
    });
  }

})();
