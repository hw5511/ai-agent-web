(() => {
  'use strict';

  const spark_reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Lenis smooth scroll (+ GSAP sync) ---------- */
  let spark_lenis = null;
  if (!spark_reduce && window.Lenis) {
    spark_lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      spark_lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => spark_lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const spark_raf = (t) => { spark_lenis.raf(t); requestAnimationFrame(spark_raf); };
      requestAnimationFrame(spark_raf);
    }
  }

  /* ---------- 앵커 점프 (scrollIntoView 금지 → lenis.scrollTo) ---------- */
  const spark_jumpers = document.querySelectorAll('[data-jump]');
  spark_jumpers.forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id.charAt(0) !== '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (spark_lenis) spark_lenis.scrollTo(target, { offset: -70 });
      else target.scrollTo ? window.scrollTo(0, target.offsetTop - 70) : null;
    });
  });

  /* ---------- Scroll reveal (transform/opacity only) ---------- */
  const spark_revealTargets = [
    '.manifesto__title', '.manifesto__body',
    '.crates__head', '.crate',
    '.booth__text', '.booth__photo',
    '.fresh__log', '.fresh__sub',
    '.visit__grid',
  ];
  const spark_revealEls = [];
  spark_revealTargets.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => spark_revealEls.push(el));
  });

  if (spark_reduce) {
    spark_revealEls.forEach((el) => el.classList.add('in'));
  } else if (window.gsap && window.ScrollTrigger) {
    spark_revealEls.forEach((el) => el.classList.add('reveal'));
    gsap.utils.toArray(spark_revealEls).forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 86%',
        onEnter: () => el.classList.add('in'),
      });
    });
  } else {
    const spark_io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); spark_io.unobserve(en.target); } });
    }, { threshold: 0.15 });
    spark_revealEls.forEach((el) => { el.classList.add('reveal'); spark_io.observe(el); });
  }

  /* ---------- 인트로 LP 플래터 회전 (스크롤 연동, transform만) ---------- */
  const spark_platter = document.querySelector('.deck__platter');
  if (spark_platter && !spark_reduce && window.gsap) {
    gsap.to(spark_platter, {
      rotate: 360,
      ease: 'none',
      scrollTrigger: {
        trigger: '.intro',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    });
  }

  /* ---------- 게이미피케이션: 크레이트 디깅 루프 ---------- */
  const spark_crates = Array.from(document.querySelectorAll('[data-crate]'));
  const spark_stampsBox = document.getElementById('digStamps');
  const spark_countEl = document.getElementById('digCount');
  const spark_doneEl = document.getElementById('cratesDone');
  const spark_dug = new Set();
  const ui_total = spark_crates.length;

  // 진행도 스탬프 생성
  if (spark_stampsBox) {
    for (let i = 0; i < ui_total; i += 1) {
      const dot = document.createElement('i');
      spark_stampsBox.appendChild(dot);
    }
  }
  const spark_stampNodes = spark_stampsBox ? Array.from(spark_stampsBox.children) : [];

  const ui_updateProgress = () => {
    const n = spark_dug.size;
    if (spark_countEl) spark_countEl.textContent = String(n);
    spark_stampNodes.forEach((dot, i) => dot.classList.toggle('on', i < n));
    if (n >= ui_total && spark_doneEl) {
      spark_doneEl.hidden = false;
      if (!spark_reduce && window.gsap) {
        gsap.fromTo(spark_doneEl, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
      }
    }
  };

  const ui_toggleCrate = (crate) => {
    const flipped = crate.classList.toggle('flipped');
    crate.setAttribute('aria-pressed', flipped ? 'true' : 'false');
    if (flipped) {
      const idx = spark_crates.indexOf(crate);
      if (!spark_dug.has(idx)) {
        spark_dug.add(idx);
        ui_updateProgress();
      }
    }
  };

  spark_crates.forEach((crate) => {
    crate.addEventListener('click', () => ui_toggleCrate(crate));
    crate.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        ui_toggleCrate(crate);
      }
    });
  });

  ui_updateProgress();

})();
