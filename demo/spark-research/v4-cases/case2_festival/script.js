/**
 * PULSE 2026 -- script.js
 * Neo-Algorithm + Acid-Graphic electronic festival
 * DESIGN_VARIANCE=8 / MOTION_INTENSITY=8 / VISUAL_DENSITY=6
 * CHOSEN_SPARK: lb-055 (Sensory Branding -- 공감각적 브랜딩)
 * AESTHETIC_PINCH: p-020 (오래된 미래 -- Retro-futurist neon + pixel)
 */

(function () {
  'use strict';

  /* ============================================================
     GUARD: reduced-motion -- skip all animation init
     ============================================================ */
  const spark_prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     GSAP REGISTER PLUGINS
     ============================================================ */
  gsap.registerPlugin(ScrollTrigger);

  /* ============================================================
     LENIS SMOOTH SCROLL
     ============================================================ */
  const spark_lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
  });

  spark_lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => spark_lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  /* ============================================================
     SCROLL PROGRESS BAR
     ============================================================ */
  const spark_progressBar = document.getElementById('progressBar');

  spark_lenis.on('scroll', ({ progress }) => {
    if (spark_progressBar) {
      spark_progressBar.style.width = (progress * 100) + '%';
    }
  });

  /* ============================================================
     NAV: scroll state + hamburger
     ============================================================ */
  {
    const nav = document.getElementById('mainNav');
    const hamburger = document.getElementById('navHamburger');
    const navLinks = document.getElementById('navLinks');

    let spark_navScrolled = false;

    spark_lenis.on('scroll', ({ scroll }) => {
      const shouldScroll = scroll > 80;
      if (shouldScroll !== spark_navScrolled) {
        spark_navScrolled = shouldScroll;
        nav.classList.toggle('nav--scrolled', shouldScroll);
      }
    });

    if (hamburger && navLinks) {
      hamburger.addEventListener('click', () => {
        const isOpen = navLinks.classList.contains('nav--mobile-open');
        navLinks.classList.toggle('nav--mobile-open', !isOpen);
        hamburger.setAttribute('aria-expanded', String(!isOpen));
        hamburger.setAttribute('aria-label', isOpen ? '메뉴 열기' : '메뉴 닫기');
      });

      // Close menu when nav link clicked
      navLinks.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const href = link.getAttribute('href');
          const target = href ? document.querySelector(href) : null;
          navLinks.classList.remove('nav--mobile-open');
          hamburger.setAttribute('aria-expanded', 'false');
          hamburger.setAttribute('aria-label', '메뉴 열기');
          if (target) {
            spark_lenis.scrollTo(target, { offset: -80 });
          }
        });
      });
    }

    // Nav CTA scroll
    const navCta = nav ? nav.querySelector('.nav-cta') : null;
    if (navCta) {
      navCta.addEventListener('click', (e) => {
        const href = navCta.getAttribute('href');
        const target = href ? document.querySelector(href) : null;
        if (target) {
          e.preventDefault();
          spark_lenis.scrollTo(target, { offset: -80 });
        }
      });
    }
  }

  /* ============================================================
     COUNTDOWN TIMER
     ============================================================ */
  {
    const festivalDate = new Date('2026-08-14T18:00:00+09:00').getTime();

    const elDays  = document.getElementById('cdDays');
    const elHours = document.getElementById('cdHours');
    const elMins  = document.getElementById('cdMins');
    const elSecs  = document.getElementById('cdSecs');

    function spark_padNum(n, digits) {
      return String(n).padStart(digits, '0');
    }

    function spark_updateCountdown() {
      const now  = Date.now();
      const diff = festivalDate - now;

      if (diff <= 0) {
        if (elDays)  elDays.textContent  = '000';
        if (elHours) elHours.textContent = '00';
        if (elMins)  elMins.textContent  = '00';
        if (elSecs)  elSecs.textContent  = '00';
        return;
      }

      const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs  = Math.floor((diff % (1000 * 60)) / 1000);

      if (elDays)  elDays.textContent  = spark_padNum(days, 3);
      if (elHours) elHours.textContent = spark_padNum(hours, 2);
      if (elMins)  elMins.textContent  = spark_padNum(mins, 2);
      if (elSecs)  elSecs.textContent  = spark_padNum(secs, 2);
    }

    spark_updateCountdown();
    setInterval(spark_updateCountdown, 1000);
  }

  /* ============================================================
     CANVAS HERO -- Seeded Flow Field + Particles + Post-process
     CHOSEN_SPARK lb-055: Sensory Branding -- particles pulse in
     sync with an imaginary beat, creating rhythmic visual energy.
     seed=2026 (deterministic background, brand-consistent)
     ============================================================ */
  {
    const spark_canvas = document.getElementById('heroCanvas');
    if (!spark_canvas) return;

    const spark_ctx = spark_canvas.getContext('2d');

    /* ---- Seeded PRNG (mulberry32) ---- */
    function spark_mulberry32(a) {
      return function () {
        a |= 0; a = a + 0x6D2B79F5 | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }

    const SEED = 2026;
    const spark_seededRand = spark_mulberry32(SEED);

    /* ---- Config ---- */
    const PARTICLE_COUNT = 200;
    const FIELD_COLS     = 32;
    const FIELD_ROWS     = 20;
    const FIELD_SCALE    = 0.0025;
    let   spark_cw       = 0;
    let   spark_ch       = 0;

    /* ---- Flow field vectors ---- */
    let spark_field = [];

    function spark_buildFlowField(w, h) {
      spark_field = [];
      for (let row = 0; row < FIELD_ROWS; row++) {
        for (let col = 0; col < FIELD_COLS; col++) {
          const nx = col * FIELD_SCALE * 80;
          const ny = row * FIELD_SCALE * 80;
          const angle = (Math.sin(nx * 1.3) + Math.cos(ny * 0.9)) * Math.PI * 2
                      + (Math.sin(nx * 0.7 + ny * 0.5)) * Math.PI;
          spark_field.push(angle);
        }
      }
    }

    function spark_getField(px, py) {
      const col = Math.floor((px / spark_cw) * FIELD_COLS);
      const row = Math.floor((py / spark_ch) * FIELD_ROWS);
      const clampedCol = Math.max(0, Math.min(FIELD_COLS - 1, col));
      const clampedRow = Math.max(0, Math.min(FIELD_ROWS - 1, row));
      return spark_field[clampedRow * FIELD_COLS + clampedCol] ?? 0;
    }

    /* ---- Particles ---- */
    const spark_particles = [];

    function spark_createParticle(useSeeded) {
      const rng = useSeeded ? spark_seededRand : Math.random;
      return {
        x:     rng() * (spark_cw || window.innerWidth),
        y:     rng() * (spark_ch || window.innerHeight),
        vx:    0,
        vy:    0,
        speed: 0.4 + rng() * 1.0,
        size:  0.8 + rng() * 2.0,
        life:  rng(),       // 0..1 phase
        hue:   rng() < 0.5 ? 320 : 195, // magenta or cyan
        alpha: 0.15 + rng() * 0.45
      };
    }

    function spark_initParticles() {
      spark_particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        spark_particles.push(spark_createParticle(true));
      }
    }

    /* ---- Resize ---- */
    function spark_resize() {
      spark_cw = spark_canvas.width  = window.innerWidth;
      spark_ch = spark_canvas.height = window.innerHeight;
      spark_buildFlowField(spark_cw, spark_ch);
    }

    spark_resize();
    window.addEventListener('resize', spark_resize);

    /* ---- Animation time ---- */
    let spark_animTime = 0;
    let spark_lastTs   = 0;

    /* ---- Draw loop ---- */
    function spark_draw(timestamp) {
      const dt = Math.min((timestamp - spark_lastTs) / 1000, 0.05);
      spark_lastTs  = timestamp;
      spark_animTime += dt;

      /* --- 1. Fade trails --- */
      spark_ctx.fillStyle = 'rgba(6, 7, 11, 0.18)';
      spark_ctx.fillRect(0, 0, spark_cw, spark_ch);

      /* --- 2. Update + draw particles --- */
      for (let i = 0; i < spark_particles.length; i++) {
        const p = spark_particles[i];

        const angle = spark_getField(p.x, p.y);
        p.vx += Math.cos(angle) * p.speed * 0.12;
        p.vy += Math.sin(angle) * p.speed * 0.12;

        /* damping */
        p.vx *= 0.96;
        p.vy *= 0.96;

        p.x += p.vx;
        p.y += p.vy;

        p.life += dt * 0.15;

        /* pulse alpha with time */
        const pulse = 0.7 + 0.3 * Math.sin(spark_animTime * 1.8 + i * 0.31);
        const drawAlpha = p.alpha * pulse;

        /* Wrap at edges */
        if (p.x < -10 || p.x > spark_cw + 10 || p.y < -10 || p.y > spark_ch + 10) {
          const np = spark_createParticle(false);
          spark_particles[i] = np;
          continue;
        }

        /* Draw particle */
        spark_ctx.beginPath();
        spark_ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        const lightness = p.hue === 320 ? '75%' : '78%';
        const chroma    = p.hue === 320 ? '0.22' : '0.20';
        spark_ctx.fillStyle = `oklch(${lightness} ${chroma} ${p.hue} / ${drawAlpha})`;
        spark_ctx.fill();
      }

      /* --- 3. Post-process: Chromatic Aberration edges --- */
      {
        const caStrength = 6;
        /* Red channel shift left-top */
        spark_ctx.save();
        spark_ctx.globalCompositeOperation = 'screen';
        spark_ctx.globalAlpha = 0.06;
        spark_ctx.drawImage(spark_canvas, -caStrength, -caStrength);
        spark_ctx.restore();

        /* Blue channel shift right-bottom */
        spark_ctx.save();
        spark_ctx.globalCompositeOperation = 'screen';
        spark_ctx.globalAlpha = 0.04;
        spark_ctx.drawImage(spark_canvas, caStrength, caStrength);
        spark_ctx.restore();
      }

      /* --- 4. Vignette (fading edges -- AESTHETIC_PINCH: 선명한 망각) --- */
      {
        const vignette = spark_ctx.createRadialGradient(
          spark_cw * 0.5, spark_ch * 0.5, spark_cw * 0.25,
          spark_cw * 0.5, spark_ch * 0.5, spark_cw * 0.85
        );
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.72)');
        spark_ctx.fillStyle = vignette;
        spark_ctx.fillRect(0, 0, spark_cw, spark_ch);
      }

      requestAnimationFrame(spark_draw);
    }

    spark_initParticles();

    if (!spark_prefersReduced) {
      requestAnimationFrame(spark_draw);
    } else {
      /* reduced-motion: draw static frame only */
      spark_ctx.fillStyle = `oklch(8% 0.01 220)`;
      spark_ctx.fillRect(0, 0, spark_cw, spark_ch);
    }
  }

  /* ============================================================
     HERO PARALLAX (canvas drifts at 0.4x scroll speed)
     ============================================================ */
  if (!spark_prefersReduced) {
    const spark_heroCanvas = document.getElementById('heroCanvas');
    const spark_heroContent = document.querySelector('.hero-content');

    if (spark_heroCanvas && spark_heroContent) {
      ScrollTrigger.create({
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        onUpdate: (self) => {
          const progress = self.progress;
          gsap.set(spark_heroCanvas, { y: progress * spark_heroCanvas.offsetHeight * 0.3 });
          gsap.set(spark_heroContent, { y: progress * spark_heroContent.offsetHeight * -0.15 });
        }
      });
    }
  }

  /* ============================================================
     HERO ENTRANCE ANIMATIONS
     ============================================================ */
  if (!spark_prefersReduced) {
    const spark_heroTl = gsap.timeline({ delay: 0.3 });

    spark_heroTl
      .to('.hero-eyebrow', {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out'
      })
      .to('.hero-title', {
        opacity: 1,
        y: 0,
        duration: 1.0,
        ease: 'power4.out'
      }, '-=0.5')
      .to('.hero-sub', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out'
      }, '-=0.6')
      .to('.countdown', {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out'
      }, '-=0.5')
      .to('.hero-cta', {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out'
      }, '-=0.45');
  } else {
    /* Ensure visible in reduced-motion */
    gsap.set(['.hero-eyebrow', '.hero-title', '.hero-sub', '.countdown', '.hero-cta'], {
      opacity: 1, y: 0
    });
  }

  /* ============================================================
     SCROLL REVEAL -- generic [data-reveal] elements
     ============================================================ */
  if (!spark_prefersReduced) {
    const spark_revealEls = document.querySelectorAll('[data-reveal]');

    spark_revealEls.forEach((el) => {
      const delayAttr = el.getAttribute('data-reveal-delay');
      const delay = delayAttr ? parseFloat(delayAttr) * 0.12 : 0;

      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none'
        },
      });
    });
  } else {
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  /* ============================================================
     TIMETABLE -- tabs + staggered column reveal on scroll
     ============================================================ */
  {
    const spark_ttTabs   = document.querySelectorAll('.tt-tab');
    const spark_ttPanels = document.querySelectorAll('.tt-panel');

    function spark_showPanel(idx) {
      spark_ttPanels.forEach((panel, i) => {
        const isActive = i === idx;
        panel.hidden = !isActive;
        panel.classList.toggle('tt-panel--active', isActive);
      });
      spark_ttTabs.forEach((tab, i) => {
        const isActive = i === idx;
        tab.classList.toggle('tt-tab--active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
      });

      /* Re-trigger stagger for newly shown panel */
      if (!spark_prefersReduced) {
        const cols = spark_ttPanels[idx] ? spark_ttPanels[idx].querySelectorAll('.tt-stage-col') : [];
        cols.forEach((col, ci) => {
          col.classList.remove('tt-col--visible');
          gsap.fromTo(col,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              delay: ci * 0.12,
              ease: 'power3.out',
              clearProps: 'all',
              onComplete: () => col.classList.add('tt-col--visible')
            }
          );
        });
      } else {
        const cols = spark_ttPanels[idx] ? spark_ttPanels[idx].querySelectorAll('.tt-stage-col') : [];
        cols.forEach((col) => {
          col.style.opacity = '1';
          col.style.transform = 'none';
          col.classList.add('tt-col--visible');
        });
      }
    }

    spark_ttTabs.forEach((tab, idx) => {
      tab.addEventListener('click', () => spark_showPanel(idx));
      tab.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          spark_showPanel((idx + 1) % spark_ttTabs.length);
          spark_ttTabs[(idx + 1) % spark_ttTabs.length].focus();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          const prev = (idx - 1 + spark_ttTabs.length) % spark_ttTabs.length;
          spark_showPanel(prev);
          spark_ttTabs[prev].focus();
        }
      });
    });

    /* Initial stagger for Day 1 on scroll-into-view */
    if (!spark_prefersReduced) {
      ScrollTrigger.create({
        trigger: '.section-timetable',
        start: 'top 80%',
        once: true,
        onEnter: () => {
          const cols = document.querySelectorAll('#tt-panel-1 .tt-stage-col');
          cols.forEach((col, ci) => {
            gsap.fromTo(col,
              { opacity: 0, y: 24 },
              {
                opacity: 1,
                y: 0,
                duration: 0.6,
                delay: ci * 0.15,
                ease: 'power3.out',
                clearProps: 'all',
                onComplete: () => col.classList.add('tt-col--visible')
              }
            );
          });
        }
      });
    } else {
      document.querySelectorAll('.tt-stage-col').forEach((col) => {
        col.style.opacity = '1';
        col.style.transform = 'none';
        col.classList.add('tt-col--visible');
      });
    }
  }

  /* ============================================================
     NAV ANCHOR LINKS (logo + footer links)
     ============================================================ */
  {
    const spark_anchorLinks = document.querySelectorAll('a[href^="#"]');
    spark_anchorLinks.forEach((link) => {
      if (link.classList.contains('nav-link')) return; // handled above
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          spark_lenis.scrollTo(target, { offset: -80 });
        }
      });
    });
  }

  /* ============================================================
     HERO TITLE -- subtle glitch on hover (Acid-Graphic style)
     SURPRISE: responds to pointer proximity with RGB offset
     ============================================================ */
  if (!spark_prefersReduced) {
    const spark_heroTitleEl = document.querySelector('.hero-title');
    if (spark_heroTitleEl) {
      spark_heroTitleEl.addEventListener('mouseenter', () => {
        const tl = gsap.timeline({ repeat: 3, yoyo: false });
        tl.to(spark_heroTitleEl, {
          duration: 0.04,
          filter: 'drop-shadow(3px 0 0 oklch(75% 0.22 320 / 0.7)) drop-shadow(-3px 0 0 oklch(78% 0.20 195 / 0.7))',
          ease: 'none'
        }).to(spark_heroTitleEl, {
          duration: 0.04,
          filter: 'none',
          ease: 'none'
        });
      });
    }
  }

  /* ============================================================
     TICKET CARD hover glow pulse (Sensory Branding -- lb-055)
     ============================================================ */
  if (!spark_prefersReduced) {
    const spark_ticketCards = document.querySelectorAll('.ticket-card');
    spark_ticketCards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          boxShadow: '0 0 40px oklch(75% 0.22 320 / 0.2)',
          duration: 0.35,
          ease: 'power2.out'
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          boxShadow: '0 0 0px oklch(75% 0.22 320 / 0)',
          duration: 0.45,
          ease: 'power2.out'
        });
      });
    });
  }

  /* ============================================================
     ARTIST CARD -- name scramble reveal on scroll enter
     (Acid-Graphic: algorithmic text chaos)
     SURPRISE element: letters cycle through random chars before
     settling -- creates a "decoding" effect for each artist name
     ============================================================ */
  if (!spark_prefersReduced) {
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@!&';

    function spark_scrambleName(el) {
      const originalText = el.textContent;
      const chars = originalText.split('');
      let iteration = 0;
      const totalSteps = 12;

      const interval = setInterval(() => {
        el.textContent = chars
          .map((c, i) => {
            if (c === '\n' || c === ' ') return c;
            if (i < (iteration / totalSteps) * chars.length) return c;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('');
        iteration++;
        if (iteration > totalSteps) {
          clearInterval(interval);
          el.textContent = originalText;
        }
      }, 40);
    }

    const spark_artistCards = document.querySelectorAll('.artist-card');
    spark_artistCards.forEach((card) => {
      const nameEl = card.querySelector('.artist-name');
      if (!nameEl) return;
      ScrollTrigger.create({
        trigger: card,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          spark_scrambleName(nameEl);
        }
      });
    });
  }

  /* ============================================================
     VENUE MAP -- subtle pin pulse animation via GSAP
     ============================================================ */
  if (!spark_prefersReduced) {
    const spark_mapPin = document.querySelector('.map-pin');
    if (spark_mapPin) {
      gsap.to(spark_mapPin, {
        y: -6,
        duration: 1.4,
        ease: 'power1.inOut',
        yoyo: true,
        repeat: -1
      });
    }
  }

})();
