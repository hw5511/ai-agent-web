/* ============================================================
   GROOVE 회현 — script.js
   SPARK: 인터랙티브 타이포 해체 (DARING_MOVE) + 심해 노이즈 + Lenis
   ============================================================ */

/* 전역 네임스페이스 접두사: spark_ */

(function () {
  'use strict';

  /* ── 라이브러리 로드 완료 후 실행 ── */
  function spark_init() {

    /* ── 0. 라이브러리 가드 ── */
    if (typeof gsap === 'undefined' || typeof Lenis === 'undefined') {
      /* 폴백: 300ms 후 재시도 (스크립트 로드 순서 경합) */
      setTimeout(spark_init, 300);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    /* ── 1. Lenis 스무스 스크롤 ── */
    const spark_lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    spark_lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      spark_lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    /* ── 2. 배경 노이즈 캔버스 ── */
    const spark_noiseCanvas = document.getElementById('spark_noise_canvas');
    if (spark_noiseCanvas) {
      const spark_noiseCtx = spark_noiseCanvas.getContext('2d');

      function spark_resizeNoise() {
        spark_noiseCanvas.width  = window.innerWidth;
        spark_noiseCanvas.height = window.innerHeight;
      }
      spark_resizeNoise();

      function spark_drawNoise() {
        const w = spark_noiseCanvas.width;
        const h = spark_noiseCanvas.height;
        const imageData = spark_noiseCtx.createImageData(w, h);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const v = Math.random() * 255 | 0;
          data[i]     = v;
          data[i + 1] = v;
          data[i + 2] = v;
          data[i + 3] = 255;
        }
        spark_noiseCtx.putImageData(imageData, 0, 0);
      }

      /* 노이즈는 정적 1회 렌더 (60fps 재실행 시 부하) */
      spark_drawNoise();

      let spark_noiseResizeTimer = null;
      window.addEventListener('resize', () => {
        clearTimeout(spark_noiseResizeTimer);
        spark_noiseResizeTimer = setTimeout(() => {
          spark_resizeNoise();
          spark_drawNoise();
        }, 200);
      });
    }

    /* ── 3. 커서 빛 추적 (transform만, blur 없음) ── */
    const spark_cursorLight = document.getElementById('spark_cursor_light');
    if (spark_cursorLight) {
      let spark_mouseX = window.innerWidth / 2;
      let spark_mouseY = window.innerHeight / 2;
      let spark_lightX = spark_mouseX;
      let spark_lightY = spark_mouseY;

      window.addEventListener('mousemove', (e) => {
        spark_mouseX = e.clientX;
        spark_mouseY = e.clientY;
      });

      /* 빛은 커서보다 살짝 느리게 따라감 */
      function spark_lightLoop() {
        spark_lightX += (spark_mouseX - spark_lightX) * 0.06;
        spark_lightY += (spark_mouseY - spark_lightY) * 0.06;
        spark_cursorLight.style.transform =
          `translate(calc(${spark_lightX}px - 50%), calc(${spark_lightY}px - 50%))`;
        requestAnimationFrame(spark_lightLoop);
      }
      spark_lightLoop();
    }

    /* ── 4. DARING_MOVE: 인터랙티브 타이포 글자 반발 ── */
    const spark_titleChars = document.querySelectorAll('.t-char');

    if (spark_titleChars.length > 0) {
      /* 각 글자별 quickTo setter */
      const spark_charSetters = Array.from(spark_titleChars).map((el) => ({
        el,
        setTX: gsap.quickTo(el, '--tx', { duration: 0.6, ease: 'power3.out' }),
        setTY: gsap.quickTo(el, '--ty', { duration: 0.6, ease: 'power3.out' }),
        setRot: gsap.quickTo(el, '--rot', { duration: 0.8, ease: 'elastic.out(1, 0.4)' }),
      }));

      const spark_repelRadius = 220; /* 반발 반경 px */
      const spark_repelStrength = 80; /* 최대 이동 px */

      function spark_applyRepel(mouseX, mouseY) {
        spark_charSetters.forEach(({ el, setTX, setTY, setRot }) => {
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top  + rect.height / 2;
          const dx = mouseX - cx;
          const dy = mouseY - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < spark_repelRadius && dist > 0) {
            const force = (1 - dist / spark_repelRadius) * spark_repelStrength;
            const nx = -(dx / dist) * force;
            const ny = -(dy / dist) * force;
            const rot = nx * 0.12; /* 반발 방향에 따라 회전 */
            setTX(nx + 'px');
            setTY(ny + 'px');
            setRot(rot + 'deg');
          } else {
            setTX('0px');
            setTY('0px');
            setRot('0deg');
          }
        });
      }

      window.addEventListener('mousemove', (e) => {
        spark_applyRepel(e.clientX, e.clientY);
      });

      /* 터치: 탭 위치 반발 후 복귀 */
      window.addEventListener('touchmove', (e) => {
        const t = e.touches[0];
        spark_applyRepel(t.clientX, t.clientY);
      }, { passive: true });

      window.addEventListener('touchend', () => {
        spark_charSetters.forEach(({ setTX, setTY, setRot }) => {
          setTX('0px');
          setTY('0px');
          setRot('0deg');
        });
      });
    }

    /* ── 5. 섹션 클립패스 Reveal (안티-디자인 비선형) ── */
    const spark_revealEls = document.querySelectorAll(
      '.m-quote, .m-body, .m-label, .visit-eyebrow, .visit-address, .visit-hours, .visit-cta-label, .visit-cta-link, .visit-instagram, .footer-mark, .footer-sub, .picks-label'
    );

    spark_revealEls.forEach((el) => {
      el.classList.add('spark-reveal');

      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      });
    });

    /* 앨범 아이템 — 각자 다른 방향에서 진입 (Anti-Design) */
    const spark_pickItems = document.querySelectorAll('.pick-item');
    const spark_pickDirections = [
      { x: -40, y: 20 },
      { x: 30,  y: 40 },
      { x: -20, y: 50 },
      { x: 50,  y: 10 },
    ];

    spark_pickItems.forEach((item, idx) => {
      const dir = spark_pickDirections[idx] || { x: 0, y: 30 };
      gsap.fromTo(
        item,
        { opacity: 0, x: dir.x, y: dir.y + 20 },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          delay: idx * 0.12,
        }
      );
    });

    /* ── 6. 흐르는 사선 텍스트 — 스크롤 시차 ── */
    const spark_scrollText = document.querySelector('.picks-scroll-text');
    if (spark_scrollText) {
      gsap.to(spark_scrollText, {
        x: '-25%',
        ease: 'none',
        scrollTrigger: {
          trigger: '.s-picks',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }

    /* ── 7. 매니페스토 인용 — clipPath 수평 reveal ── */
    const spark_mQuote = document.querySelector('.m-quote');
    if (spark_mQuote) {
      gsap.fromTo(
        spark_mQuote,
        { clipPath: 'inset(0 100% 0 0)', opacity: 1, y: 0 },
        {
          clipPath: 'inset(0 0% 0 0)',
          duration: 1.2,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: spark_mQuote,
            start: 'top 82%',
            toggleActions: 'play none none none',
          },
        }
      );
      /* spark-reveal과 중복 방지 — 이미 처리됨 */
      spark_mQuote.classList.remove('spark-reveal');
      gsap.set(spark_mQuote, { opacity: 1, y: 0 });
    }

    /* ── 8. 타이틀 초기 등장 (페이지 로드) ── */
    const spark_grooveChars = document.querySelectorAll('.title-line--groove .t-char');
    const spark_koreaChars  = document.querySelectorAll('.title-line--hoehyeon .t-char');

    gsap.fromTo(
      spark_grooveChars,
      { opacity: 0, y: 60, rotateX: -25 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        stagger: 0.06,
        duration: 1.0,
        ease: 'power4.out',
        delay: 0.2,
      }
    );

    gsap.fromTo(
      spark_koreaChars,
      { opacity: 0, x: -30 },
      {
        opacity: 1,
        x: 0,
        stagger: 0.12,
        duration: 0.9,
        ease: 'power3.out',
        delay: 0.7,
      }
    );

    gsap.fromTo(
      ['.tagline', '.title-genre-bar'],
      { opacity: 0 },
      {
        opacity: 1,
        stagger: 0.2,
        duration: 0.8,
        ease: 'power2.out',
        delay: 1.1,
      }
    );

  } /* end spark_init */

  /* DOMContentLoaded 후 실행 */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', spark_init);
  } else {
    spark_init();
  }

})();
