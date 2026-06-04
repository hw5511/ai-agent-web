/* ============================================================
   이안 夷安 천문대 : script.js
   ============================================================ */
(function () {
  'use strict';

  const spark_reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ──────────────────────────────────────
     LENIS SMOOTH SCROLL
  ────────────────────────────────────── */
  let spark_lenis = null;
  if (!spark_reducedMotion && typeof Lenis !== 'undefined') {
    spark_lenis = new Lenis({
      duration: 1.2,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }
    });
    spark_lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { spark_lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ──────────────────────────────────────
     SEEDED PRNG (LCG)
  ────────────────────────────────────── */
  function seededRand(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 0xFFFFFFFF;
    };
  }

  /* ──────────────────────────────────────
     CANVAS STAR FIELD
  ────────────────────────────────────── */
  const spark_canvas = document.getElementById('starCanvas');
  const spark_ctx    = spark_canvas.getContext('2d');

  let spark_cw = 0;
  let spark_ch = 0;
  let spark_starsFar  = [];
  let spark_starsMid  = [];
  let spark_starsNear = [];
  let spark_scrollPct = 0;
  let spark_mouseX    = 0;
  let spark_mouseY    = 0;
  let spark_targetMX  = 0;
  let spark_targetMY  = 0;

  function spark_buildStars() {
    spark_cw = window.innerWidth;
    spark_ch = window.innerHeight;
    spark_canvas.width  = spark_cw;
    spark_canvas.height = spark_ch;

    const r = seededRand(1742);
    const area = spark_cw * spark_ch;

    spark_starsFar = [];
    const farCount = Math.floor(area / 2800);
    for (let i = 0; i < farCount; i++) {
      spark_starsFar.push({
        x:  r() * spark_cw,
        y:  r() * spark_ch,
        sz: 0.28 + r() * 0.48,
        op: 0.18 + r() * 0.3,
        to: r() * Math.PI * 2,
        ts: 0.35 + r() * 0.75
      });
    }

    spark_starsMid = [];
    const midCount = Math.floor(area / 7500);
    for (let i = 0; i < midCount; i++) {
      spark_starsMid.push({
        x:  r() * spark_cw,
        y:  r() * spark_ch,
        sz: 0.48 + r() * 0.82,
        op: 0.3 + r() * 0.38,
        to: r() * Math.PI * 2,
        ts: 0.28 + r() * 0.55
      });
    }

    spark_starsNear = [];
    const nearCount = Math.floor(area / 22000);
    for (let i = 0; i < nearCount; i++) {
      const bx = r() * spark_cw;
      const by = r() * spark_ch;
      spark_starsNear.push({
        bx: bx,
        by: by,
        sz: 0.85 + r() * 1.3,
        op: 0.55 + r() * 0.42,
        to: r() * Math.PI * 2,
        ts: 0.18 + r() * 0.45,
        ps: 7 + r() * 14
      });
    }
  }

  function spark_drawFrame(ts) {
    const t = ts * 0.001;

    spark_ctx.clearRect(0, 0, spark_cw, spark_ch);

    const exposure = Math.min(1, 0.48 + spark_scrollPct * 0.52);

    /* far : blurry via shadowBlur */
    spark_ctx.save();
    spark_ctx.shadowBlur = 3;
    spark_ctx.shadowColor = 'rgba(180,215,255,0.28)';
    spark_ctx.fillStyle = '#c8dcff';
    spark_ctx.beginPath();
    for (let i = 0; i < spark_starsFar.length; i++) {
      const s = spark_starsFar[i];
      const tw = 0.84 + 0.16 * Math.sin(t * s.ts + s.to);
      spark_ctx.globalAlpha = s.op * tw * exposure;
      spark_ctx.moveTo(s.x + s.sz, s.y);
      spark_ctx.arc(s.x, s.y, s.sz, 0, 6.2832);
    }
    spark_ctx.fill();
    spark_ctx.restore();

    /* mid */
    spark_ctx.save();
    spark_ctx.shadowBlur = 1.8;
    spark_ctx.shadowColor = 'rgba(200,228,255,0.38)';
    spark_ctx.fillStyle = '#d8eaff';
    spark_ctx.beginPath();
    for (let i = 0; i < spark_starsMid.length; i++) {
      const s = spark_starsMid[i];
      const tw = 0.78 + 0.22 * Math.sin(t * s.ts + s.to);
      spark_ctx.globalAlpha = s.op * tw * exposure;
      spark_ctx.moveTo(s.x + s.sz, s.y);
      spark_ctx.arc(s.x, s.y, s.sz, 0, 6.2832);
    }
    spark_ctx.fill();
    spark_ctx.restore();

    /* near : sharp + parallax + diffraction */
    const mxn = (spark_mouseX / spark_cw) - 0.5;
    const myn = (spark_mouseY / spark_ch) - 0.5;

    spark_ctx.save();
    spark_ctx.shadowBlur = 5;
    spark_ctx.shadowColor = 'rgba(180,220,255,0.55)';
    for (let i = 0; i < spark_starsNear.length; i++) {
      const s   = spark_starsNear[i];
      const px  = s.bx + mxn * s.ps;
      const py  = s.by + myn * s.ps;
      const tw  = 0.72 + 0.28 * Math.sin(t * s.ts + s.to);
      const alp = s.op * tw * exposure;

      spark_ctx.globalAlpha = alp;
      spark_ctx.fillStyle = '#eef5ff';
      spark_ctx.beginPath();
      spark_ctx.arc(px, py, s.sz, 0, 6.2832);
      spark_ctx.fill();

      if (s.sz > 1.3) {
        spark_ctx.globalAlpha = alp * 0.12;
        spark_ctx.strokeStyle = '#eef5ff';
        spark_ctx.lineWidth = 0.5;
        spark_ctx.beginPath();
        spark_ctx.moveTo(px - s.sz * 3.5, py);
        spark_ctx.lineTo(px + s.sz * 3.5, py);
        spark_ctx.stroke();
        spark_ctx.beginPath();
        spark_ctx.moveTo(px, py - s.sz * 3.5);
        spark_ctx.lineTo(px, py + s.sz * 3.5);
        spark_ctx.stroke();
      }
    }
    spark_ctx.restore();
    spark_ctx.globalAlpha = 1;

    requestAnimationFrame(spark_drawFrame);
  }

  /* ──────────────────────────────────────
     MOUSE SMOOTH TRACKING
  ────────────────────────────────────── */
  function spark_mouseLoop() {
    spark_mouseX += (spark_targetMX - spark_mouseX) * 0.055;
    spark_mouseY += (spark_targetMY - spark_mouseY) * 0.055;
    requestAnimationFrame(spark_mouseLoop);
  }

  window.addEventListener('mousemove', function (e) {
    spark_targetMX = e.clientX;
    spark_targetMY = e.clientY;
  }, { passive: true });

  /* ──────────────────────────────────────
     PROGRESS BAR + SCROLL STATE
  ────────────────────────────────────── */
  const spark_progressBar = document.getElementById('progressBar');
  const spark_nav         = document.querySelector('.site-nav');

  function spark_onScroll() {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    spark_scrollPct = total > 0 ? scrolled / total : 0;
    spark_progressBar.style.width = (spark_scrollPct * 100) + '%';
    if (scrolled > 55) {
      spark_nav.classList.add('scrolled');
    } else {
      spark_nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', spark_onScroll, { passive: true });

  /* ──────────────────────────────────────
     GSAP ANIMATIONS
  ────────────────────────────────────── */
  function spark_initGsap() {
    if (spark_reducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    /* Hero entrance */
    const spark_heroTl = gsap.timeline({ delay: 0.25 });
    spark_heroTl
      .to('.hero-title', {
        opacity: 1, y: 0,
        duration: 1.5, ease: 'power3.out'
      }, 0)
      .to('.hero-sub', {
        opacity: 1, y: 0,
        duration: 1.2, ease: 'power3.out'
      }, 0.28)
      .to('.hero-vertical', {
        opacity: 1, x: 0,
        duration: 1.4, ease: 'power3.out'
      }, 0.5)
      .to('.hero-coordinates', {
        opacity: 1, y: 0,
        duration: 1.0, ease: 'power2.out'
      }, 0.75);

    /* Hanja parallax */
    gsap.to('.hero-bg-hanja', {
      yPercent: 18,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.2
      }
    });

    /* Reveal items */
    const spark_revealEls = document.querySelectorAll('.reveal-item');
    spark_revealEls.forEach(function (el) {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 82%',
          toggleActions: 'play none none none'
        }
      });
    });

    /* Sky cards staggered */
    gsap.fromTo('.sky-card',
      { opacity: 0, y: 28 },
      {
        opacity: 1, y: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.sky-grid',
          start: 'top 80%'
        }
      }
    );

    /* Constellation line draw-in */
    const spark_lines = document.querySelectorAll('.const-line');
    spark_lines.forEach(function (line) {
      let len = 60;
      if (line.getTotalLength) { len = line.getTotalLength(); }
      gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(line, {
        strokeDashoffset: 0,
        duration: 1.3,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: line.closest('.sky-card'),
          start: 'top 78%'
        }
      });
    });

    /* Program cards staggered */
    gsap.fromTo('.program-card',
      { opacity: 0, y: 24 },
      {
        opacity: 1, y: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.programs-grid',
          start: 'top 80%'
        }
      }
    );

    /* Space image subtle parallax */
    gsap.to('.space-image', {
      yPercent: -7,
      ease: 'none',
      scrollTrigger: {
        trigger: '.section-space',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.8
      }
    });
  }

  /* ──────────────────────────────────────
     RESIZE
  ────────────────────────────────────── */
  let spark_resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(spark_resizeTimer);
    spark_resizeTimer = setTimeout(function () {
      spark_buildStars();
      if (!spark_reducedMotion && typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    }, 150);
  }, { passive: true });

  /* ──────────────────────────────────────
     INIT
  ────────────────────────────────────── */
  spark_buildStars();
  requestAnimationFrame(spark_drawFrame);
  requestAnimationFrame(spark_mouseLoop);
  spark_initGsap();
  spark_onScroll();

}());
