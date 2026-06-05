/* =========================================
   NOCTURNE -- script.js
   CHOSEN_SPARK: lb-163 가변 폰트의 유연성
   Variable font-weight reacts to mouse -- letters breathe like scent
   ========================================= */
(function () {
  'use strict';

  const spark_prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Progress bar ────────────────────────── */
  const spark_bar = document.getElementById('progress-bar');

  function spark_updateProgress() {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    spark_bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0).toFixed(2) + '%';
  }

  /* ── Lenis ───────────────────────────────── */
  let spark_lenis;

  if (!spark_prefersReduced) {
    spark_lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    });

    spark_lenis.on('scroll', () => {
      spark_updateProgress();
      ScrollTrigger.update();
    });

    gsap.ticker.add((time) => spark_lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    window.addEventListener('scroll', spark_updateProgress, { passive: true });
  }

  /* ── GSAP ────────────────────────────────── */
  gsap.registerPlugin(ScrollTrigger);

  /* ── Nav scroll state ────────────────────── */
  const spark_nav = document.getElementById('nav');

  ScrollTrigger.create({
    start: '80px top',
    onEnter:     () => spark_nav.classList.add('scrolled'),
    onLeaveBack: () => spark_nav.classList.remove('scrolled')
  });

  /* ── Mobile menu ─────────────────────────── */
  const spark_toggle     = document.getElementById('nav-toggle');
  const spark_mobileMenu = document.getElementById('mobile-menu');
  let spark_menuOpen = false;

  function spark_toggleMenu(forceClose) {
    spark_menuOpen = forceClose === true ? false : !spark_menuOpen;
    spark_mobileMenu.classList.toggle('open', spark_menuOpen);
    spark_mobileMenu.setAttribute('aria-hidden', String(!spark_menuOpen));
    spark_toggle.setAttribute('aria-expanded', String(spark_menuOpen));
    spark_toggle.setAttribute('aria-label', spark_menuOpen ? '메뉴 닫기' : '메뉴 열기');
    spark_toggle.classList.toggle('open', spark_menuOpen);
    document.body.style.overflow = spark_menuOpen ? 'hidden' : '';
  }

  spark_toggle.addEventListener('click', () => spark_toggleMenu());

  spark_mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => spark_toggleMenu(true));
  });

  /* ── Hero: variable font weight on mouse ── */
  const spark_chars = document.querySelectorAll('.hero-char');
  const spark_charCount = spark_chars.length;
  const spark_wCurrent = new Float32Array(spark_charCount).fill(300);
  const spark_wTarget  = new Float32Array(spark_charCount).fill(300);

  let spark_mx = window.innerWidth  / 2;
  let spark_my = window.innerHeight / 2;
  let spark_heroSpotX = 50;
  let spark_heroSpotY = 50;
  let spark_heroSpotTX = 50;
  let spark_heroSpotTY = 50;

  const spark_heroEl = document.querySelector('.hero');

  document.addEventListener('mousemove', (e) => {
    spark_mx = e.clientX;
    spark_my = e.clientY;

    spark_heroSpotTX = (spark_mx / window.innerWidth  * 100);
    spark_heroSpotTY = (spark_my / window.innerHeight * 100);

    const maxDist = Math.max(window.innerWidth, window.innerHeight) * 0.5;

    spark_chars.forEach((char, i) => {
      const rect = char.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dist = Math.sqrt((spark_mx - cx) ** 2 + (spark_my - cy) ** 2);
      const norm = Math.max(0, 1 - dist / maxDist);
      spark_wTarget[i] = 300 + norm * 600; /* 300 (far) to 900 (close) -- matches Playfair variable range */
    });
  });

  /* ── RAF loop: lerp weights + spotlight ─── */
  function spark_raf() {
    if (!spark_prefersReduced) {
      spark_heroSpotX += (spark_heroSpotTX - spark_heroSpotX) * 0.055;
      spark_heroSpotY += (spark_heroSpotTY - spark_heroSpotY) * 0.055;

      if (spark_heroEl) {
        spark_heroEl.style.setProperty('--mx', spark_heroSpotX.toFixed(2) + '%');
        spark_heroEl.style.setProperty('--my', spark_heroSpotY.toFixed(2) + '%');
      }

      spark_chars.forEach((char, i) => {
        spark_wCurrent[i] += (spark_wTarget[i] - spark_wCurrent[i]) * 0.07;
        char.style.fontVariationSettings = `"wght" ${Math.round(spark_wCurrent[i])}`;
      });
    }

    requestAnimationFrame(spark_raf);
  }

  spark_raf();

  /* ── Hero entrance animation ─────────────── */
  if (!spark_prefersReduced) {
    const spark_heroSub    = document.querySelector('.hero-sub');
    const spark_heroBottom = document.querySelector('.hero-bottom');
    const spark_heroScroll = document.querySelector('.hero-scroll');

    gsap.set(spark_chars,       { opacity: 0, y: 50 });
    gsap.set(spark_heroSub,     { opacity: 0, y: 14 });
    gsap.set(spark_heroBottom,  { opacity: 0, y: 10 });
    gsap.set(spark_heroScroll,  { opacity: 0 });

    const spark_introTl = gsap.timeline({ delay: 0.25 });
    spark_introTl
      .to(spark_chars, {
        opacity: 1, y: 0,
        duration: 1.0,
        stagger: 0.065,
        ease: 'power3.out'
      })
      .to(spark_heroSub, {
        opacity: 1, y: 0,
        duration: 0.7,
        ease: 'power2.out'
      }, '-=0.4')
      .to(spark_heroBottom, {
        opacity: 1, y: 0,
        duration: 0.7,
        ease: 'power2.out'
      }, '-=0.5')
      .to(spark_heroScroll, {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out'
      }, '-=0.3');
  }

  /* ── Scroll reveals ──────────────────────── */
  document.querySelectorAll('.reveal').forEach(el => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 86%',
      once: true,
      onEnter: () => el.classList.add('visible')
    });
  });

  /* ── Collection image parallax ───────────── */
  if (!spark_prefersReduced) {
    document.querySelectorAll('.citem-media img, .ccard-media img').forEach(img => {
      gsap.to(img, {
        yPercent: -7,
        ease: 'none',
        scrollTrigger: {
          trigger: img.closest('.citem-media, .ccard-media'),
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      });
    });
  }

  /* ── Anchor link smooth scroll ───────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const hash = anchor.getAttribute('href');
      if (hash === '#') return;
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      if (spark_lenis) {
        spark_lenis.scrollTo(target, { offset: -64, duration: 1.2 });
      } else {
        const top = target.getBoundingClientRect().top + window.scrollY - 64;
        window.scrollTo({ top });
      }
    });
  });

})();
