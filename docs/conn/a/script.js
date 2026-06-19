/* ============================================================
   GROOVE 회현 · script.js
   강 흐름(Lenis) · 표지석 단계적 공개 · 생체인증식 입수 게이트
   전역 접두사: spark_
   ============================================================ */
(() => {
  'use strict';

  const spark_reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const spark_hasGsap = typeof window.gsap !== 'undefined';
  const spark_hasLenis = typeof window.Lenis !== 'undefined';

  /* ---------- 1. 부드러운 강 흐름 (Lenis) ---------- */
  let spark_lenis = null;
  if (spark_hasLenis && !spark_reduce) {
    spark_lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    if (spark_hasGsap && window.ScrollTrigger) {
      spark_lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => spark_lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const spark_raf = (time) => { spark_lenis.raf(time); requestAnimationFrame(spark_raf); };
      requestAnimationFrame(spark_raf);
    }
  }

  /* ---------- 2. 미니 내비 · Lenis 스크롤 ---------- */
  document.querySelectorAll('.mini-nav a[href^="#"]').forEach((spark_link) => {
    spark_link.addEventListener('click', (e) => {
      const spark_id = spark_link.getAttribute('href');
      const spark_target = document.querySelector(spark_id);
      if (!spark_target) return;
      e.preventDefault();
      if (spark_lenis) spark_lenis.scrollTo(spark_target, { offset: -20 });
      else window.scrollTo({ top: spark_target.getBoundingClientRect().top + window.scrollY - 20, behavior: 'smooth' });
    });
  });

  /* ---------- 3. 강물 수위 진행 레일 ---------- */
  const spark_fill = document.querySelector('[data-current-fill]');
  const spark_updateCurrent = () => {
    const spark_doc = document.documentElement;
    const spark_max = spark_doc.scrollHeight - spark_doc.clientHeight;
    const spark_p = spark_max > 0 ? Math.min(1, (window.scrollY || spark_doc.scrollTop) / spark_max) : 0;
    if (spark_fill) spark_fill.style.transform = `scaleY(${spark_p})`;
  };
  if (spark_lenis) spark_lenis.on('scroll', spark_updateCurrent);
  else window.addEventListener('scroll', spark_updateCurrent, { passive: true });
  spark_updateCurrent();

  /* ---------- 4. 표지석 · 단계적 정보 공개 (accordion) ---------- */
  document.querySelectorAll('[data-wp-toggle]').forEach((spark_btn) => {
    const spark_panel = document.getElementById(spark_btn.getAttribute('aria-controls'));
    spark_btn.addEventListener('click', () => {
      const spark_open = spark_btn.getAttribute('aria-expanded') === 'true';
      spark_btn.setAttribute('aria-expanded', String(!spark_open));
      if (spark_panel) spark_panel.dataset.open = String(!spark_open);
      if (spark_lenis) requestAnimationFrame(() => { setTimeout(() => spark_lenis.resize && spark_lenis.resize(), 480); });
    });
  });

  /* ---------- 5. 생체 인증식 입수 게이트 (누르고 머무르기) ---------- */
  const spark_pad = document.querySelector('[data-gate-pad]');
  const spark_arc = document.querySelector('[data-gate-arc]');
  const spark_label = document.querySelector('[data-gate-label]');
  const spark_hint = document.querySelector('[data-gate-hint]');
  if (spark_pad && spark_arc) {
    const spark_CIRC = 327;            // 2πr (r=52)
    const spark_HOLD = spark_reduce ? 1 : 1100; // ms
    const spark_picks = [
      'Bill Evans · Peace Piece. 재즈 모달 물목으로 흘러갑니다.',
      '山下達郎 · Sparkle. 시티팝 물살이 반짝입니다.',
      '새소년 · 파도. 국내 인디 물가에 닿았습니다.',
      'Antônio Carlos Jobim · Wave. 보사노바의 잔물결.',
      '竹内まりや · Plastic Love. 도시의 밤 한가운데.',
    ];
    let spark_t0 = 0;
    let spark_raf = 0;
    let spark_active = false;
    let spark_done = false;

    const spark_setArc = (p) => { spark_arc.style.strokeDashoffset = String(spark_CIRC * (1 - p)); };

    const spark_tick = () => {
      const spark_p = Math.min(1, (performance.now() - spark_t0) / spark_HOLD);
      spark_setArc(spark_p);
      if (spark_p >= 1) { spark_grant(); return; }
      spark_raf = requestAnimationFrame(spark_tick);
    };

    const spark_grant = () => {
      spark_active = false; spark_done = true;
      cancelAnimationFrame(spark_raf);
      spark_setArc(1);
      spark_pad.dataset.open = 'true';
      const spark_pick = spark_picks[Math.floor(Math.random() * spark_picks.length)];
      if (spark_label) spark_label.textContent = '입수 완료';
      if (spark_hint) spark_hint.textContent = '오늘의 한 장 · ' + spark_pick;
    };

    const spark_start = (e) => {
      if (spark_done) { spark_reset(); return; }
      if (spark_active) return;
      if (e.cancelable) e.preventDefault();
      spark_active = true;
      spark_t0 = performance.now();
      if (spark_label) spark_label.textContent = '담그는 중…';
      spark_raf = requestAnimationFrame(spark_tick);
    };

    const spark_cancel = () => {
      if (!spark_active) return;
      spark_active = false;
      cancelAnimationFrame(spark_raf);
      spark_setArc(0);
      if (spark_label) spark_label.textContent = '발을 담그기';
    };

    const spark_reset = () => {
      spark_done = false; spark_active = false;
      spark_setArc(0);
      spark_pad.dataset.open = 'false';
      if (spark_label) spark_label.textContent = '발을 담그기';
      if (spark_hint) spark_hint.textContent = '버튼을 길게 누르면 오늘의 청음 한 장이 떠오릅니다';
    };

    spark_pad.addEventListener('pointerdown', spark_start);
    spark_pad.addEventListener('pointerup', spark_cancel);
    spark_pad.addEventListener('pointerleave', spark_cancel);
    spark_pad.addEventListener('pointercancel', spark_cancel);
    // 키보드 접근성: Enter/Space 로 즉시 입수
    spark_pad.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (spark_done) spark_reset(); else spark_grant();
      }
    });
  }

  /* ---------- 6. reveal · 스크롤 진입 ---------- */
  const spark_revealTargets = [
    '.ford-copy', '.gate',
    '.reach-index', '.reach-title', '.reach-body', '.reach-facts',
    '.wp-head', '.wp',
    '.listening-fig', '.listening-copy',
    '.fresh-item',
    '.visit-block',
    '.bank-mark', '.bank-line', '.bank-fine',
  ];
  const spark_nodes = [];
  spark_revealTargets.forEach((sel) => document.querySelectorAll(sel).forEach((n) => {
    n.classList.add('reveal'); spark_nodes.push(n);
  }));

  if (spark_reduce || !spark_hasGsap || !window.ScrollTrigger) {
    // 모션 감소 / 라이브러리 부재 · 즉시 가시 상태
    spark_nodes.forEach((n) => { n.style.opacity = '1'; n.style.transform = 'none'; });
  } else {
    document.body.classList.add('is-anim');
    gsap.registerPlugin(ScrollTrigger);
    spark_nodes.forEach((n) => {
      gsap.to(n, {
        opacity: 1, y: 0,
        duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: n, start: 'top 86%' },
      });
    });
    ScrollTrigger.addEventListener('refresh', spark_updateCurrent);
    ScrollTrigger.refresh();
  }
})();
