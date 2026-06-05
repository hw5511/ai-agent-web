/* ============================================================
   NOCTURNE — script.js
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Reduced-motion guard ---------- */
  const spark_reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Wait for DOM ---------- */
  document.addEventListener('DOMContentLoaded', function () {

    gsap.registerPlugin(ScrollTrigger);

    /* ---- Lenis smooth scroll ---- */
    let spark_lenis = null;

    if (!spark_reducedMotion) {
      spark_lenis = new Lenis({
        duration: 1.2,
        easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }
      });

      spark_lenis.on('scroll', ScrollTrigger.update);
      spark_lenis.on('scroll', function (e) {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        const pct = total > 0 ? (e.scroll / total) * 100 : 0;
        const spark_bar = document.getElementById('progressBar');
        if (spark_bar) spark_bar.style.width = pct + '%';
      });

      gsap.ticker.add(function (time) { spark_lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      /* Reduced-motion: native progress bar via window scroll */
      window.addEventListener('scroll', function () {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
        const spark_bar = document.getElementById('progressBar');
        if (spark_bar) spark_bar.style.width = pct + '%';
      }, { passive: true });
    }

    /* ---- Nav scroll state ---- */
    const spark_nav = document.getElementById('mainNav');

    function spark_updateNav () {
      if (window.scrollY > 60) {
        spark_nav.classList.add('nav--scrolled');
      } else {
        spark_nav.classList.remove('nav--scrolled');
      }
    }

    window.addEventListener('scroll', spark_updateNav, { passive: true });
    spark_updateNav();

    /* ---- Mobile menu ---- */
    const spark_menuBtn = document.getElementById('menuBtn');
    const spark_navLinks = document.getElementById('navLinks');
    let spark_menuOpen = false;

    spark_menuBtn.addEventListener('click', function () {
      spark_menuOpen = !spark_menuOpen;
      spark_navLinks.classList.toggle('open', spark_menuOpen);
      spark_menuBtn.setAttribute('aria-expanded', spark_menuOpen ? 'true' : 'false');
      spark_menuBtn.setAttribute('aria-label', spark_menuOpen ? '메뉴 닫기' : '메뉴 열기');
    });

    spark_navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        spark_menuOpen = false;
        spark_navLinks.classList.remove('open');
        spark_menuBtn.setAttribute('aria-expanded', 'false');
        spark_menuBtn.setAttribute('aria-label', '메뉴 열기');
      });
    });

    /* ---- Nav anchor smooth scroll (Lenis) ---- */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return;
        const targetEl = document.querySelector(targetId);
        if (!targetEl) return;
        e.preventDefault();
        if (spark_lenis) {
          spark_lenis.scrollTo(targetEl, { offset: -80, duration: 1.4 });
        } else {
          window.scrollTo({ top: targetEl.offsetTop - 80 });
        }
      });
    });

    /* ============================================================
       HERO CANVAS — Musical Score Waveform
       CHOSEN_SPARK: lb-006 (무게와 탄성) — lerped mouse = inertia
       CONCEPT: Nocturne = 야상곡 (nocturne in music). Lines are
       a score that "plays" under the cursor, radiating sine waves
       with spring-lagged mouse tracking.
       ============================================================ */
    const spark_canvas = document.getElementById('heroCanvas');

    if (spark_canvas && !spark_reducedMotion) {
      const spark_ctx = spark_canvas.getContext('2d');

      /* Lerped (spring-lagged) mouse position — lb-006 inertia */
      let spark_mouseX = window.innerWidth  * 0.5;
      let spark_mouseY = window.innerHeight * 0.6;
      let spark_lerpX  = window.innerWidth  * 0.5;
      let spark_lerpY  = window.innerHeight * 0.6;
      let spark_rafId  = 0;
      let spark_canvasTime = 0;

      function spark_resizeCanvas () {
        const hero = spark_canvas.parentElement;
        spark_canvas.width  = hero.offsetWidth;
        spark_canvas.height = hero.offsetHeight;
      }

      spark_resizeCanvas();

      const spark_resizeObs = new ResizeObserver(spark_resizeCanvas);
      spark_resizeObs.observe(spark_canvas.parentElement);

      document.addEventListener('mousemove', function (e) {
        spark_mouseX = e.clientX;
        spark_mouseY = e.clientY;
      }, { passive: true });

      /* Touch support */
      document.addEventListener('touchmove', function (e) {
        if (e.touches.length > 0) {
          spark_mouseX = e.touches[0].clientX;
          spark_mouseY = e.touches[0].clientY;
        }
      }, { passive: true });

      /* Seeded generation constants (brand consistency, seed=1609) */
      const spark_seed = 1609;
      const spark_linePhaseOffsets = [];
      const spark_lineFreqVariants = [];
      {
        let spark_s = spark_seed;
        for (let i = 0; i < 32; i++) {
          spark_s = (spark_s * 1664525 + 1013904223) & 0xffffffff;
          spark_linePhaseOffsets.push(((spark_s >>> 0) / 0xffffffff) * Math.PI * 2);
          spark_s = (spark_s * 1664525 + 1013904223) & 0xffffffff;
          spark_lineFreqVariants.push(0.85 + ((spark_s >>> 0) / 0xffffffff) * 0.3);
        }
      }

      function spark_drawFrame (timestamp) {
        spark_canvasTime = timestamp * 0.001;

        /* Lerp mouse (spring-lag from lb-006) */
        spark_lerpX += (spark_mouseX - spark_lerpX) * 0.055;
        spark_lerpY += (spark_mouseY - spark_lerpY) * 0.055;

        const { width, height } = spark_canvas;
        spark_ctx.clearRect(0, 0, width, height);

        const numLines  = 26;
        const spacing   = height / (numLines + 1);
        const sigmaX    = width  * 0.3;     /* Gaussian spread in X */
        const sigmaY    = height * 0.22;    /* Y influence radius   */

        for (let i = 0; i < numLines; i++) {
          const baseY    = (i + 1) * spacing;
          const distY    = Math.abs(spark_lerpY - baseY);
          const yInfluence = Math.max(0, 1 - distY / sigmaY);

          /* Staff lines (every 5th) are heavier — musical score aesthetic */
          const isStaff  = (i % 5 === 0);
          const baseAlpha = isStaff ? 0.48 : 0.18;
          const alpha    = Math.min(baseAlpha + yInfluence * 0.38, 0.86);
          const lineW    = isStaff ? 1.4 : 0.7;

          spark_ctx.strokeStyle = `rgba(218, 198, 162, ${alpha})`;
          spark_ctx.lineWidth   = lineW;

          const freq      = 0.0075 * spark_lineFreqVariants[i];
          const phaseBase = spark_canvasTime * 0.75 + spark_linePhaseOffsets[i];

          spark_ctx.beginPath();

          let prevY = 0;
          const step = 3;

          for (let x = 0; x <= width; x += step) {
            /* Gaussian envelope on X — wave localised near cursor */
            const dx = x - spark_lerpX;
            const xInfluence = Math.exp(-(dx * dx) / (sigmaX * sigmaX * 2));
            const amplitude = yInfluence * xInfluence * 44;

            const wave = Math.sin(x * freq + phaseBase) * amplitude;
            const y = baseY + wave;

            if (x === 0) {
              spark_ctx.moveTo(x, y);
            } else {
              spark_ctx.lineTo(x, y);
            }
            prevY = y;
          }

          spark_ctx.stroke();
        }

        spark_rafId = requestAnimationFrame(spark_drawFrame);
      }

      spark_rafId = requestAnimationFrame(spark_drawFrame);

      /* Pause canvas when tab hidden */
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
          cancelAnimationFrame(spark_rafId);
        } else {
          spark_rafId = requestAnimationFrame(spark_drawFrame);
        }
      });
    }

    /* ============================================================
       HERO ENTRANCE ANIMATIONS
       ============================================================ */
    if (!spark_reducedMotion) {
      const spark_heroTl = gsap.timeline({ delay: 0.4 });

      spark_heroTl
        .fromTo('.hero-eyebrow',
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out' }
        )
        .fromTo('.hero-title-en',
          { opacity: 0, y: 55 },
          { opacity: 1, y: 0, duration: 1.1, ease: 'power2.out' },
          '-=0.25'
        )
        .fromTo('.hero-title-kr',
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
          '-=0.55'
        )
        .fromTo('.hero-sub',
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out' },
          '-=0.35'
        )
        .fromTo('.hero-cta',
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
          '-=0.3'
        )
        .fromTo('.hero-score-label span',
          { opacity: 0, x: 12 },
          { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out', stagger: 0.12 },
          '-=0.4'
        )
        .fromTo('.hero-scroll-hint',
          { opacity: 0 },
          { opacity: 1, duration: 0.8 },
          '-=0.2'
        );
    }

    /* ============================================================
       SCROLL REVEAL — generic .reveal elements
       ============================================================ */
    if (!spark_reducedMotion) {
      gsap.utils.toArray('.reveal').forEach(function (el) {
        gsap.fromTo(
          el,
          { opacity: 0, y: 38 },
          {
            opacity: 1,
            y: 0,
            duration: 0.88,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 86%',
              toggleActions: 'play none none none'
            }
          }
        );
      });
    }

    /* ============================================================
       COLLECTION — staggered entrance per perfume item
       lb-006: elastic spring on image reveal
       ============================================================ */
    if (!spark_reducedMotion) {
      gsap.utils.toArray('.perfume-item').forEach(function (item) {
        const isReverse   = item.classList.contains('perfume-item--reverse');
        const spark_imgWrap  = item.querySelector('.perfume-image-wrap');
        const spark_infoWrap = item.querySelector('.perfume-info');

        /* Image — enters from opposite side, elastic spring (lb-006) */
        gsap.fromTo(
          spark_imgWrap,
          { opacity: 0, x: isReverse ? 70 : -70 },
          {
            opacity: 1,
            x: 0,
            duration: 1.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 80%',
              toggleActions: 'play none none none'
            }
          }
        );

        /* Info — slight delay, lighter offset */
        gsap.fromTo(
          spark_infoWrap,
          { opacity: 0, x: isReverse ? -45 : 45 },
          {
            opacity: 1,
            x: 0,
            duration: 1.05,
            delay: 0.18,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 80%',
              toggleActions: 'play none none none'
            }
          }
        );
      });

      /* Image hover spring (lb-006 elastic aftershock) */
      gsap.utils.toArray('.perfume-image-wrap').forEach(function (wrap) {
        wrap.addEventListener('mouseenter', function () {
          gsap.to(wrap.querySelector('img'), {
            scale: 1.05,
            duration: 0.65,
            ease: 'elastic.out(1, 0.55)'
          });
        });
        wrap.addEventListener('mouseleave', function () {
          gsap.to(wrap.querySelector('img'), {
            scale: 1,
            duration: 0.9,
            ease: 'elastic.out(1, 0.45)'
          });
        });
      });
    }

    /* ============================================================
       PROCESS — staggered step reveal
       ============================================================ */
    if (!spark_reducedMotion) {
      gsap.utils.toArray('.process-step').forEach(function (step, i) {
        gsap.fromTo(
          step,
          { opacity: 0, y: 45 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            delay: i * 0.12,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: step,
              start: 'top 88%',
              toggleActions: 'play none none none'
            }
          }
        );
      });

      /* Roman numeral parallax (subtle lb-006 weight feel on scroll) */
      gsap.utils.toArray('.step-roman').forEach(function (num) {
        gsap.fromTo(
          num,
          { y: 20, opacity: 0.3 },
          {
            y: -20,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: num.parentElement,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2
            }
          }
        );
      });
    }

    /* ============================================================
       VISIT SECTION
       ============================================================ */
    /* Form submission */
    const spark_form = document.getElementById('visitForm');
    const spark_notice = document.getElementById('formNotice');

    if (spark_form) {
      spark_form.addEventListener('submit', function (e) {
        e.preventDefault();

        const spark_nameVal  = document.getElementById('visitName').value.trim();
        const spark_emailVal = document.getElementById('visitEmail').value.trim();

        if (!spark_nameVal || !spark_emailVal) {
          spark_notice.textContent = '이름과 이메일을 입력해 주세요.';
          spark_notice.style.color = 'oklch(65% 0.14 20)';
          return;
        }

        spark_notice.textContent = '문의가 접수되었습니다. 곧 답변 드리겠습니다.';
        spark_notice.style.color = 'var(--accent)';
        spark_form.reset();

        if (!spark_reducedMotion) {
          gsap.fromTo(spark_notice, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.4 });
        }
      });
    }

    /* ============================================================
       PHILOSOPHY — large headline character stagger (if not
       reduced-motion). Splits are by word, fallback is full text.
       ============================================================ */
    if (!spark_reducedMotion) {
      const spark_headline = document.querySelector('.philosophy-headline');
      if (spark_headline) {
        /* Headline is already in DOM (progressive enhancement) */
        gsap.fromTo(
          spark_headline,
          { opacity: 0, x: -30 },
          {
            opacity: 1,
            x: 0,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: spark_headline,
              start: 'top 82%',
              toggleActions: 'play none none none'
            }
          }
        );
      }
    }

    /* ============================================================
       COLLECTION HEADER — number reveal
       ============================================================ */
    if (!spark_reducedMotion) {
      gsap.utils.toArray('.perfume-bg-num').forEach(function (bgNum) {
        gsap.fromTo(
          bgNum,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: bgNum.parentElement,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        );
      });
    }

  }); /* end DOMContentLoaded */

})();
