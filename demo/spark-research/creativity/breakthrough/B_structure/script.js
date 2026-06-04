// 이안(夷安) 천문대 — script.js
(function () {
  'use strict';

  // ========================================
  // SEEDED PRNG (mulberry32 — deterministic)
  // ========================================
  function spark_createPRNG(seed) {
    let s = seed;
    return function () {
      s |= 0; s = s + 0x6D2B79F5 | 0;
      let t = Math.imul(s ^ s >>> 15, 1 | s);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // ========================================
  // WEB AUDIO — soft sine chime
  // ========================================
  let spark_audioCtx = null;

  function spark_getAudioCtx() {
    if (!spark_audioCtx) {
      spark_audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (spark_audioCtx.state === 'suspended') {
      spark_audioCtx.resume();
    }
    return spark_audioCtx;
  }

  function spark_playTone(freq, vol) {
    try {
      const ctx = spark_getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const v = vol || 0.07;
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(v, ctx.currentTime + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.55);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    } catch (_e) { /* audio unavailable */ }
  }

  // ========================================
  // HERO STAR CANVAS
  // seed=7891 → fixed backdrop (brand consistent)
  // ========================================
  function spark_initHeroCanvas() {
    const canvas = document.getElementById('star-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rng = spark_createPRNG(7891);

    let spark_heroW = 0;
    let spark_heroH = 0;
    let spark_heroStars = [];
    let spark_heroRafId = null;

    function buildHeroStars(w, h) {
      spark_heroStars = [];
      for (let i = 0; i < 340; i++) {
        spark_heroStars.push({
          x: rng() * w,
          y: rng() * h,
          r: rng() * 1.3 + 0.18,
          base: rng() * 0.55 + 0.28,
          phase: rng() * Math.PI * 2,
          spd: rng() * 0.00065 + 0.0003,
        });
      }
    }

    function resizeHero() {
      const dpr = window.devicePixelRatio || 1;
      spark_heroW = canvas.offsetWidth;
      spark_heroH = canvas.offsetHeight;
      canvas.width = spark_heroW * dpr;
      canvas.height = spark_heroH * dpr;
      ctx.scale(dpr, dpr);
      buildHeroStars(spark_heroW, spark_heroH);
    }

    function drawHero(now) {
      const w = spark_heroW;
      const h = spark_heroH;
      ctx.clearRect(0, 0, w, h);

      // Sky gradient — deep indigo at top, slightly warmer at horizon
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#03040b');
      grad.addColorStop(0.6, '#060910');
      grad.addColorStop(1, '#0a0f1c');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Subtle faint nebula-like glow (top-right corner)
      const nebulaGrad = ctx.createRadialGradient(w * 0.82, h * 0.22, 0, w * 0.82, h * 0.22, w * 0.32);
      nebulaGrad.addColorStop(0, 'rgba(45, 55, 100, 0.18)');
      nebulaGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = nebulaGrad;
      ctx.fillRect(0, 0, w, h);

      // Stars
      for (let i = 0; i < spark_heroStars.length; i++) {
        const s = spark_heroStars[i];
        const alpha = s.base + Math.sin(now * s.spd * 1000 + s.phase) * 0.18;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(225, 238, 252, ${alpha})`;
        ctx.fill();
      }

      spark_heroRafId = requestAnimationFrame(drawHero);
    }

    resizeHero();
    window.addEventListener('resize', resizeHero);
    spark_heroRafId = requestAnimationFrame(drawHero);

    // Subtle mouse parallax on hero
    const heroSection = document.getElementById('hero');
    if (heroSection) {
      heroSection.addEventListener('mousemove', function (e) {
        const rect = heroSection.getBoundingClientRect();
        const dx = (e.clientX / rect.width - 0.5) * 10;
        const dy = (e.clientY / rect.height - 0.5) * 7;
        gsap.to(canvas, { x: -dx, y: -dy, duration: 1.8, ease: 'power2.out' });
        gsap.to('.hero-content', { x: dx * 0.25, y: dy * 0.2, duration: 2.0, ease: 'power2.out' });
      });

      heroSection.addEventListener('mouseleave', function () {
        gsap.to(canvas, { x: 0, y: 0, duration: 1.4, ease: 'power3.out' });
        gsap.to('.hero-content', { x: 0, y: 0, duration: 1.6, ease: 'power3.out' });
      });
    }
  }

  // ========================================
  // CONSTELLATION CANVAS — interactive + audio
  // seed independent from hero
  // ========================================
  function spark_initConstellationCanvas() {
    const canvas = document.getElementById('constellation-canvas');
    const nameEl = document.getElementById('sky-const-name');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Constellation definitions (normalized 0–1 coords)
    const spark_constellData = [
      {
        name: '오리온',
        latin: 'Orion',
        freq: 329.63,
        stars: [
          { x: 0.30, y: 0.30, r: 2.3 }, // Betelgeuse
          { x: 0.40, y: 0.34, r: 1.9 }, // Bellatrix
          { x: 0.31, y: 0.48, r: 1.4 }, // Mintaka
          { x: 0.34, y: 0.50, r: 1.5 }, // Alnilam
          { x: 0.37, y: 0.52, r: 1.4 }, // Alnitak
          { x: 0.28, y: 0.65, r: 2.1 }, // Rigel
          { x: 0.40, y: 0.63, r: 1.6 }, // Saiph
        ],
        lines: [[0, 2], [0, 1], [1, 6], [2, 3], [3, 4], [4, 5], [5, 6]],
      },
      {
        name: '큰곰자리',
        latin: 'Ursa Major',
        freq: 392.00,
        stars: [
          { x: 0.56, y: 0.18, r: 1.7 },
          { x: 0.62, y: 0.21, r: 1.6 },
          { x: 0.67, y: 0.27, r: 1.8 },
          { x: 0.64, y: 0.33, r: 1.6 },
          { x: 0.58, y: 0.37, r: 1.7 },
          { x: 0.52, y: 0.34, r: 1.5 },
          { x: 0.49, y: 0.27, r: 1.6 },
        ],
        lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0]],
      },
      {
        name: '카시오페이아',
        latin: 'Cassiopeia',
        freq: 440.00,
        stars: [
          { x: 0.70, y: 0.54, r: 1.7 },
          { x: 0.76, y: 0.49, r: 2.1 },
          { x: 0.82, y: 0.55, r: 1.6 },
          { x: 0.87, y: 0.50, r: 1.9 },
          { x: 0.93, y: 0.56, r: 1.7 },
        ],
        lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
      },
      {
        name: '거문고자리',
        latin: 'Lyra',
        freq: 523.25,
        stars: [
          { x: 0.67, y: 0.63, r: 2.6 }, // Vega
          { x: 0.70, y: 0.70, r: 1.3 },
          { x: 0.73, y: 0.67, r: 1.3 },
          { x: 0.73, y: 0.73, r: 1.2 },
          { x: 0.70, y: 0.76, r: 1.2 },
        ],
        lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 1]],
      },
      {
        name: '백조자리',
        latin: 'Cygnus',
        freq: 493.88,
        stars: [
          { x: 0.13, y: 0.60, r: 2.3 }, // Deneb
          { x: 0.20, y: 0.66, r: 1.5 },
          { x: 0.27, y: 0.72, r: 1.9 }, // Sadr
          { x: 0.34, y: 0.78, r: 1.5 },
          { x: 0.41, y: 0.84, r: 2.1 }, // Albireo
          { x: 0.20, y: 0.79, r: 1.4 },
          { x: 0.35, y: 0.66, r: 1.4 },
        ],
        lines: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [2, 6]],
      },
    ];

    // Background field stars (seeded, dense)
    const fieldRng = spark_createPRNG(3344);
    const spark_fieldStars = Array.from({ length: 200 }, function () {
      return {
        nx: fieldRng(),
        ny: fieldRng(),
        r: fieldRng() * 0.85 + 0.15,
        alpha: fieldRng() * 0.38 + 0.08,
      };
    });

    let spark_hoveredConst = null;
    let spark_lastToned = null;
    let spark_toneTimer = null;
    let spark_logicalW = 0;
    let spark_logicalH = 0;

    function resizeConst() {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      spark_logicalW = rect.width;
      spark_logicalH = rect.height;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      drawConst();
    }

    function toPixel(c) {
      return {
        ...c,
        stars: c.stars.map(function (s) {
          return { ...s, px: s.x * spark_logicalW, py: s.y * spark_logicalH };
        }),
      };
    }

    function findHovered(mx, my) {
      let best = null;
      let bestDist = 48;
      for (let i = 0; i < spark_constellData.length; i++) {
        const c = spark_constellData[i];
        for (let j = 0; j < c.stars.length; j++) {
          const s = c.stars[j];
          const d = Math.hypot(mx - s.x * spark_logicalW, my - s.y * spark_logicalH);
          if (d < bestDist) {
            bestDist = d;
            best = c.name;
          }
        }
      }
      return best;
    }

    function drawConst() {
      const w = spark_logicalW;
      const h = spark_logicalH;
      ctx.clearRect(0, 0, w, h);

      // Background
      ctx.fillStyle = '#050810';
      ctx.fillRect(0, 0, w, h);

      // Milky Way haze — diagonal band
      const mwGrad = ctx.createLinearGradient(0, h * 0.2, w, h * 0.8);
      mwGrad.addColorStop(0, 'transparent');
      mwGrad.addColorStop(0.25, 'rgba(38, 48, 90, 0.12)');
      mwGrad.addColorStop(0.5, 'rgba(50, 62, 110, 0.18)');
      mwGrad.addColorStop(0.75, 'rgba(38, 48, 90, 0.12)');
      mwGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = mwGrad;
      ctx.fillRect(0, 0, w, h);

      // Field stars
      for (let i = 0; i < spark_fieldStars.length; i++) {
        const s = spark_fieldStars[i];
        ctx.beginPath();
        ctx.arc(s.nx * w, s.ny * h, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(195, 215, 240, ${s.alpha})`;
        ctx.fill();
      }

      // Constellations
      for (let ci = 0; ci < spark_constellData.length; ci++) {
        const raw = spark_constellData[ci];
        const c = toPixel(raw);
        const isHov = spark_hoveredConst === c.name;

        // Lines
        for (let li = 0; li < c.lines.length; li++) {
          const ai = c.lines[li][0];
          const bi = c.lines[li][1];
          const sa = c.stars[ai];
          const sb = c.stars[bi];
          ctx.beginPath();
          ctx.moveTo(sa.px, sa.py);
          ctx.lineTo(sb.px, sb.py);
          ctx.strokeStyle = isHov
            ? 'rgba(140, 185, 220, 0.52)'
            : 'rgba(100, 140, 180, 0.11)';
          ctx.lineWidth = isHov ? 1.1 : 0.55;
          ctx.stroke();
        }

        // Stars
        for (let si = 0; si < c.stars.length; si++) {
          const s = c.stars[si];
          const drawR = isHov ? s.r * 1.65 : s.r;

          if (isHov) {
            // glow
            const glowGrad = ctx.createRadialGradient(s.px, s.py, 0, s.px, s.py, drawR * 4.5);
            glowGrad.addColorStop(0, 'rgba(150, 200, 240, 0.55)');
            glowGrad.addColorStop(1, 'transparent');
            ctx.beginPath();
            ctx.arc(s.px, s.py, drawR * 4.5, 0, Math.PI * 2);
            ctx.fillStyle = glowGrad;
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(s.px, s.py, drawR, 0, Math.PI * 2);
          ctx.fillStyle = isHov
            ? 'rgba(240, 248, 255, 1)'
            : 'rgba(200, 220, 245, 0.88)';
          ctx.fill();
        }

        // Label on hover
        if (isHov) {
          let sumX = 0;
          let minY = Infinity;
          for (let si = 0; si < c.stars.length; si++) {
            sumX += c.stars[si].px;
            if (c.stars[si].py < minY) minY = c.stars[si].py;
          }
          const cx = sumX / c.stars.length;

          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(140, 185, 225, 0.92)';
          ctx.font = '600 12px Syne, sans-serif';
          ctx.fillText(c.name, cx, minY - 14);
          ctx.fillStyle = 'rgba(100, 140, 175, 0.7)';
          ctx.font = '400 10px Syne, sans-serif';
          ctx.fillText(c.latin, cx, minY - 2);
        }
      }
    }

    function handlePointerMove(mx, my) {
      const hov = findHovered(mx, my);
      if (hov !== spark_hoveredConst) {
        spark_hoveredConst = hov;
        if (nameEl) {
          nameEl.textContent = hov
            ? (spark_constellData.find(function (c) { return c.name === hov; }) || {}).name || ''
            : '';
        }
        if (hov && hov !== spark_lastToned) {
          clearTimeout(spark_toneTimer);
          spark_toneTimer = setTimeout(function () {
            const found = spark_constellData.find(function (c) { return c.name === hov; });
            if (found) {
              spark_playTone(found.freq);
              spark_lastToned = hov;
            }
          }, 80);
        }
        if (!hov) spark_lastToned = null;
        drawConst();
      }
    }

    canvas.addEventListener('mousemove', function (e) {
      const rect = canvas.getBoundingClientRect();
      handlePointerMove(e.clientX - rect.left, e.clientY - rect.top);
    });

    canvas.addEventListener('mouseleave', function () {
      spark_hoveredConst = null;
      spark_lastToned = null;
      if (nameEl) nameEl.textContent = '';
      drawConst();
    });

    canvas.addEventListener('touchmove', function (e) {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      handlePointerMove(touch.clientX - rect.left, touch.clientY - rect.top);
    }, { passive: false });

    canvas.addEventListener('touchend', function () {
      spark_hoveredConst = null;
      if (nameEl) nameEl.textContent = '';
      drawConst();
    });

    resizeConst();
    window.addEventListener('resize', resizeConst);
  }

  // ========================================
  // RESERVE STAR CANVAS
  // seed=5566 — denser, slightly slower twinkle
  // ========================================
  function spark_initReserveCanvas() {
    const canvas = document.getElementById('reserve-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rng = spark_createPRNG(5566);

    let spark_resW = 0;
    let spark_resH = 0;
    let spark_resStars = [];
    let spark_resRafId = null;

    function buildResStars(w, h) {
      spark_resStars = [];
      for (let i = 0; i < 220; i++) {
        spark_resStars.push({
          x: rng() * w,
          y: rng() * h,
          r: rng() * 1.15 + 0.15,
          base: rng() * 0.48 + 0.18,
          phase: rng() * Math.PI * 2,
          spd: rng() * 0.0005 + 0.00018,
        });
      }
    }

    function resizeRes() {
      const dpr = window.devicePixelRatio || 1;
      spark_resW = canvas.offsetWidth;
      spark_resH = canvas.offsetHeight;
      canvas.width = spark_resW * dpr;
      canvas.height = spark_resH * dpr;
      ctx.scale(dpr, dpr);
      buildResStars(spark_resW, spark_resH);
    }

    function drawRes(now) {
      const w = spark_resW;
      const h = spark_resH;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#040710';
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < spark_resStars.length; i++) {
        const s = spark_resStars[i];
        const alpha = s.base + Math.sin(now * s.spd * 1000 + s.phase) * 0.14;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(205, 222, 245, ${alpha})`;
        ctx.fill();
      }

      spark_resRafId = requestAnimationFrame(drawRes);
    }

    resizeRes();
    window.addEventListener('resize', resizeRes);
    spark_resRafId = requestAnimationFrame(drawRes);
  }

  // ========================================
  // LENIS
  // ========================================
  let spark_lenis = null;

  function spark_initLenis() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    spark_lenis = new Lenis({
      duration: 1.25,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    });
    spark_lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { spark_lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  // ========================================
  // NAV — scrolled class + anchor links
  // ========================================
  function spark_initNav() {
    const nav = document.getElementById('site-nav');
    if (!nav) return;

    ScrollTrigger.create({
      start: 'top -60px',
      onUpdate: function (self) {
        if (self.scroll() > 60) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
      },
    });

    nav.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        const href = link.getAttribute('href');
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        if (spark_lenis) {
          spark_lenis.scrollTo(target, { offset: -72 });
        } else {
          const top = target.getBoundingClientRect().top + window.scrollY - 72;
          window.scrollTo({ top: top, behavior: 'auto' });
        }
      });
    });
  }

  // ========================================
  // PROGRESS BAR
  // ========================================
  function spark_initProgress() {
    const bar = document.getElementById('progress-bar');
    if (!bar) return;
    ScrollTrigger.create({
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: function (self) {
        bar.style.width = (self.progress * 100) + '%';
      },
    });
  }

  // ========================================
  // GSAP ANIMATIONS
  // ========================================
  function spark_initAnimations() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    // Hero entrance
    const heroTL = gsap.timeline({ defaults: { ease: 'power4.out' }, delay: 0.15 });
    heroTL
      .from('.hero-title', { y: 70, opacity: 0, duration: 1.5 })
      .from('.hero-phonetic', { y: 22, opacity: 0, duration: 0.9 }, '-=0.85')
      .from('.hero-desc', { y: 22, opacity: 0, duration: 0.9 }, '-=0.7')
      .from('.hero-aside', { y: 12, opacity: 0, duration: 0.7 }, '-=0.5');

    // Scroll line pulse
    gsap.to('.hero-aside-line', {
      scaleY: 0.15,
      transformOrigin: 'top center',
      duration: 1.0,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
    });

    // Generic reveals
    document.querySelectorAll('.reveal').forEach(function (el) {
      gsap.fromTo(el,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.95,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 87%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    // About image parallax scroll
    const aboutImg = document.querySelector('.about-img-wrap');
    if (aboutImg) {
      gsap.to(aboutImg.querySelector('img'), {
        y: -40,
        ease: 'none',
        scrollTrigger: {
          trigger: '#about',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
      });
    }

    // Visit cards stagger
    gsap.fromTo('.visit-card',
      { y: 28, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.78,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.visit-grid',
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
      }
    );

    // Reserve section — subtle text shimmer on heading
    const reserveHeading = document.querySelector('.reserve-heading');
    if (reserveHeading) {
      gsap.fromTo(reserveHeading,
        { y: 45, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: '#reserve',
            start: 'top 72%',
            toggleActions: 'play none none none',
          },
        }
      );
    }
  }

  // ========================================
  // INIT
  // ========================================
  function spark_init() {
    gsap.registerPlugin(ScrollTrigger);
    spark_initLenis();
    spark_initHeroCanvas();
    spark_initConstellationCanvas();
    spark_initReserveCanvas();
    spark_initNav();
    spark_initProgress();
    spark_initAnimations();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', spark_init);
  } else {
    spark_init();
  }

})();
