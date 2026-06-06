/* ─────────────────────────────────────────
   HERO 3D TILT
   Only transform changes per frame — perf compliant.
   No blur/shadow/filter on the moving scene layer.
───────────────────────────────────────── */
(function () {
  const hero  = document.getElementById('hero');
  const scene = document.getElementById('heroScene');
  if (!hero || !scene) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let rafId    = null;
  let targetRx = 0, targetRy = 0;
  let curRx    = 0, curRy    = 0;

  function tick() {
    curRx += (targetRx - curRx) * 0.075;
    curRy += (targetRy - curRy) * 0.075;

    scene.style.transform =
      `rotateX(${curRx.toFixed(3)}deg) rotateY(${curRy.toFixed(3)}deg)`;

    const moving =
      Math.abs(targetRx - curRx) > 0.004 ||
      Math.abs(targetRy - curRy) > 0.004;

    if (moving) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
      scene.style.willChange = 'auto';
    }
  }

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const cx   = rect.width  / 2;
    const cy   = rect.height / 2;
    targetRy =  ((e.clientX - rect.left - cx) / cx) * 5.5;
    targetRx = -((e.clientY - rect.top  - cy) / cy) * 3.5;

    if (!rafId) {
      scene.style.willChange = 'transform';
      rafId = requestAnimationFrame(tick);
    }
  });

  hero.addEventListener('mouseleave', () => {
    targetRx = 0;
    targetRy = 0;
    if (!rafId) {
      scene.style.willChange = 'transform';
      rafId = requestAnimationFrame(tick);
    }
  });
}());


/* ─────────────────────────────────────────
   SCROLL REVEAL
   opacity + transform only — perf compliant.
───────────────────────────────────────── */
(function () {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  items.forEach((el) => io.observe(el));
}());


/* ─────────────────────────────────────────
   HEADER THEME SWITCH
   Detects when hero leaves viewport — switches
   header from dark-overlay to light-overlay.
───────────────────────────────────────── */
(function () {
  const header = document.getElementById('siteHeader');
  const hero   = document.getElementById('hero');
  if (!header || !hero) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          header.classList.remove('is-light');
        } else {
          header.classList.add('is-light');
        }
      });
    },
    { threshold: 0.05 }
  );

  io.observe(hero);
}());
