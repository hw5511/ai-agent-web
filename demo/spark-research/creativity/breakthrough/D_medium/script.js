(function () {
  'use strict';

  /* =====================================================
     이안(夷安) · 별자리 탐색 인터랙션
     v5-D: INTERACTION IS THE MEDIUM
     ===================================================== */

  // === 상수 =============================================
  const spark_FIELD_SEED = 8734; // 별 배경 고정 시드

  // 별 노드 데이터 (데스크톱 / 모바일 위치, %)
  const spark_STARS = [
    { id: 'about',   xD: 26, yD: 33, xM: 22, yM: 54 },
    { id: 'night',   xD: 63, yD: 23, xM: 58, yM: 43 },
    { id: 'program', xD: 78, yD: 59, xM: 78, yM: 64 },
    { id: 'access',  xD: 44, yD: 73, xM: 48, yM: 77 },
    { id: 'reserve', xD: 19, yD: 63, xM: 18, yM: 70 },
  ];

  // 별자리 연결 엣지 (인덱스 쌍)
  const spark_EDGES = [[0,1],[1,2],[2,3],[3,4],[4,0],[0,2]];

  // === 상태 =============================================
  let spark_visitedSet     = new Set();
  let spark_activePanel    = null;
  let spark_hoveredIdx     = -1;
  let spark_completionShown = false;
  let spark_lenis          = null;
  let spark_resizeTimer    = null;

  // === DOM 참조 =========================================
  const spark_bgCanvas     = document.getElementById('bg-canvas');
  const spark_fgCanvas     = document.getElementById('fg-canvas');
  const spark_bgCtx        = spark_bgCanvas.getContext('2d');
  const spark_fgCtx        = spark_fgCanvas.getContext('2d');
  const spark_starNodes     = Array.from(document.querySelectorAll('.star-node'));
  const spark_visitDots     = Array.from(document.querySelectorAll('.visit-dot'));
  const spark_hintEl        = document.getElementById('hint-text');
  const spark_completionEl  = document.getElementById('completion-overlay');

  // reduced-motion 체크
  const spark_rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // === SEEDED RANDOM =====================================
  function spark_seeded(seed) {
    let s = seed >>> 0;
    return function () {
      s = (Math.imul(1664525, s) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  // === 별 픽셀 좌표 =====================================
  function spark_pos(star) {
    const mobile = window.innerWidth < 768;
    return {
      x: ((mobile ? star.xM : star.xD) / 100) * window.innerWidth,
      y: ((mobile ? star.yM : star.yD) / 100) * window.innerHeight,
    };
  }

  // === 캔버스 리사이즈 ===================================
  function spark_resize() {
    spark_bgCanvas.width  = spark_fgCanvas.width  = window.innerWidth;
    spark_bgCanvas.height = spark_fgCanvas.height = window.innerHeight;
    spark_drawField();
    spark_drawLines();
    spark_placeNodes();
  }

  // === 별 배경 (seeded) ==================================
  function spark_drawField() {
    const w   = spark_bgCanvas.width;
    const h   = spark_bgCanvas.height;
    const rng = spark_seeded(spark_FIELD_SEED);
    spark_bgCtx.clearRect(0, 0, w, h);

    // 은하수 띠: 부드러운 안개
    const band = spark_bgCtx.createLinearGradient(w * 0.05, 0, w * 0.95, h);
    band.addColorStop(0,    'rgba(70,85,145,0)');
    band.addColorStop(0.3,  'rgba(68,82,142,0.05)');
    band.addColorStop(0.5,  'rgba(78,95,162,0.09)');
    band.addColorStop(0.7,  'rgba(68,82,142,0.05)');
    band.addColorStop(1,    'rgba(70,85,145,0)');
    spark_bgCtx.fillStyle = band;
    spark_bgCtx.fillRect(0, 0, w, h);

    // 극소 별 (배치)
    const tiny = Math.floor((w * h) / 2600);
    spark_bgCtx.beginPath();
    for (let i = 0; i < tiny; i++) {
      const x = rng() * w;
      const y = rng() * h;
      spark_bgCtx.moveTo(x + 0.45, y);
      spark_bgCtx.arc(x, y, 0.45, 0, Math.PI * 2);
    }
    spark_bgCtx.fillStyle = 'rgba(190,200,228,0.20)';
    spark_bgCtx.fill();

    // 소형 별 (배치)
    const small = Math.floor((w * h) / 7200);
    spark_bgCtx.beginPath();
    for (let i = 0; i < small; i++) {
      const x = rng() * w;
      const y = rng() * h;
      spark_bgCtx.moveTo(x + 0.85, y);
      spark_bgCtx.arc(x, y, 0.85, 0, Math.PI * 2);
    }
    spark_bgCtx.fillStyle = 'rgba(212,220,244,0.35)';
    spark_bgCtx.fill();

    // 중형 별 (색상 변화)
    const mid = Math.floor((w * h) / 20000);
    for (let i = 0; i < mid; i++) {
      const x    = rng() * w;
      const y    = rng() * h;
      const r    = 1.05 + rng() * 0.75;
      const a    = 0.42 + rng() * 0.38;
      const warm = rng();
      spark_bgCtx.beginPath();
      spark_bgCtx.arc(x, y, r, 0, Math.PI * 2);
      spark_bgCtx.fillStyle = `rgba(${Math.floor(215 + warm * 25)},${Math.floor(222 - warm * 8)},${Math.floor(244 - warm * 28)},${a})`;
      spark_bgCtx.fill();
    }

    // 밝은 별 + 글로우 헤일로
    const bright = 10 + Math.floor(rng() * 7);
    for (let i = 0; i < bright; i++) {
      const x    = rng() * w;
      const y    = rng() * h;
      const r    = 1.5 + rng() * 1.3;
      const halo = r * 5.5;
      const glow = spark_bgCtx.createRadialGradient(x, y, 0, x, y, halo);
      glow.addColorStop(0,   'rgba(232,236,255,0.80)');
      glow.addColorStop(0.3, 'rgba(200,214,248,0.26)');
      glow.addColorStop(1,   'rgba(155,178,230,0)');
      spark_bgCtx.beginPath();
      spark_bgCtx.arc(x, y, halo, 0, Math.PI * 2);
      spark_bgCtx.fillStyle = glow;
      spark_bgCtx.fill();
      spark_bgCtx.beginPath();
      spark_bgCtx.arc(x, y, r, 0, Math.PI * 2);
      spark_bgCtx.fillStyle = 'rgba(240,244,255,0.92)';
      spark_bgCtx.fill();
    }
  }

  // === 별자리 연결선 =====================================
  function spark_drawLines() {
    const w = spark_fgCanvas.width;
    const h = spark_fgCanvas.height;
    spark_fgCtx.clearRect(0, 0, w, h);
    if (spark_rm) return;

    spark_EDGES.forEach(function (edge) {
      const a = edge[0];
      const b = edge[1];
      const pA        = spark_pos(spark_STARS[a]);
      const pB        = spark_pos(spark_STARS[b]);
      const aVis      = spark_visitedSet.has(a);
      const bVis      = spark_visitedSet.has(b);
      const bothVis   = aVis && bVis;
      const anyHover  = spark_hoveredIdx === a || spark_hoveredIdx === b;

      let alpha, colorStr, lw;
      if (bothVis) {
        alpha     = 0.48;
        colorStr  = '195,168,108';
        lw        = 0.75;
      } else if (anyHover) {
        alpha     = 0.16;
        colorStr  = '150,162,210';
        lw        = 0.45;
      } else {
        alpha     = 0.055;
        colorStr  = '140,152,205';
        lw        = 0.35;
      }

      spark_fgCtx.beginPath();
      spark_fgCtx.moveTo(pA.x, pA.y);
      spark_fgCtx.lineTo(pB.x, pB.y);
      spark_fgCtx.strokeStyle = `rgba(${colorStr},${alpha})`;
      spark_fgCtx.lineWidth   = lw;
      spark_fgCtx.stroke();
    });
  }

  // === 별 노드 DOM 위치 설정 ============================
  function spark_placeNodes() {
    spark_starNodes.forEach(function (node, i) {
      const star   = spark_STARS[i];
      const mobile = window.innerWidth < 768;
      node.style.left = (mobile ? star.xM : star.xD) + '%';
      node.style.top  = (mobile ? star.yM : star.yD) + '%';
    });
  }

  // === GSAP 별 트윙클 (입장 애니 완료 후 시작) ===========
  function spark_initTwinkle() {
    if (spark_rm) return;
    spark_starNodes.forEach(function (node, i) {
      const glyph = node.querySelector('.star-glyph');
      gsap.to(glyph, {
        opacity:  0.52,
        duration: 2.2 + i * 0.5,
        ease:     'sine.inOut',
        repeat:   -1,
        yoyo:     true,
        delay:    2.6 + i * 0.55, // 입장 애니 완료 후 시작
      });
    });
  }

  // === 패널 열기 ========================================
  function spark_openPanel(id, triggerEl) {
    if (spark_activePanel) spark_closePanel(false);

    const panel = document.getElementById('panel-' + id);
    if (!panel) return;

    // hidden 해제
    panel.hidden = false;
    panel.setAttribute('aria-hidden', 'false');

    const idx = spark_STARS.findIndex(function (s) { return s.id === id; });

    if (idx !== -1 && !spark_visitedSet.has(idx)) {
      spark_visitedSet.add(idx);
      triggerEl.classList.add('is-visited');
      triggerEl.setAttribute('aria-pressed', 'true');
      spark_lightDot(idx);
    }

    spark_activePanel = { panel: panel, triggerEl: triggerEl };
    spark_drawLines();

    const inner   = panel.querySelector('.panel-inner');
    const mobile  = window.innerWidth < 768;

    if (!spark_rm) {
      if (mobile) {
        gsap.fromTo(inner,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.48, ease: 'power3.out' }
        );
      } else {
        gsap.fromTo(inner,
          { y: 14, opacity: 0, scale: 0.98 },
          { y: 0, opacity: 1, scale: 1, duration: 0.52, ease: 'power3.out' }
        );
      }
    }

    // 포커스 이동
    const closeBtn = panel.querySelector('.panel-close');
    setTimeout(function () { if (closeBtn) closeBtn.focus(); }, spark_rm ? 0 : 300);

    // 힌트 숨김
    if (spark_hintEl) {
      if (!spark_rm) {
        gsap.to(spark_hintEl, { opacity: 0, duration: 0.8, onComplete: function () {
          spark_hintEl.style.display = 'none';
        }});
      } else {
        spark_hintEl.style.display = 'none';
      }
    }

    // 별자리 완성 체크 (패널 닫을 때 표시)
  }

  // === 패널 닫기 ========================================
  function spark_closePanel(animate) {
    if (animate === undefined) animate = true;
    if (!spark_activePanel) return;

    const panel     = spark_activePanel.panel;
    const triggerEl = spark_activePanel.triggerEl;
    spark_activePanel = null;

    const inner = panel.querySelector('.panel-inner');

    const doClose = function () {
      panel.hidden = true;
      panel.setAttribute('aria-hidden', 'true');
      if (triggerEl) triggerEl.focus();

      // 완성 체크
      if (spark_visitedSet.size === 5 && !spark_completionShown) {
        spark_completionShown = true;
        spark_showCompletion();
      }
    };

    if (animate && !spark_rm) {
      const mobile = window.innerWidth < 768;
      gsap.to(inner,
        {
          y:        mobile ? 24 : 10,
          opacity:  0,
          duration: 0.28,
          ease:     'power2.in',
          onComplete: doClose,
        }
      );
    } else {
      doClose();
    }
  }

  // === 방문 도트 점등 ===================================
  function spark_lightDot(idx) {
    const dot = spark_visitDots[idx];
    if (!dot) return;
    dot.classList.add('is-lit');
  }

  // === 별자리 완성 표시 =================================
  function spark_showCompletion() {
    if (!spark_completionEl) return;
    spark_completionEl.hidden = false;

    if (!spark_rm) {
      gsap.fromTo(spark_completionEl,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 1.6, ease: 'power2.inOut', delay: 0.4 }
      );
    }

    // 클릭으로 닫기
    spark_completionEl.addEventListener('click', function sparkCompletionClick() {
      if (!spark_rm) {
        gsap.to(spark_completionEl, { opacity: 0, duration: 0.8, onComplete: function () {
          spark_completionEl.hidden = true;
        }});
      } else {
        spark_completionEl.hidden = true;
      }
      spark_completionEl.removeEventListener('click', sparkCompletionClick);
    }, { once: true });
  }

  // === 호버 인터랙션 (lb-164 반영) =====================
  function spark_setupHover() {
    if (spark_rm) return;

    spark_starNodes.forEach(function (node, i) {
      const glyph = node.querySelector('.star-glyph');
      const label = node.querySelector('.star-label');

      node.addEventListener('mouseenter', function () {
        spark_hoveredIdx = i;
        spark_drawLines();
        gsap.killTweensOf(glyph);
        gsap.to(glyph, { scale: 2.2, duration: 0.38, ease: 'back.out(2.5)' });
        if (!node.classList.contains('is-visited')) {
          gsap.to(label, { opacity: 0.8, y: 0, duration: 0.28, ease: 'power2.out' });
        }
      });

      node.addEventListener('mouseleave', function () {
        spark_hoveredIdx = -1;
        spark_drawLines();
        gsap.killTweensOf(glyph);
        gsap.to(glyph, { scale: 1, duration: 0.5, ease: 'power3.out' });
        if (!node.classList.contains('is-visited')) {
          gsap.to(label, { opacity: 0, y: 5, duration: 0.28, ease: 'power2.in' });
        }
        // 트윙클 재개
        gsap.to(glyph, {
          opacity:  0.55,
          duration: 2.2 + i * 0.55,
          ease:     'sine.inOut',
          repeat:   -1,
          yoyo:     true,
          delay:    0.3,
        });
      });
    });
  }

  // === 클릭 / 키보드 이벤트 ============================
  function spark_setupClick() {
    spark_starNodes.forEach(function (node) {
      node.addEventListener('click', function () {
        const id = node.dataset.panel;
        if (spark_activePanel && spark_activePanel.panel.id === 'panel-' + id) {
          spark_closePanel();
        } else {
          spark_openPanel(id, node);
        }
      });
    });

    // 패널 닫기 버튼
    document.querySelectorAll('.panel-close').forEach(function (btn) {
      btn.addEventListener('click', function () { spark_closePanel(); });
    });

    // 패널 배경 클릭으로 닫기
    document.querySelectorAll('.panel-backdrop').forEach(function (bd) {
      bd.addEventListener('click', function () { spark_closePanel(); });
    });

    // ESC 키
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && spark_activePanel) spark_closePanel();
    });
  }

  // === LENIS 초기화 =====================================
  function spark_initLenis() {
    if (spark_rm) return;
    if (typeof Lenis === 'undefined') return;

    spark_lenis = new Lenis({
      duration: 1.2,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    });

    if (typeof ScrollTrigger !== 'undefined') {
      spark_lenis.on('scroll', ScrollTrigger.update);
    }

    gsap.ticker.add(function (time) {
      spark_lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  // === reduced-motion 폴백: 모든 패널 노출 ==============
  function spark_applyReducedMotionFallback() {
    // fallback nav 링크 → 패널 직접 열기
    document.querySelectorAll('#fallback-nav a').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const href  = link.getAttribute('href');       // e.g. "#panel-about"
        const panelId = href.replace('#panel-', '');
        const panel = document.getElementById('panel-' + panelId);
        if (!panel) return;

        // 이미 열려있으면 그 패널로 스크롤
        if (!panel.hidden) {
          const top = panel.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: top, left: 0 });
          return;
        }

        // 다른 패널 모두 닫기
        document.querySelectorAll('.panel').forEach(function (p) {
          p.hidden = true;
        });
        panel.hidden = false;
      });
    });
  }

  // === 입장 연출 ========================================
  function spark_entrance() {
    if (spark_rm) return;

    const glyphs = spark_starNodes.map(function (n) { return n.querySelector('.star-glyph'); });

    // 초기 상태 세팅 (깜빡 방지)
    gsap.set('#site-header', { opacity: 0 });
    gsap.set('#hint-text',   { opacity: 0 });
    gsap.set('#visit-tracker', { opacity: 0 });
    glyphs.forEach(function (g) { gsap.set(g, { opacity: 0, scale: 0.4 }); });

    // 별 배경 캔버스 페이드인 (완료 후 CSS animation에 제어권 반환)
    gsap.fromTo('#bg-canvas', { opacity: 0 }, {
      opacity: 1, duration: 2.5, ease: 'power2.out',
      onComplete: function () { gsap.set('#bg-canvas', { clearProps: 'opacity' }); },
    });

    // 헤더
    gsap.to('#site-header', { opacity: 1, duration: 1.8, ease: 'power2.out', delay: 0.6 });

    // 별 노드 순차 등장
    glyphs.forEach(function (g, i) {
      gsap.to(g, {
        opacity: 0.85,
        scale:   1,
        duration: 1.1,
        ease:    'back.out(2)',
        delay:   0.9 + i * 0.18,
      });
    });

    // 힌트
    gsap.to('#hint-text',   { opacity: 1, duration: 1.5, ease: 'power2.out', delay: 2.2 });
    gsap.to('#visit-tracker', { opacity: 1, duration: 1.2, ease: 'power2.out', delay: 2.4 });
  }

  // === 메인 초기화 ======================================
  function spark_init() {
    spark_resize();
    spark_placeNodes();
    spark_entrance();

    if (!spark_rm) {
      spark_initTwinkle();
      spark_setupHover();
    } else {
      spark_applyReducedMotionFallback();
    }

    spark_setupClick();
    spark_initLenis();

    // 리사이즈 디바운스
    window.addEventListener('resize', function () {
      clearTimeout(spark_resizeTimer);
      spark_resizeTimer = setTimeout(function () {
        spark_resize();
        spark_placeNodes();
      }, 160);
    });
  }

  // DOMContentLoaded 대기
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', spark_init);
  } else {
    spark_init();
  }

})();
