/* ================================================
   여백 독립서점 :: script.js
   GSAP + ScrollTrigger + Lenis
   ================================================ */

(function () {
  'use strict';

  /* ── 플러그인 등록 ── */
  gsap.registerPlugin(ScrollTrigger);

  /* JS 가용 시 reveal 숨김 활성화 */
  document.documentElement.classList.add('js-ready');

  /* ── reduced-motion 체크 ── */
  const spark_prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Lenis 스무스 스크롤 ── */
  let spark_lenis = null;

  if (!spark_prefersReduced) {
    spark_lenis = new Lenis({
      duration: 1.2,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }
    });

    spark_lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add(function (time) {
      spark_lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }

  /* ── 진행 바 ── */
  const spark_progressFill = document.getElementById('progressFill');

  ScrollTrigger.create({
    trigger: document.body,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: function (self) {
      spark_progressFill.style.width = (self.progress * 100).toFixed(2) + '%';
    }
  });

  /* ── 헤더 투명도 ── */
  const spark_header = document.querySelector('.site-header');
  ScrollTrigger.create({
    start: 'top -80px',
    end: 99999,
    toggleClass: { className: 'scrolled', targets: spark_header }
  });

  /* ══════════════════════════════════
     SURPRISE ::히어로 영문 텍스트
     font-variation-settings 스크롤 반응 (lb-163)
  ══════════════════════════════════ */
  const spark_heroEn = document.getElementById('heroEn');

  if (spark_heroEn && !spark_prefersReduced) {
    ScrollTrigger.create({
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      onUpdate: function (self) {
        const weight = Math.round(400 + self.progress * 400);
        spark_heroEn.style.fontVariationSettings = "'wght' " + weight;
        spark_heroEn.style.opacity = (1 - self.progress * 0.6).toFixed(3);
      }
    });
  }

  /* ── 히어로 캔버스 배경 (Seeded 결정론적 노이즈) ── */
  (function () {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) { return; }

    const ctx = canvas.getContext('2d');
    const SEED = 7742;

    function spark_seededRng(seed) {
      let s = seed;
      return function () {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        return (s >>> 0) / 0xffffffff;
      };
    }

    let spark_dots = [];
    let spark_animId = null;

    function spark_buildDots() {
      const rng = spark_seededRng(SEED);
      spark_dots = [];
      const count = Math.floor((canvas.width * canvas.height) / 12000);

      for (let i = 0; i < count; i++) {
        spark_dots.push({
          x: rng() * canvas.width,
          y: rng() * canvas.height,
          r: rng() * 1.2 + 0.3,
          a: rng() * 0.18 + 0.04,
          dx: (rng() - 0.5) * 0.12,
          dy: (rng() - 0.5) * 0.12
        });
      }
    }

    function spark_resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      spark_buildDots();
    }

    function spark_draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();

      const len = spark_dots.length;
      for (let i = 0; i < len; i++) {
        const d = spark_dots[i];
        d.x += d.dx;
        d.y += d.dy;
        if (d.x < 0) { d.x = canvas.width; }
        if (d.x > canvas.width) { d.x = 0; }
        if (d.y < 0) { d.y = canvas.height; }
        if (d.y > canvas.height) { d.y = 0; }
        ctx.moveTo(d.x + d.r, d.y);
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      }

      ctx.fillStyle = 'oklch(46% 0.018 78 / 0.22)';
      ctx.fill();

      spark_animId = requestAnimationFrame(spark_draw);
    }

    if (!spark_prefersReduced) {
      spark_resize();
      spark_draw();
      window.addEventListener('resize', spark_resize, { passive: true });
    }
  })();

  /* ══════════════════════════════════
     Reveal 애니메이션 (스크롤 진입)
     ::단계적 정보 공개 (lb-189)
  ══════════════════════════════════ */
  if (!spark_prefersReduced) {
    const spark_reveals = document.querySelectorAll('.reveal');

    spark_reveals.forEach(function (el, idx) {
      const delay = el.dataset.index ? (parseInt(el.dataset.index, 10) - 1) * 0.1 : 0;

      gsap.fromTo(
        el,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: 'power3.out',
          delay: delay,
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true
          }
        }
      );
    });
  } else {
    /* reduced-motion: 모든 reveal 요소 즉시 가시 상태 */
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  /* ── 네비 링크 스크롤 (Lenis.scrollTo) ── */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (!target) { return; }
      e.preventDefault();
      if (spark_lenis) {
        spark_lenis.scrollTo(target, { offset: -80, duration: 1.4 });
      } else {
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: top });
      }
    });
  });

})();
