(function () {
  'use strict';

  // ── REDUCED MOTION CHECK ────────────────────────────────────────────
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── CANVAS GRID DISTORTION ──────────────────────────────────────────
  const canvas = document.querySelector('.hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const CELL = 42;
  let W, H, CX, CY, raf, dpr;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    CX = W / 2;
    CY = H / 2;
  }

  function distort(x, y, pull, invSig2) {
    const dx = CX - x;
    const dy = CY - y;
    const d2 = dx * dx + dy * dy;
    const f  = pull * Math.exp(-d2 * invSig2);
    return { x: x + dx * f, y: y + dy * f };
  }

  function drawGrid(t) {
    ctx.clearRect(0, 0, W, H);

    const pull     = 0.48 + 0.10 * Math.sin(t * 0.00052);
    const sigma    = Math.min(W, H) * 0.27;
    const invSig2  = 1 / (2 * sigma * sigma);

    const cols = Math.ceil(W / CELL) + 2;
    const rows = Math.ceil(H / CELL) + 2;
    const ox   = ((W % CELL) / 2) - CELL;
    const oy   = ((H % CELL) / 2) - CELL;

    ctx.strokeStyle = 'rgba(234, 220, 185, 0.14)';
    ctx.lineWidth   = 0.55;
    ctx.lineCap     = 'round';

    // horizontal grid lines
    for (let r = 0; r <= rows; r++) {
      const gy = oy + r * CELL;
      ctx.beginPath();
      for (let c = 0; c <= cols; c++) {
        const gx = ox + c * CELL;
        const p  = distort(gx, gy, pull, invSig2);
        c === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }

    // vertical grid lines
    for (let c = 0; c <= cols; c++) {
      const gx = ox + c * CELL;
      ctx.beginPath();
      for (let r = 0; r <= rows; r++) {
        const gy = oy + r * CELL;
        const p  = distort(gx, gy, pull, invSig2);
        r === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }

    // focal point: soft glow ring
    const glow = ctx.createRadialGradient(CX, CY, 0, CX, CY, 90);
    glow.addColorStop(0,   'rgba(234, 220, 185, 0.16)');
    glow.addColorStop(0.35,'rgba(234, 220, 185, 0.07)');
    glow.addColorStop(1,   'rgba(234, 220, 185, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(CX, CY, 90, 0, Math.PI * 2);
    ctx.fill();

    // crosshair reticle
    ctx.strokeStyle = 'rgba(234, 220, 185, 0.52)';
    ctx.lineWidth   = 0.8;

    const tickLen = 10;

    ctx.beginPath();
    ctx.moveTo(CX - tickLen, CY);
    ctx.lineTo(CX + tickLen, CY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(CX, CY - tickLen);
    ctx.lineTo(CX, CY + tickLen);
    ctx.stroke();

    // outer ring (thin)
    ctx.strokeStyle = 'rgba(234, 220, 185, 0.28)';
    ctx.lineWidth   = 0.6;
    ctx.beginPath();
    ctx.arc(CX, CY, 5.5, 0, Math.PI * 2);
    ctx.stroke();

    // inner dot
    ctx.fillStyle = 'rgba(234, 220, 185, 0.80)';
    ctx.beginPath();
    ctx.arc(CX, CY, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop(t) {
    drawGrid(t);
    raf = requestAnimationFrame(loop);
  }

  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      cancelAnimationFrame(raf);
      resize();
      if (prefersReduced) {
        drawGrid(0);
      } else {
        raf = requestAnimationFrame(loop);
      }
    }, 80);
  });

  resize();

  if (prefersReduced) {
    drawGrid(0);
  } else {
    raf = requestAnimationFrame(loop);
  }

  // ── SCROLL REVEAL ───────────────────────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal');

  if (prefersReduced) {
    revealEls.forEach(function (el) {
      el.classList.add('revealed');
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ── NAV BACKGROUND ON SCROLL ────────────────────────────────────────
  var nav = document.querySelector('.site-nav');
  if (nav) {
    var lastScrollY = 0;
    var ticking = false;

    function updateNav() {
      if (window.scrollY > 60) {
        nav.style.setProperty('background', 'rgba(12, 11, 20, 0.88)');
        nav.style.setProperty('backdrop-filter', 'none');
        nav.style.setProperty('border-bottom', '1px solid rgba(234, 220, 185, 0.08)');
      } else {
        nav.style.setProperty('background', 'transparent');
        nav.style.setProperty('border-bottom', 'none');
      }
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      lastScrollY = window.scrollY;
      if (!ticking) {
        requestAnimationFrame(function () {
          updateNav();
        });
        ticking = true;
      }
    }, { passive: true });
  }
})();
