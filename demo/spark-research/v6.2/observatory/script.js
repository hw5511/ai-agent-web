/* ============================================================
   이안 夷安 | script.js
   VISUAL_SPARK [lb-077]: 렌즈 메커니즘 (backdrop-filter + mask lerp)
   ============================================================ */
(function () {
  'use strict';

  /* ----------------------------------------------------------
     GSAP + ScrollTrigger 등록
  ---------------------------------------------------------- */
  gsap.registerPlugin(ScrollTrigger);

  /* ----------------------------------------------------------
     Lenis 스무스 스크롤
  ---------------------------------------------------------- */
  const spark_lenis = new Lenis({
    duration: 1.2,
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }
  });

  spark_lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(function (time) { spark_lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  /* ----------------------------------------------------------
     진행 바
  ---------------------------------------------------------- */
  const spark_progressBar = document.getElementById('progressBar');

  spark_lenis.on('scroll', function (e) {
    const pct = (e.scroll / e.limit) * 100;
    spark_progressBar.style.width = pct + '%';
  });

  /* ----------------------------------------------------------
     네비게이션 스크롤 상태
  ---------------------------------------------------------- */
  const spark_siteNav = document.getElementById('siteNav');

  spark_lenis.on('scroll', function (e) {
    if (e.scroll > 80) {
      spark_siteNav.classList.add('nav--scrolled');
    } else {
      spark_siteNav.classList.remove('nav--scrolled');
    }
  });

  /* ----------------------------------------------------------
     Nav 링크: lenis.scrollTo (scrollIntoView 금지)
  ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      spark_lenis.scrollTo(target, { offset: -80, duration: 1.4 });
    });
  });

  /* ----------------------------------------------------------
     히어로 캔버스: 대기층 텍스처 (Seeded, 정적)
  ---------------------------------------------------------- */
  {
    const spark_canvas = document.getElementById('heroCanvas');
    const spark_ctx = spark_canvas.getContext('2d');

    function spark_seededRng(seed) {
      let s = seed >>> 0;
      return function () {
        s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
        s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
        s ^= s >>> 16;
        return (s >>> 0) / 0xFFFFFFFF;
      };
    }

    function spark_drawAtmosphere() {
      const W = spark_canvas.width = spark_canvas.offsetWidth;
      const H = spark_canvas.height = spark_canvas.offsetHeight;

      spark_ctx.clearRect(0, 0, W, H);

      /* 배경 레이디얼 그라디언트: 따뜻한 중심 → 차가운 가장자리 */
      const grad = spark_ctx.createRadialGradient(
        W * 0.28, H * 0.72, 0,
        W * 0.28, H * 0.72, Math.max(W, H) * 0.85
      );
      grad.addColorStop(0,   'rgba(30, 24, 14, 1)');
      grad.addColorStop(0.4, 'rgba(14, 12, 22, 1)');
      grad.addColorStop(1,   'rgba(6, 6, 11, 1)');
      spark_ctx.fillStyle = grad;
      spark_ctx.fillRect(0, 0, W, H);

      /* 대기 밀도 레이어선 (수평 선분, 불규칙 배치 / 파동 아님, 정적) */
      const rng = spark_seededRng(8743);
      spark_ctx.save();

      const lineCount = Math.floor(W / 18);
      spark_ctx.beginPath();
      for (let i = 0; i < lineCount; i++) {
        const y = rng() * H;
        const xStart = rng() * W * 0.18;
        const xEnd = W - rng() * W * 0.18;
        const opacity = rng() * 0.04 + 0.008;
        const lineW = rng() * 0.5 + 0.15;

        spark_ctx.globalAlpha = opacity;
        spark_ctx.strokeStyle = 'rgba(195, 172, 126, 1)';
        spark_ctx.lineWidth = lineW;
        spark_ctx.beginPath();
        spark_ctx.moveTo(xStart, y);
        spark_ctx.lineTo(xEnd, y);
        spark_ctx.stroke();
      }

      /* 미세 사각 산란점 (공기 입자 아님, 대기 굴절 마크) */
      const rng2 = spark_seededRng(9412);
      const dotCount = Math.floor((W * H) / 6800);
      for (let i = 0; i < dotCount; i++) {
        const dx = rng2() * W;
        const dy = rng2() * H;
        const ds = rng2() * 1.2 + 0.2;
        const do_ = rng2() * 0.055 + 0.005;
        spark_ctx.globalAlpha = do_;
        spark_ctx.fillStyle = 'rgba(210, 188, 148, 1)';
        spark_ctx.fillRect(dx, dy, ds, ds);
      }

      spark_ctx.globalAlpha = 1;
      spark_ctx.restore();
    }

    spark_drawAtmosphere();

    let spark_resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(spark_resizeTimer);
      spark_resizeTimer = setTimeout(spark_drawAtmosphere, 160);
    });
  }

  /* ----------------------------------------------------------
     히어로 렌즈 효과
     마우스 커서 위치에서만 선명하게 보이고
     나머지는 backdrop-filter blur + mask로 가림
  ---------------------------------------------------------- */
  {
    const spark_overlay = document.getElementById('heroOverlay');
    const spark_heroEl = document.querySelector('.hero');

    /* 터치 디바이스에서는 오버레이 제거 */
    const spark_isFine = window.matchMedia('(pointer: fine)').matches;
    const spark_prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!spark_isFine || spark_prefersReduced) {
      if (spark_overlay) spark_overlay.remove();
    } else {
      /* 초기 렌즈 위치: 히어로 제목 추정 위치 */
      let spark_lerpX = window.innerWidth  * 0.28;
      let spark_lerpY = window.innerHeight * 0.74;
      let spark_targetX = spark_lerpX;
      let spark_targetY = spark_lerpY;
      let spark_lensR   = 110;
      let spark_targetR = 110;

      document.addEventListener('mousemove', function (e) {
        spark_targetX = e.clientX;
        spark_targetY = e.clientY;
      });

      if (spark_heroEl) {
        spark_heroEl.addEventListener('mouseenter', function () {
          spark_targetR = 160;
        });
        spark_heroEl.addEventListener('mouseleave', function () {
          spark_targetR = 110;
        });
      }

      function spark_lensLoop() {
        spark_lerpX += (spark_targetX - spark_lerpX) * 0.065;
        spark_lerpY += (spark_targetY - spark_lerpY) * 0.065;
        spark_lensR += (spark_targetR - spark_lensR)  * 0.075;

        const r = Math.max(0, spark_lensR);
        const r2 = Math.max(0, r - 2);
        const x = spark_lerpX.toFixed(1);
        const y = spark_lerpY.toFixed(1);

        const mask =
          'radial-gradient(circle ' + r + 'px at ' + x + 'px ' + y + 'px, ' +
          'transparent 0%, transparent ' + r2 + 'px, black ' + r + 'px, black 100%)';

        spark_overlay.style.webkitMaskImage = mask;
        spark_overlay.style.maskImage = mask;

        requestAnimationFrame(spark_lensLoop);
      }

      requestAnimationFrame(spark_lensLoop);
    }
  }

  /* ----------------------------------------------------------
     히어로 콘텐츠 패럴랙스 (스크롤)
  ---------------------------------------------------------- */
  const spark_reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!spark_reducedMotion) {
    gsap.to('#heroContent', {
      y: -55,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });
  }

  /* ----------------------------------------------------------
     섹션 Reveal 애니메이션
  ---------------------------------------------------------- */
  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', function () {
    gsap.utils.toArray('.reveal').forEach(function (el) {
      gsap.from(el, {
        opacity: 0,
        y: 28,
        duration: 0.88,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true
        }
      });
    });
  });

  /* ----------------------------------------------------------
     프로그램 번호 컬러 hover (GSAP 미사용, CSS 처리됨)
     프로그램 엔트리 포커스 키보드 접근성
  ---------------------------------------------------------- */
  document.querySelectorAll('.program-entry').forEach(function (entry) {
    entry.addEventListener('focusin', function () {
      entry.classList.add('program-entry--focus');
    });
    entry.addEventListener('focusout', function () {
      entry.classList.remove('program-entry--focus');
    });
  });

  /* ----------------------------------------------------------
     히어로 진입 시 제목 페이드인 (reduced-motion: no-preference)
  ---------------------------------------------------------- */
  if (!spark_reducedMotion) {
    const spark_heroItems = [
      document.querySelector('.hero-title-ko'),
      document.querySelector('.hero-title-hanja'),
      document.querySelector('.hero-tagline'),
      document.querySelector('.hero-cta')
    ].filter(Boolean);

    gsap.from(spark_heroItems, {
      opacity: 0,
      y: 20,
      duration: 1.1,
      ease: 'power3.out',
      stagger: 0.18,
      delay: 0.3
    });
  }

})();
