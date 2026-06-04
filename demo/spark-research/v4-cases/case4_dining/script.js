(function () {
  'use strict';

  /* ============================================================
     LENIS SMOOTH SCROLL (필수 보일러플레이트)
     ============================================================ */
  const spark_lenis = new Lenis({
    duration: 1.2,
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }
  });
  spark_lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(function (time) { spark_lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  /* ============================================================
     PROGRESS BAR
     ============================================================ */
  const spark_progressBar = document.getElementById('gm_progressBar');
  spark_lenis.on('scroll', function (e) {
    const pct = (e.scroll / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    spark_progressBar.style.width = Math.min(pct, 100) + '%';
  });

  /* ============================================================
     NAV : scrolled state
     ============================================================ */
  const spark_nav = document.getElementById('gm_nav');
  spark_lenis.on('scroll', function (e) {
    if (e.scroll > 60) {
      spark_nav.classList.add('scrolled');
    } else {
      spark_nav.classList.remove('scrolled');
    }
  });

  /* ============================================================
     MOBILE MENU
     ============================================================ */
  const spark_navToggle  = document.getElementById('gm_navToggle');
  const spark_mobileMenu = document.getElementById('gm_mobileMenu');
  const spark_menuClose  = document.getElementById('gm_menuClose');

  function gm_openMenu() {
    spark_mobileMenu.classList.add('open');
    spark_mobileMenu.setAttribute('aria-hidden', 'false');
    spark_navToggle.setAttribute('aria-expanded', 'true');
    spark_navToggle.setAttribute('aria-label', '메뉴 닫기');
    spark_lenis.stop();
    spark_menuClose.focus();
  }

  function gm_closeMenu() {
    spark_mobileMenu.classList.remove('open');
    spark_mobileMenu.setAttribute('aria-hidden', 'true');
    spark_navToggle.setAttribute('aria-expanded', 'false');
    spark_navToggle.setAttribute('aria-label', '메뉴 열기');
    spark_lenis.start();
    spark_navToggle.focus();
  }

  spark_navToggle.addEventListener('click', gm_openMenu);
  spark_menuClose.addEventListener('click', gm_closeMenu);

  spark_mobileMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', gm_closeMenu);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && spark_mobileMenu.classList.contains('open')) {
      gm_closeMenu();
    }
  });

  /* ============================================================
     SCROLL REVEALS (gsap.matchMedia : reduced-motion 분기)
     ============================================================ */
  gsap.registerPlugin(ScrollTrigger);

  const spark_mm = gsap.matchMedia();

  spark_mm.add('(prefers-reduced-motion: no-preference)', function () {
    const spark_revealEls = document.querySelectorAll('.reveal');

    spark_revealEls.forEach(function (el, i) {
      gsap.fromTo(
        el,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
            once: true
          },
          delay: (i % 4) * 0.07
        }
      );
    });

    /* Course track fill : musical staff innovation */
    const spark_trackFill = document.getElementById('gm_trackFill');
    const spark_courseSection = document.getElementById('course');
    if (spark_trackFill && spark_courseSection) {
      ScrollTrigger.create({
        trigger: spark_courseSection,
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: 1,
        onUpdate: function (self) {
          spark_trackFill.style.width = (self.progress * 100) + '%';
        }
      });
    }
  });

  spark_mm.add('(prefers-reduced-motion: reduce)', function () {
    /* Ensure all reveal elements are immediately visible */
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    const spark_trackFill2 = document.getElementById('gm_trackFill');
    if (spark_trackFill2) spark_trackFill2.style.width = '100%';
  });

  /* ============================================================
     CANVAS RESONANCE WAVES : SURPRISE ELEMENT
     "공명(共鳴)" 시각화: 마우스 위치에서 파동이 번짐
     Seeded bg dots for "야생의 정합" AESTHETIC_PINCH
     ============================================================ */
  {
    const spark_canvas = document.getElementById('gm_heroCanvas');
    if (spark_canvas) {
    const spark_ctx = spark_canvas.getContext('2d');

    let gm_cw = 0;
    let gm_ch = 0;
    let gm_mouseNX = 0.4;   /* normalized X */
    let gm_mouseNY = 0.55;  /* normalized Y */
    let gm_rings = [];
    let gm_rafId = null;
    let gm_spawnTimer = 0;
    const SPAWN_INTERVAL = 2200; /* ms between ring births */
    const RING_SPEED     = 0.55; /* px per frame at 60fps */
    const RING_MAX_FRAC  = 0.65; /* ring expands to this fraction of max(w,h) */

    /* Seeded PRNG : deterministic background */
    function gm_lcg(seed) {
      let s = seed >>> 0;
      return function () {
        s = (Math.imul(1664525, s) + 1013904223) >>> 0;
        return s / 0xFFFFFFFF;
      };
    }

    function gm_resize() {
      gm_cw = spark_canvas.offsetWidth;
      gm_ch = spark_canvas.offsetHeight;
      spark_canvas.width  = gm_cw;
      spark_canvas.height = gm_ch;
    }

    function gm_drawSeededBg() {
      const rand = gm_lcg(20240315);
      const count = Math.floor((gm_cw * gm_ch) / 14000);
      spark_ctx.beginPath();
      for (let i = 0; i < count; i++) {
        const x = rand() * gm_cw;
        const y = rand() * gm_ch;
        const r = rand() * 1.0 + 0.3;
        spark_ctx.moveTo(x + r, y);
        spark_ctx.arc(x, y, r, 0, Math.PI * 2);
      }
      spark_ctx.fillStyle = 'rgba(210,185,130,0.07)';
      spark_ctx.fill();
    }

    function gm_spawnRing() {
      const x = gm_cw * gm_mouseNX;
      const y = gm_ch * gm_mouseNY;
      const maxR = Math.max(gm_cw, gm_ch) * RING_MAX_FRAC;
      gm_rings.push({ x: x, y: y, r: 2, maxR: maxR });
      if (gm_rings.length > 6) gm_rings.shift();
    }

    function gm_draw(ts) {
      spark_ctx.clearRect(0, 0, gm_cw, gm_ch);
      gm_drawSeededBg();

      /* advance and draw rings */
      const alive = [];
      for (let i = 0; i < gm_rings.length; i++) {
        const ring = gm_rings[i];
        ring.r += RING_SPEED * (16.67 / 16.67); /* ~1px per frame */
        const prog = ring.r / ring.maxR;
        if (prog >= 1) continue;
        const alpha = 0.28 * (1 - prog) * (1 - prog);
        spark_ctx.beginPath();
        spark_ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
        spark_ctx.strokeStyle = 'rgba(210,185,130,' + alpha.toFixed(3) + ')';
        spark_ctx.lineWidth = 1;
        spark_ctx.stroke();

        /* second inner ring (offset) for depth */
        if (ring.r > 40) {
          const innerAlpha = alpha * 0.45;
          spark_ctx.beginPath();
          spark_ctx.arc(ring.x, ring.y, ring.r - 30, 0, Math.PI * 2);
          spark_ctx.strokeStyle = 'rgba(210,185,130,' + innerAlpha.toFixed(3) + ')';
          spark_ctx.lineWidth = 0.5;
          spark_ctx.stroke();
        }
        alive.push(ring);
      }
      gm_rings = alive;

      /* spawn on interval */
      if (!gm_spawnTimer || ts - gm_spawnTimer >= SPAWN_INTERVAL) {
        gm_spawnRing();
        gm_spawnTimer = ts;
      }

      gm_rafId = requestAnimationFrame(gm_draw);
    }

    /* Mouse tracking (normalized) */
    const spark_heroSection = document.getElementById('hero');
    if (spark_heroSection) {
      spark_heroSection.addEventListener('mousemove', function (e) {
        const rect = spark_heroSection.getBoundingClientRect();
        gm_mouseNX += ((e.clientX - rect.left) / rect.width  - gm_mouseNX) * 0.06;
        gm_mouseNY += ((e.clientY - rect.top)  / rect.height - gm_mouseNY) * 0.06;
      });
    }

    /* ResizeObserver */
    const spark_ro = new ResizeObserver(function () {
      gm_resize();
    });
    spark_ro.observe(spark_canvas);

    /* Init */
    gm_resize();
    gm_spawnRing();
    gm_rafId = requestAnimationFrame(gm_draw);

    /* Pause when tab hidden */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        cancelAnimationFrame(gm_rafId);
      } else {
        gm_rafId = requestAnimationFrame(gm_draw);
      }
    });
    } /* end if (spark_canvas) */
  }

  /* ============================================================
     RESERVATION FORM : submit handler
     ============================================================ */
  const spark_form = document.getElementById('gm_resForm');
  if (spark_form) {
    spark_form.addEventListener('submit', function (e) {
      e.preventDefault();
      const spark_submitBtn = spark_form.querySelector('.form-submit');
      spark_submitBtn.textContent = '신청이 접수되었습니다';
      spark_submitBtn.disabled = true;
      spark_submitBtn.style.background = 'oklch(25% 0.01 80)';
      spark_submitBtn.style.color = 'oklch(60% 0.01 80)';
    });
  }

  /* ============================================================
     SMOOTH ANCHOR NAVIGATION via Lenis
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        spark_lenis.scrollTo(target, { offset: -60, duration: 1.4 });
      }
    });
  });

})();
