/* ============================================================
   GROOVE 회현 · script.js
   화로 게이지 / 모루 reveal / 이미지 파동(손길) · transform·opacity only
   ============================================================ */
(() => {
  'use strict';

  const spark_reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const spark_hasGsap = typeof window.gsap !== 'undefined';
  const spark_hasLenis = typeof window.Lenis !== 'undefined';

  /* ---------- Lenis + GSAP ticker ---------- */
  let spark_lenis = null;
  if (spark_hasLenis && spark_hasGsap && !spark_reduce) {
    spark_lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    if (window.ScrollTrigger) spark_lenis.on('scroll', window.ScrollTrigger.update);
    window.gsap.ticker.add((time) => spark_lenis.raf(time * 1000));
    window.gsap.ticker.lagSmoothing(0);
  }

  /* ---------- 부드러운 앵커 이동 (scrollIntoView 금지) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (spark_lenis) spark_lenis.scrollTo(target, { offset: -70 });
      else window.scrollTo({ top: target.offsetTop - 70, behavior: spark_reduce ? 'auto' : 'smooth' });
    });
  });

  /* ---------- 화로 게이지 : 스크롤 진행도 -> 불 높이 + 온도 ---------- */
  const spark_ember = document.querySelector('[data-ember]');
  const spark_temp = document.querySelector('[data-temp]');
  let spark_ticking = false;

  const spark_updateForge = () => {
    spark_ticking = false;
    const doc = document.documentElement;
    const max = (doc.scrollHeight - window.innerHeight) || 1;
    const p = Math.min(1, Math.max(0, window.scrollY / max));
    if (spark_ember) spark_ember.style.transform = `scaleY(${0.06 + p * 0.94})`;
    if (spark_temp) spark_temp.textContent = Math.round(240 + p * 720) + '°';
  };
  const spark_onScroll = () => {
    if (!spark_ticking) { spark_ticking = true; requestAnimationFrame(spark_updateForge); }
  };
  window.addEventListener('scroll', spark_onScroll, { passive: true });
  window.addEventListener('resize', spark_onScroll, { passive: true });
  spark_updateForge();

  /* ---------- 모루 reveal (각 anvil 자식을 순차 노출) ---------- */
  const spark_targets = [];
  document.querySelectorAll('.anvil').forEach((sec) => {
    const kids = sec.querySelectorAll(':scope > *');
    kids.forEach((k) => { k.classList.add('reveal'); spark_targets.push(k); });
  });

  if (spark_reduce) {
    spark_targets.forEach((t) => t.classList.add('is-on'));
  } else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-on'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    spark_targets.forEach((t) => io.observe(t));
  } else {
    spark_targets.forEach((t) => t.classList.add('is-on'));
  }

  /* ---------- 이미지 위에 손을 얹으면 파동이 인다 (INTERACTION_SPARK) ---------- */
  /* 마우스 좌표 -> CSS 변수(--rx/--ry/--on). opacity만 트랜지션, 레이아웃 무영향. */
  document.querySelectorAll('[data-ripple]').forEach((fig) => {
    const glow = fig.querySelector('.rack__glow');
    if (!glow) return;
    let spark_raf = 0;
    let spark_x = 50, spark_y = 50;

    const apply = () => {
      spark_raf = 0;
      glow.style.setProperty('--rx', spark_x + '%');
      glow.style.setProperty('--ry', spark_y + '%');
    };
    fig.addEventListener('pointermove', (e) => {
      const r = fig.getBoundingClientRect();
      spark_x = ((e.clientX - r.left) / r.width) * 100;
      spark_y = ((e.clientY - r.top) / r.height) * 100;
      if (!spark_raf) spark_raf = requestAnimationFrame(apply);
    });
    fig.addEventListener('pointerenter', () => { if (!spark_reduce) glow.style.setProperty('--on', '1'); });
    fig.addEventListener('pointerleave', () => { glow.style.setProperty('--on', '0'); });
  });

  /* ---------- 헤드라인 스파크 링 미세 호흡 (GSAP, transform만) ---------- */
  if (spark_hasGsap && !spark_reduce) {
    const ring = document.querySelector('[data-spark-ring]');
    if (ring) {
      window.gsap.to(ring, {
        rotation: 360, transformOrigin: '60px 32px',
        duration: 18, repeat: -1, ease: 'none',
      });
    }
    const lines = document.querySelectorAll('.hammer__line');
    if (lines.length) {
      window.gsap.from(lines, {
        yPercent: 60, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out', delay: 0.15,
      });
    }
  }
})();
