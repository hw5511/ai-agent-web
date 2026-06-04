(function () {
  'use strict';

  /* ============================================================
     GSAP SETUP
  ============================================================ */
  gsap.registerPlugin(ScrollTrigger);

  const spark_reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     PROGRESS BAR
  ============================================================ */
  const spark_progressFill = document.getElementById('progressFill');

  /* ============================================================
     LENIS SMOOTH SCROLL
  ============================================================ */
  let spark_lenis = null;

  if (!spark_reduced) {
    spark_lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    });

    spark_lenis.on('scroll', ScrollTrigger.update);
    spark_lenis.on('scroll', ({ progress }) => {
      if (spark_progressFill) {
        spark_progressFill.style.width = (progress * 100).toFixed(2) + '%';
      }
    });

    gsap.ticker.add((time) => spark_lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    window.addEventListener('scroll', () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (spark_progressFill && total > 0) {
        spark_progressFill.style.width = ((window.scrollY / total) * 100).toFixed(2) + '%';
      }
    }, { passive: true });
  }

  /* ============================================================
     HERO CANVAS: seeded afterimage particle flow
  ============================================================ */
  const spark_canvas = document.getElementById('heroCanvas');

  if (spark_canvas && !spark_reduced) {
    const spark_ctx = spark_canvas.getContext('2d');
    let spark_cw = 0;
    let spark_ch = 0;
    let spark_elapsed = 0;
    let spark_lastTs = null;
    const SEED = 7314;
    const PARTICLE_COUNT = 90;

    let spark_rngState = SEED;
    function spark_rng() {
      spark_rngState = (spark_rngState * 1664525 + 1013904223) & 0x7fffffff;
      return spark_rngState / 0x7fffffff;
    }

    const spark_pts = [];
    spark_rngState = SEED;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      spark_pts.push({
        nx:    spark_rng(),
        ny:    spark_rng(),
        x:     0,
        y:     0,
        size:  0.5 + spark_rng() * 1.8,
        alpha: 0.12 + spark_rng() * 0.38,
        phase: spark_rng() * Math.PI * 2,
        spd:   0.25 + spark_rng() * 0.55
      });
    }

    function spark_resizeCanvas() {
      spark_cw = spark_canvas.width  = spark_canvas.offsetWidth;
      spark_ch = spark_canvas.height = spark_canvas.offsetHeight;
      for (const p of spark_pts) {
        p.x = p.nx * spark_cw;
        p.y = p.ny * spark_ch;
      }
    }

    function spark_drawCanvas(ts) {
      if (spark_lastTs === null) spark_lastTs = ts;
      const dt = Math.min(ts - spark_lastTs, 50);
      spark_lastTs = ts;
      spark_elapsed += dt * 0.001;

      /* Slow dark overlay creates natural afterimage trails */
      spark_ctx.fillStyle = 'rgba(10, 10, 22, 0.055)';
      spark_ctx.fillRect(0, 0, spark_cw, spark_ch);

      /* Draw all same-color particles in one path batch per alpha group would
         be ideal, but for simplicity draw individually, still performant at 90 */
      for (const p of spark_pts) {
        const angle = Math.sin(p.x * 0.0055 + spark_elapsed * 0.28 + p.phase)
                    + Math.cos(p.y * 0.0045 + spark_elapsed * 0.19 + p.phase * 0.7);
        p.x += Math.cos(angle) * p.spd;
        p.y += Math.sin(angle) * p.spd;

        if (p.x < 0)       p.x += spark_cw;
        if (p.x > spark_cw) p.x -= spark_cw;
        if (p.y < 0)       p.y += spark_ch;
        if (p.y > spark_ch) p.y -= spark_ch;

        spark_ctx.globalAlpha = p.alpha;
        spark_ctx.fillStyle = '#3ec9d2';
        spark_ctx.beginPath();
        spark_ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        spark_ctx.fill();
      }
      spark_ctx.globalAlpha = 1;

      requestAnimationFrame(spark_drawCanvas);
    }

    spark_resizeCanvas();
    window.addEventListener('resize', spark_resizeCanvas, { passive: true });
    requestAnimationFrame(spark_drawCanvas);
  }

  /* ============================================================
     HERO TITLE: afterimage ghost effect on mouse move
     CHOSEN_SPARK: INTERACTION_SPARK lb-182 (인터랙티브 타이포)
  ============================================================ */
  const spark_heroTitle = document.getElementById('heroTitle');
  const spark_ghosts = [];
  let spark_lastGhostTime = 0;

  if (spark_heroTitle && !spark_reduced) {
    document.addEventListener('mousemove', (e) => {
      const now = performance.now();
      if (now - spark_lastGhostTime < 120) return; /* throttle ghost spawn */
      spark_lastGhostTime = now;

      const heroRect = document.querySelector('.hero').getBoundingClientRect();
      if (e.clientY > heroRect.bottom * 0.85) return;

      const titleRect = spark_heroTitle.getBoundingClientRect();
      const dxRatio = (e.clientX - window.innerWidth  * 0.5) / window.innerWidth;
      const dyRatio = (e.clientY - window.innerHeight * 0.5) / window.innerHeight;

      const ghost = spark_heroTitle.cloneNode(true);
      ghost.setAttribute('aria-hidden', 'true');
      ghost.setAttribute('id', '');
      ghost.style.cssText = [
        'position:fixed',
        `left:${titleRect.left}px`,
        `top:${titleRect.top}px`,
        `width:${titleRect.width}px`,
        'pointer-events:none',
        'z-index:1',
        'opacity:0.07',
        'color:#3ec9d2',
        'filter:blur(3px)',
        `transform:translate(${dxRatio * 18}px,${dyRatio * 14}px)`,
        'will-change:opacity,filter,transform',
        'user-select:none'
      ].join(';');

      document.body.appendChild(ghost);
      spark_ghosts.push(ghost);

      gsap.to(ghost, {
        opacity: 0,
        filter: 'blur(12px)',
        y: -28,
        duration: 1.1,
        ease: 'power2.out',
        onComplete() {
          ghost.remove();
          const idx = spark_ghosts.indexOf(ghost);
          if (idx > -1) spark_ghosts.splice(idx, 1);
        }
      });

      if (spark_ghosts.length > 5) {
        const old = spark_ghosts.shift();
        if (old.parentNode) old.remove();
      }
    }, { passive: true });
  }

  /* ============================================================
     HERO ENTRANCE
  ============================================================ */
  if (!spark_reduced) {
    const spark_titleMain = document.querySelector('.hero-title-main');
    const spark_titleHanja = document.querySelector('.hero-title-hanja');

    if (spark_titleMain) {
      gsap.from(spark_titleMain, {
        opacity: 0,
        y: 80,
        duration: 1.5,
        ease: 'power4.out',
        delay: 0.15
      });
    }
    if (spark_titleHanja) {
      gsap.from(spark_titleHanja, {
        opacity: 0,
        x: -16,
        duration: 1.0,
        ease: 'power3.out',
        delay: 0.7
      });
    }

    const spark_heroReveal = gsap.utils.toArray('.hero .reveal');
    gsap.to(spark_heroReveal, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.15,
      delay: 0.5
    });
  }

  /* ============================================================
     SCROLL REVEALS
  ============================================================ */
  if (!spark_reduced) {
    const spark_allReveal = gsap.utils.toArray('.reveal:not(.hero .reveal)');
    spark_allReveal.forEach((el) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 87%',
          toggleActions: 'play none none none'
        }
      });
    });

    /* Staggered bento cells */
    const spark_workCells = gsap.utils.toArray('.work-cell');
    gsap.set(spark_workCells, { opacity: 0, y: 36 });
    ScrollTrigger.create({
      trigger: '.works-grid',
      start: 'top 82%',
      onEnter() {
        gsap.to(spark_workCells, {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: 'power3.out',
          stagger: 0.08
        });
      }
    });

    /* Note section slow vertical drift */
    gsap.to('.note', {
      yPercent: -4,
      ease: 'none',
      scrollTrigger: {
        trigger: '.note',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      }
    });
  } else {
    /* Ensure all reveal targets are visible in reduced-motion */
    document.querySelectorAll('.reveal').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    const spark_workCells2 = document.querySelectorAll('.work-cell');
    spark_workCells2.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  /* ============================================================
     NAV SCROLL BEHAVIOR
  ============================================================ */
  const spark_nav = document.querySelector('.site-nav');
  if (spark_nav) {
    ScrollTrigger.create({
      start: 'top -60',
      onUpdate(self) {
        if (self.scroll() > 60) {
          spark_nav.classList.add('scrolled');
        } else {
          spark_nav.classList.remove('scrolled');
        }
      }
    });
  }

  /* ============================================================
     WORK CELL: subtle 3-D tilt on hover
  ============================================================ */
  if (!spark_reduced) {
    document.querySelectorAll('.work-cell').forEach((cell) => {
      cell.addEventListener('mousemove', (e) => {
        const rect = cell.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width  * 0.5)) / rect.width;
        const dy = (e.clientY - (rect.top  + rect.height * 0.5)) / rect.height;
        gsap.to(cell, {
          rotateY: dx * 5,
          rotateX: -dy * 4,
          duration: 0.35,
          ease: 'power2.out',
          transformPerspective: 900,
          transformOrigin: 'center center'
        });
      }, { passive: true });

      cell.addEventListener('mouseleave', () => {
        gsap.to(cell, {
          rotateY: 0,
          rotateX: 0,
          duration: 0.65,
          ease: 'power3.out'
        });
      });
    });
  }

  /* ============================================================
     MOBILE NAVIGATION
  ============================================================ */
  const spark_menuBtn   = document.getElementById('navMenuBtn');
  const spark_navLinks  = document.getElementById('navLinks');
  let spark_menuOpen    = false;

  function spark_toggleMenu(open) {
    spark_menuOpen = open;
    spark_menuBtn.setAttribute('aria-expanded', open.toString());
    if (open) {
      spark_navLinks.classList.add('nav-open');
    } else {
      spark_navLinks.classList.remove('nav-open');
    }
  }

  if (spark_menuBtn && spark_navLinks) {
    spark_menuBtn.addEventListener('click', () => {
      spark_toggleMenu(!spark_menuOpen);
    });

    spark_navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (spark_menuOpen) spark_toggleMenu(false);
        const href = link.getAttribute('href');
        if (href && href.startsWith('#') && href.length > 1) {
          const target = document.querySelector(href);
          if (target && spark_lenis) {
            spark_lenis.scrollTo(target, { offset: -80, duration: 1.4 });
          }
        }
      });
    });

    /* Hero CTA smooth scroll */
    const spark_heroCta = document.getElementById('heroCta');
    if (spark_heroCta) {
      spark_heroCta.addEventListener('click', (e) => {
        const target = document.querySelector('#about');
        if (target && spark_lenis) {
          e.preventDefault();
          spark_lenis.scrollTo(target, { offset: -80, duration: 1.6 });
        }
        /* If no lenis (reduced-motion), native anchor href="#about" works naturally */
      });
    }
  }

})();
