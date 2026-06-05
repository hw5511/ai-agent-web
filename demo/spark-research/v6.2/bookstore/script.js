(function () {
  'use strict';

  /* ============================================================
     REDUCED MOTION GATE
  ============================================================ */
  const spark_rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     LENIS SMOOTH SCROLL (skip if reduced motion)
  ============================================================ */
  let spark_lenis = null;

  if (!spark_rm) {
    spark_lenis = new Lenis({
      duration: 1.2,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }
    });
    spark_lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { spark_lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ============================================================
     GSAP SCROLLTRIGGER REGISTRATION
  ============================================================ */
  gsap.registerPlugin(ScrollTrigger);

  /* ============================================================
     PROGRESS BAR
  ============================================================ */
  const spark_bar = document.getElementById('spark_progress');
  if (spark_bar) {
    ScrollTrigger.create({
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: function (st) {
        spark_bar.style.width = (st.progress * 100) + '%';
      }
    });
  }

  /* ============================================================
     NAV SHOW / HIDE
  ============================================================ */
  const spark_nav = document.getElementById('spark_nav');
  if (spark_nav) {
    ScrollTrigger.create({
      start: '100px top',
      onEnter:     function () { spark_nav.classList.add('nav-show'); },
      onLeaveBack: function () { spark_nav.classList.remove('nav-show'); }
    });

    spark_nav.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        const spark_target = document.querySelector(a.getAttribute('href'));
        if (!spark_target) return;
        if (spark_lenis) {
          spark_lenis.scrollTo(spark_target, { offset: -56 });
        } else {
          window.scrollTo(0, spark_target.getBoundingClientRect().top + window.scrollY - 56);
        }
      });
    });
  }

  /* ============================================================
     HERO: INITIAL ENTRANCE ANIMATION
  ============================================================ */
  if (!spark_rm) {
    const spark_heroTl = gsap.timeline({ delay: 0.25 });
    spark_heroTl
      .from('.hero-eyebrow', { opacity: 0, y: 14, duration: 0.75, ease: 'power2.out' })
      .from('.hero-h1',      { opacity: 0, y: 28, duration: 0.95, ease: 'power2.out' }, '-=0.45')
      .from('.hero-tagline', { opacity: 0, y: 10, duration: 0.65, ease: 'power2.out' }, '-=0.55')
      .from('.hero-cta',     { opacity: 0, y:  8, duration: 0.55, ease: 'power2.out' }, '-=0.45')
      .from('.hero-mouse-hint', { opacity: 0, duration: 0.5 }, '-=0.25');
  }

  /* ============================================================
     HERO: MOUSE PARALLAX (키네틱 타이포 depth)
     MOTION_INTENSITY = 3 → lerp 매우 작게, 이동량 작게
  ============================================================ */
  if (!spark_rm) {
    const spark_layerBack = document.querySelector('.hero-layer-back');
    const spark_layerMid  = document.querySelector('.hero-layer-mid');

    let spark_mx = 0, spark_my = 0;
    let spark_bx = 0, spark_by = 0;
    let spark_cx = 0, spark_cy = 0;
    let spark_rafId = 0;

    document.addEventListener('mousemove', function (e) {
      spark_mx = (e.clientX / window.innerWidth  - 0.5) * 2;
      spark_my = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    function spark_heroTick() {
      const spark_lr = 0.038;
      spark_bx += (spark_mx * 20 - spark_bx) * spark_lr;
      spark_by += (spark_my * 11 - spark_by) * spark_lr;
      spark_cx += (spark_mx * -7 - spark_cx) * spark_lr;
      spark_cy += (spark_my * -4 - spark_cy) * spark_lr;

      if (spark_layerBack) {
        spark_layerBack.style.transform =
          'translate(' + spark_bx.toFixed(2) + 'px,' + spark_by.toFixed(2) + 'px)';
      }
      if (spark_layerMid) {
        spark_layerMid.style.transform =
          'translate(' + spark_cx.toFixed(2) + 'px,' + spark_cy.toFixed(2) + 'px)';
      }
      spark_rafId = requestAnimationFrame(spark_heroTick);
    }
    spark_heroTick();

    /* ── SCROLL INNOVATION: 히어로 벗어나면 餘白 레이어 페이드 아웃 ── */
    ScrollTrigger.create({
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      onUpdate: function (st) {
        const spark_fade = Math.max(0, 1 - st.progress * 2.2);
        if (spark_layerBack) {
          spark_layerBack.style.opacity = (0.045 * spark_fade).toFixed(3);
        }
      }
    });

    /* 히어로 영역 벗어나면 parallax raf 중지 */
    ScrollTrigger.create({
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      onLeave:    function () { cancelAnimationFrame(spark_rafId); },
      onEnterBack: function () { spark_heroTick(); }
    });
  }

  /* ============================================================
     SECTION REVEALS (스크롤 인 시 opacity + translateY)
  ============================================================ */
  const spark_reveals = document.querySelectorAll('.reveal-el');

  if (!spark_rm) {
    spark_reveals.forEach(function (el) {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true
        }
      });
    });
  } else {
    spark_reveals.forEach(function (el) {
      el.style.opacity   = '1';
      el.style.transform = 'none';
    });
  }

  /* ============================================================
     HERO CTA + SCROLL HINT: smooth scroll to #about
  ============================================================ */
  function spark_scrollTo(selector) {
    const spark_el = document.querySelector(selector);
    if (!spark_el) return;
    if (spark_lenis) {
      spark_lenis.scrollTo(spark_el, { offset: -56 });
    } else {
      window.scrollTo(0, spark_el.getBoundingClientRect().top + window.scrollY - 56);
    }
  }

  const spark_heroCta = document.querySelector('.hero-cta');
  if (spark_heroCta) {
    spark_heroCta.addEventListener('click', function (e) {
      e.preventDefault();
      spark_scrollTo(spark_heroCta.getAttribute('href'));
    });
  }

  const spark_mouseHint = document.querySelector('.hero-mouse-hint');
  if (spark_mouseHint) {
    spark_mouseHint.addEventListener('click', function () {
      spark_scrollTo('#about');
    });
  }

}());
