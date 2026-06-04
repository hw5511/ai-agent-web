/* ═══════════════════════════════════════
   NOCTURNE · script.js
   ═══════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Config ── */
  const spark_cfg = {
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  /* ══════════════════════════════════════
     LENIS SMOOTH SCROLL
  ══════════════════════════════════════ */
  let spark_lenis = null;

  if (!spark_cfg.reducedMotion) {
    spark_lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    });

    spark_lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      spark_lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }

  /* ══════════════════════════════════════
     GSAP PLUGIN REGISTER
  ══════════════════════════════════════ */
  gsap.registerPlugin(ScrollTrigger);

  /* ══════════════════════════════════════
     PROGRESS BAR
  ══════════════════════════════════════ */
  const spark_progressFill = document.querySelector('.progress-fill');

  if (spark_lenis) {
    spark_lenis.on('scroll', function (e) {
      const pct = Math.min((e.scroll / e.limit) * 100, 100);
      spark_progressFill.style.width = pct + '%';
    });
  } else {
    window.addEventListener('scroll', function () {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct = total > 0 ? Math.min((scrolled / total) * 100, 100) : 0;
      spark_progressFill.style.width = pct + '%';
    }, { passive: true });
  }

  /* ══════════════════════════════════════
     NAVIGATION
  ══════════════════════════════════════ */
  const spark_nav = document.querySelector('.nav');
  const spark_menuBtn = document.querySelector('.nav-menu');
  const spark_mobileMenu = document.querySelector('.mobile-menu');

  /* Scroll-based nav style */
  ScrollTrigger.create({
    start: 'top -60',
    onUpdate: function (self) {
      if (self.scroll() > 60) {
        spark_nav.classList.add('nav--scrolled');
      } else {
        spark_nav.classList.remove('nav--scrolled');
      }
    }
  });

  /* Mobile menu toggle */
  spark_menuBtn.addEventListener('click', function () {
    const isOpen = spark_menuBtn.getAttribute('aria-expanded') === 'true';
    const nextState = !isOpen;
    spark_menuBtn.setAttribute('aria-expanded', String(nextState));
    spark_mobileMenu.classList.toggle('is-open', nextState);
    document.body.classList.toggle('menu-open', nextState);
  });

  /* Close mobile menu on link click */
  spark_mobileMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      spark_menuBtn.setAttribute('aria-expanded', 'false');
      spark_mobileMenu.classList.remove('is-open');
      document.body.classList.remove('menu-open');
    });
  });

  /* Smooth anchor scroll */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      if (spark_lenis) {
        spark_lenis.scrollTo(target, { offset: -80 });
      } else {
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'auto' });
      }
    });
  });

  /* ══════════════════════════════════════
     HERO CANVAS · SCENT PARTICLE SYSTEM
  ══════════════════════════════════════ */
  (function () {
    const canvas = document.querySelector('.hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const heroEl = document.querySelector('.hero');

    /* State (contained · no global leakage) */
    const S = {
      w: 0,
      h: 0,
      particles: [],
      mouse: { x: -2000, y: -2000 },
      lerpMouse: { x: -2000, y: -2000 },
      rafId: null,
      resizeTimer: null
    };

    const MOUSE_RADIUS = 140;
    const LERP_BASE = 0.04;
    const MOUSE_LERP = 0.055;

    function makeParticle(w, h) {
      const bx = Math.random() * w;
      const by = Math.random() * h;
      return {
        bx,
        by,
        x: bx,
        y: by,
        vx: 0,
        vy: 0,
        size: Math.random() * 2.2 + 0.4,
        baseOp: Math.random() * 0.38 + 0.06,
        op: 0,
        drX: (Math.random() - 0.5) * 0.35,
        drY: (Math.random() - 0.5) * 0.22,
        phase: Math.random() * Math.PI * 2,
        spd: Math.random() * 0.0025 + 0.0008
      };
    }

    function buildParticles() {
      const count = S.w < 768 ? 55 : 95;
      S.particles = [];
      for (let i = 0; i < count; i++) {
        S.particles.push(makeParticle(S.w, S.h));
      }
    }

    function resizeCanvas() {
      S.w = heroEl.offsetWidth;
      S.h = heroEl.offsetHeight;
      canvas.width = S.w;
      canvas.height = S.h;
      buildParticles();
    }

    function update(t) {
      /* Lerp tracked mouse */
      S.lerpMouse.x += (S.mouse.x - S.lerpMouse.x) * MOUSE_LERP;
      S.lerpMouse.y += (S.mouse.y - S.lerpMouse.y) * MOUSE_LERP;

      for (let i = 0; i < S.particles.length; i++) {
        const p = S.particles[i];

        /* Drift base position (slow Brownian) */
        p.bx += Math.sin(t * p.spd + p.phase) * p.drX;
        p.by += Math.cos(t * p.spd * 0.8 + p.phase) * p.drY;

        /* Wrap base position */
        if (p.bx < -10) p.bx = S.w + 10;
        else if (p.bx > S.w + 10) p.bx = -10;
        if (p.by < -10) p.by = S.h + 10;
        else if (p.by > S.h + 10) p.by = -10;

        /* Mouse repulsion */
        const dx = p.x - S.lerpMouse.x;
        const dy = p.y - S.lerpMouse.y;
        const dist2 = dx * dx + dy * dy;
        const dist = Math.sqrt(dist2);

        if (dist < MOUSE_RADIUS && dist > 0.1) {
          const force = (1 - dist / MOUSE_RADIUS) * 3.2;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
          p.op += (Math.min(p.baseOp * (1 + force * 1.8), 0.85) - p.op) * 0.12;
        } else {
          p.op += (p.baseOp - p.op) * 0.04;
        }

        /* Lerp toward base */
        p.vx += (p.bx - p.x) * LERP_BASE;
        p.vy += (p.by - p.y) * LERP_BASE;

        /* Damping */
        p.vx *= 0.87;
        p.vy *= 0.87;

        p.x += p.vx;
        p.y += p.vy;
      }
    }

    function render() {
      ctx.clearRect(0, 0, S.w, S.h);

      /* Bucket particles by opacity for batch rendering */
      const BUCKETS = 20;
      const buckets = new Array(BUCKETS);
      for (let i = 0; i < BUCKETS; i++) buckets[i] = [];

      for (let i = 0; i < S.particles.length; i++) {
        const p = S.particles[i];
        const bi = Math.min(Math.floor(p.op * BUCKETS), BUCKETS - 1);
        buckets[bi].push(p);
      }

      for (let bi = 0; bi < BUCKETS; bi++) {
        const group = buckets[bi];
        if (!group.length) continue;
        const opVal = (bi / BUCKETS).toFixed(3);
        ctx.fillStyle = 'rgba(200,165,100,' + opVal + ')';
        ctx.beginPath();
        for (let j = 0; j < group.length; j++) {
          const p = group[j];
          ctx.moveTo(p.x + p.size, p.y);
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        }
        ctx.fill();
      }
    }

    function loop(ts) {
      const t = ts * 0.001;
      update(t);
      render();
      S.rafId = requestAnimationFrame(loop);
    }

    function onMouseMove(e) {
      const rect = canvas.getBoundingClientRect();
      S.mouse.x = e.clientX - rect.left;
      S.mouse.y = e.clientY - rect.top;
    }

    function onMouseLeave() {
      S.mouse.x = -2000;
      S.mouse.y = -2000;
    }

    function onTouchMove(e) {
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      S.mouse.x = touch.clientX - rect.left;
      S.mouse.y = touch.clientY - rect.top;
    }

    function onTouchEnd() {
      S.mouse.x = -2000;
      S.mouse.y = -2000;
    }

    function onResize() {
      clearTimeout(S.resizeTimer);
      S.resizeTimer = setTimeout(resizeCanvas, 220);
    }

    /* Init */
    resizeCanvas();
    window.addEventListener('resize', onResize);
    heroEl.addEventListener('mousemove', onMouseMove);
    heroEl.addEventListener('mouseleave', onMouseLeave);
    heroEl.addEventListener('touchmove', onTouchMove, { passive: true });
    heroEl.addEventListener('touchend', onTouchEnd);

    S.rafId = requestAnimationFrame(loop);
  })();

  /* ══════════════════════════════════════
     GSAP HERO ENTRANCE
  ══════════════════════════════════════ */
  if (!spark_cfg.reducedMotion) {
    const spark_heroTl = gsap.timeline({ delay: 0.2 });
    spark_heroTl
      .from('.hero-year',  { opacity: 0, y: 16, duration: 0.9, ease: 'power3.out' })
      .from('.hero-title', { opacity: 0, y: 40, duration: 1.1, ease: 'power3.out' }, '-=0.5')
      .from('.hero-sub',   { opacity: 0, y: 20, duration: 0.9, ease: 'power3.out' }, '-=0.6')
      .from('.hero-cta',   { opacity: 0, y: 16, duration: 0.8, ease: 'power3.out' }, '-=0.5')
      .from('.hero-scroll',{ opacity: 0, duration: 1, ease: 'power2.out' }, '-=0.2');
  }

  /* ══════════════════════════════════════
     GSAP SCROLL REVEALS
  ══════════════════════════════════════ */
  if (!spark_cfg.reducedMotion) {
    gsap.utils.toArray('.reveal-item').forEach(function (el) {
      gsap.from(el, {
        opacity: 0,
        y: 28,
        duration: 0.85,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 87%',
          once: true
        }
      });
    });

    /* Staggered process steps */
    gsap.utils.toArray('.process-step').forEach(function (step, i) {
      gsap.from(step, {
        opacity: 0,
        x: -18,
        duration: 0.75,
        ease: 'power2.out',
        delay: i * 0.06,
        scrollTrigger: {
          trigger: step,
          start: 'top 88%',
          once: true
        }
      });
    });

    /* Fragment items depth reveal */
    gsap.utils.toArray('.frag-item').forEach(function (item) {
      gsap.from(item, {
        opacity: 0,
        y: 35,
        duration: 0.95,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          once: true
        }
      });
    });

    /* Scent orb parallax on frag items */
    gsap.utils.toArray('.frag-visual').forEach(function (vis) {
      gsap.to(vis, {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: {
          trigger: vis,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5
        }
      });
    });

    /* Collection header large title slight parallax */
    gsap.to('.collection-title', {
      yPercent: -8,
      ease: 'none',
      scrollTrigger: {
        trigger: '.collection-header',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5
      }
    });
  }

  /* ══════════════════════════════════════
     COLLECTION ITEM · HOVER ACCENT
  ══════════════════════════════════════ */
  gsap.utils.toArray('.frag-item').forEach(function (item) {
    const nameEl = item.querySelector('.frag-name');
    if (!nameEl) return;

    item.addEventListener('mouseenter', function () {
      if (spark_cfg.reducedMotion) return;
      gsap.to(nameEl, {
        color: '#c8a564',
        duration: 0.35,
        ease: 'power2.out'
      });
    });

    item.addEventListener('mouseleave', function () {
      if (spark_cfg.reducedMotion) return;
      gsap.to(nameEl, {
        color: '#e2dace',
        duration: 0.4,
        ease: 'power2.out'
      });
    });
  });

  /* ══════════════════════════════════════
     RESERVE FORM SUBMISSION
  ══════════════════════════════════════ */
  const spark_form = document.querySelector('.reserve-form');

  if (spark_form) {
    spark_form.addEventListener('submit', function (e) {
      e.preventDefault();

      const requiredFields = spark_form.querySelectorAll('[required]');
      let isValid = true;

      requiredFields.forEach(function (field) {
        if (!field.value.trim()) {
          field.classList.add('error');
          isValid = false;
        } else {
          field.classList.remove('error');
        }
      });

      if (!isValid) return;

      const wrap = document.querySelector('.reserve-form-wrap');
      if (!wrap) return;

      wrap.innerHTML = '<div class="form-success" role="status" aria-live="polite"><p>예약 신청이 완료되었습니다.</p><p>48시간 내에 이메일로 확인을 보내드리겠습니다.</p></div>';

      if (!spark_cfg.reducedMotion) {
        gsap.from(wrap.querySelector('.form-success'), {
          opacity: 0,
          y: 16,
          duration: 0.6,
          ease: 'power2.out'
        });
      }
    });

    /* Clear error on input */
    spark_form.querySelectorAll('.form-input').forEach(function (input) {
      input.addEventListener('input', function () {
        input.classList.remove('error');
      });
    });
  }

})();
