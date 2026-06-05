/* torim — script.js */
(function () {
  'use strict';

  /* ============================================================
     HERO BACKGROUND CANVAS
     Pixel-aligned grid with intersection dots — data-viz texture
  ============================================================ */
  var heroBg = document.querySelector('.hero__bg-canvas');
  if (heroBg) {
    var bgCtx = heroBg.getContext('2d');
    var GRID = 32;

    function resizeBg() {
      heroBg.width  = heroBg.offsetWidth;
      heroBg.height = heroBg.offsetHeight;
      drawBg();
    }

    function drawBg() {
      var W = heroBg.width;
      var H = heroBg.height;
      bgCtx.clearRect(0, 0, W, H);

      /* Grid lines */
      bgCtx.strokeStyle = 'rgba(26,22,18,0.055)';
      bgCtx.lineWidth   = 0.5;
      for (var x = 0; x <= W; x += GRID) {
        bgCtx.beginPath();
        bgCtx.moveTo(x, 0);
        bgCtx.lineTo(x, H);
        bgCtx.stroke();
      }
      for (var y = 0; y <= H; y += GRID) {
        bgCtx.beginPath();
        bgCtx.moveTo(0, y);
        bgCtx.lineTo(W, y);
        bgCtx.stroke();
      }

      /* Intersection dots — density encodes Fitts' proximity
         (denser near top-left where the main brand cell lives) */
      var cx = W * 0.3;
      var cy = H * 0.35;
      for (var gx = 0; gx <= W; gx += GRID) {
        for (var gy = 0; gy <= H; gy += GRID) {
          var dist = Math.sqrt((gx - cx) * (gx - cx) + (gy - cy) * (gy - cy));
          var maxD = Math.sqrt(W * W + H * H) * 0.5;
          /* closer dots are more opaque */
          var alpha = 0.5 - (dist / maxD) * 0.42;
          if (alpha < 0.06) alpha = 0.06;
          bgCtx.fillStyle = 'rgba(139,94,60,' + alpha + ')';
          bgCtx.beginPath();
          bgCtx.arc(gx, gy, 1.3, 0, Math.PI * 2);
          bgCtx.fill();
        }
      }
    }

    var bgTimer;
    window.addEventListener('resize', function () {
      clearTimeout(bgTimer);
      bgTimer = setTimeout(resizeBg, 120);
    });
    resizeBg();
  }

  /* ============================================================
     FITTS CANVAS
     Concentric distance rings + target points
     Metaphor:손이 흙에 가까울수록 형태가 정확해진다
  ============================================================ */
  var fittsEl = document.querySelector('.fitts__canvas');
  if (fittsEl) {
    var fCtx = fittsEl.getContext('2d');

    function drawFitts() {
      var W = fittsEl.width  = fittsEl.offsetWidth;
      var H = fittsEl.height = fittsEl.offsetHeight;
      fCtx.clearRect(0, 0, W, H);

      var cx  = W * 0.38;
      var cy  = H * 0.46;
      var maxR = Math.min(W, H) * 0.88;

      /* Concentric rings */
      var RINGS = 7;
      for (var i = RINGS; i >= 1; i--) {
        var r   = (i / RINGS) * maxR;
        var alp = 0.06 + (RINGS - i) * 0.038;
        fCtx.strokeStyle = 'rgba(245,237,224,' + alp + ')';
        fCtx.lineWidth   = 0.6;
        fCtx.beginPath();
        fCtx.arc(cx, cy, r, 0, Math.PI * 2);
        fCtx.stroke();
      }

      /* Primary target — centre dot */
      fCtx.fillStyle = 'rgba(196,149,106,0.95)';
      fCtx.beginPath();
      fCtx.arc(cx, cy, 5, 0, Math.PI * 2);
      fCtx.fill();

      /* Secondary targets at varying distances */
      var targets = [
        { dx:  0.28, dy: -0.32, r: 3.5, label: '형태' },
        { dx: -0.34, dy:  0.22, r: 3.5, label: '유약' },
        { dx:  0.52, dy:  0.38, r: 2.2, label: '불'   },
        { dx: -0.48, dy: -0.24, r: 2.2, label: '흙'   },
        { dx:  0.12, dy:  0.55, r: 1.8, label: '물'   },
      ];

      targets.forEach(function (t) {
        var tx = cx + t.dx * maxR;
        var ty = cy + t.dy * maxR;

        /* Dashed spoke */
        fCtx.strokeStyle = 'rgba(245,237,224,0.16)';
        fCtx.lineWidth   = 0.6;
        fCtx.setLineDash([2, 6]);
        fCtx.beginPath();
        fCtx.moveTo(cx, cy);
        fCtx.lineTo(tx, ty);
        fCtx.stroke();
        fCtx.setLineDash([]);

        /* Target dot */
        fCtx.fillStyle = 'rgba(158,152,144,0.78)';
        fCtx.beginPath();
        fCtx.arc(tx, ty, t.r, 0, Math.PI * 2);
        fCtx.fill();

        /* Label */
        fCtx.fillStyle = 'rgba(245,237,224,0.44)';
        fCtx.font      = '11px "Noto Sans KR", sans-serif';
        fCtx.fillText(t.label, tx + 7, ty + 4);
      });
    }

    var fittsTimer;
    window.addEventListener('resize', function () {
      clearTimeout(fittsTimer);
      fittsTimer = setTimeout(drawFitts, 120);
    });
    setTimeout(drawFitts, 80);
  }

  /* ============================================================
     REVEAL ON SCROLL
  ============================================================ */
  var revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length) {
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });

      revealEls.forEach(function (el) { observer.observe(el); });
    } else {
      /* Fallback: show everything */
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }
  }

  /* Stagger timeline items */
  document.querySelectorAll('.timeline__item').forEach(function (el, i) {
    el.style.transitionDelay = (i * 0.07) + 's';
  });

  /* Stagger process steps */
  document.querySelectorAll('.process__step').forEach(function (el, i) {
    el.style.transitionDelay = (i * 0.08) + 's';
  });

  /* Stagger class cards */
  document.querySelectorAll('.class__card').forEach(function (el, i) {
    el.style.transitionDelay = (i * 0.09) + 's';
  });

  /* ============================================================
     GALLERY — subtle parallax distortion on mouse move
     (transform only, no top/left/filter — FLOOR compliant)
  ============================================================ */
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReduced) {
    document.querySelectorAll('.gallery__item').forEach(function (item) {
      var imgWrap = item.querySelector('.gallery__img');
      if (!imgWrap) return;

      item.addEventListener('mousemove', function (e) {
        var rect = item.getBoundingClientRect();
        var nx   = (e.clientX - rect.left)  / rect.width  - 0.5;
        var ny   = (e.clientY - rect.top)   / rect.height - 0.5;
        imgWrap.style.transform = 'scale(1.05) translate(' + (nx * 7) + 'px,' + (ny * 7) + 'px)';
      });

      item.addEventListener('mouseleave', function () {
        imgWrap.style.transform = '';
      });
    });
  }

  /* ============================================================
     NAV TOGGLE (mobile)
  ============================================================ */
  var toggle = document.querySelector('.nav__toggle');
  var menu   = document.querySelector('.nav__menu');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');

      var svg = toggle.querySelector('svg');
      if (isOpen) {
        svg.innerHTML =
          '<line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
          '<line x1="20" y1="4" x2="4" y2="20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>';
      } else {
        svg.innerHTML =
          '<line x1="3" y1="7" x2="21" y2="7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
          '<line x1="3" y1="17" x2="21" y2="17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>';
      }
    });

    /* Close on link click */
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', '메뉴 열기');
      });
    });

    /* Close on Escape */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', '메뉴 열기');
        toggle.focus();
      }
    });
  }

})();
