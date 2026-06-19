/* ============================================================
   GROOVE 회현 · 대들보 + 밤송이
   - PINCH 빛의 파편: 보(beam) 위를 흐르는 빛 조각 canvas
   - INTERACTION 가변 폰트: masthead 타이틀 굵기를 스크롤/포인터로 가변
   - 밤송이(burr) 카드: 클릭/키보드로 갈라져 알밤(정보) 노출
   - 성능 THE LAW: 매 프레임 transform/opacity·canvas만. 보 그림자/blur는 정적.
   ============================================================ */
(() => {
  'use strict';

  const spark_reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Lenis + GSAP ---------- */
  let spark_lenis = null;
  const spark_initScroll = () => {
    if (spark_reduce || typeof Lenis === 'undefined') return;
    spark_lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    if (typeof ScrollTrigger !== 'undefined') {
      spark_lenis.on('scroll', ScrollTrigger.update);
    }
    gsap.ticker.add((time) => spark_lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  };

  /* ---------- 빛의 파편: 보 위를 흐르는 canvas ---------- */
  const spark_initShards = () => {
    const cv = document.getElementById('spark_shards');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    const shards = [];
    const COUNT = 26;

    const resize = () => {
      const r = cv.getBoundingClientRect();
      w = r.width; h = r.height;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const make = () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      len: 8 + Math.random() * 26,
      sp: 0.25 + Math.random() * 1.1,
      a: 0.12 + Math.random() * 0.5,
      tw: Math.random() * Math.PI * 2,
    });

    for (let i = 0; i < COUNT; i++) shards.push(make());
    resize();

    let raf = 0;
    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      for (const s of shards) {
        s.x += s.sp;
        s.tw += 0.05;
        if (s.x - s.len > w) { s.x = -s.len; s.y = Math.random() * h; }
        const flick = s.a * (0.55 + 0.45 * Math.sin(s.tw));
        const g = ctx.createLinearGradient(s.x, s.y, s.x + s.len, s.y);
        g.addColorStop(0, 'rgba(255,236,190,0)');
        g.addColorStop(0.5, 'rgba(255,224,168,' + flick.toFixed(3) + ')');
        g.addColorStop(1, 'rgba(255,236,190,0)');
        ctx.strokeStyle = g;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + s.len, s.y - s.len * 0.18);
        ctx.stroke();
      }
      raf = requestAnimationFrame(frame);
    };

    window.addEventListener('resize', resize, { passive: true });
    if (spark_reduce) {
      // 정적 한 프레임만 렌더
      ctx.clearRect(0, 0, w, h);
      for (const s of shards) {
        ctx.strokeStyle = 'rgba(255,224,168,' + (s.a * 0.5).toFixed(3) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + s.len, s.y - s.len * 0.18);
        ctx.stroke();
      }
      return;
    }
    raf = requestAnimationFrame(frame);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(raf); }
      else { raf = requestAnimationFrame(frame); }
    });
  };

  /* ---------- 가변 폰트: masthead 타이틀 굵기 ---------- */
  const spark_initVariableType = () => {
    const title = document.querySelector('.masthead__title');
    if (!title || spark_reduce) return;
    const em = title.querySelector('em');

    // 스크롤 진행에 따라 첫 줄을 200 -> 700 으로
    const line1 = title.querySelector('.masthead__line:not(.masthead__line--beam)');
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const vh = window.innerHeight || 1;
        const p = Math.min(1, Math.max(0, window.scrollY / (vh * 0.7)));
        if (line1) line1.style.fontWeight = String(Math.round(200 + p * 500));
        if (em) em.parentElement.style.setProperty('--beam-fill', p.toFixed(3));
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // 포인터가 지나가면 글자 무게가 출렁(가변 폰트 유연성)
    title.addEventListener('pointermove', (e) => {
      const r = title.getBoundingClientRect();
      const rel = (e.clientX - r.left) / r.width;
      title.style.setProperty('--lean', (rel - 0.5).toFixed(3));
      if (line1) line1.style.fontWeight = String(Math.round(200 + Math.abs(rel - 0.5) * 900));
    }, { passive: true });
    title.addEventListener('pointerleave', () => {
      if (line1) onScroll();
    });
  };

  /* ---------- 밤송이 카드: 갈라짐 ---------- */
  const spark_initBurrs = () => {
    const burrs = Array.from(document.querySelectorAll('.burr'));
    const toggle = (b) => {
      const open = b.getAttribute('aria-expanded') === 'true';
      // 한 번에 하나만 활짝 (보의 균형)
      if (!open) burrs.forEach((o) => { if (o !== b) o.setAttribute('aria-expanded', 'false'); });
      b.setAttribute('aria-expanded', open ? 'false' : 'true');
    };
    burrs.forEach((b) => {
      b.addEventListener('click', () => toggle(b));
      b.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(b); }
      });
    });
    // 첫 카드는 기본으로 열어 안내
    if (burrs[0]) burrs[0].setAttribute('aria-expanded', 'true');
  };

  /* ---------- reveal ---------- */
  const spark_initReveal = () => {
    const targets = document.querySelectorAll(
      '.bay__h, .bay__sub, .creed__p, .creed__facts li, .burr, .listen__fig, .listen__body > *, .drop, .find__col, .find__sign, .masthead__lede, .masthead__meta'
    );
    targets.forEach((t) => t.classList.add('reveal'));
    if (spark_reduce || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      targets.forEach((t) => t.classList.remove('reveal'));
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    targets.forEach((t) => {
      gsap.to(t, {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: t, start: 'top 88%' },
        onStart: () => t.classList.remove('reveal'),
      });
    });
    // 장선 걸이 자라남
    gsap.utils.toArray('.bay__hang').forEach((el) => {
      gsap.from(el, {
        scaleY: 0, duration: 0.9, ease: 'power2.out', transformOrigin: 'top',
        scrollTrigger: { trigger: el.parentElement, start: 'top 92%' },
      });
    });
  };

  /* ---------- 보(beam) 진행 표시 + 점프 ---------- */
  const spark_initSpine = () => {
    const marks = Array.from(document.querySelectorAll('.spine__mark'));
    const secs = marks.map((m) => document.getElementById('sec-' + m.dataset.go));
    marks.forEach((m, i) => {
      m.setAttribute('role', 'button');
      m.setAttribute('tabindex', '0');
      const jump = () => {
        const el = secs[i];
        if (!el) return;
        if (spark_lenis) spark_lenis.scrollTo(el, { offset: -20 });
        else window.scrollTo({ top: el.offsetTop - 20 });
      };
      m.addEventListener('click', jump);
      m.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); jump(); }
      });
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const id = en.target.id.split('-')[1];
        marks.forEach((m) => m.classList.toggle('is-here', m.dataset.go === id));
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    secs.forEach((s) => { if (s) io.observe(s); });
  };

  const boot = () => {
    spark_initScroll();
    spark_initShards();
    spark_initVariableType();
    spark_initBurrs();
    spark_initReveal();
    spark_initSpine();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
