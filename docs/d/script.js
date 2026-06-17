/* ============================================================
   GROOVE 회현 — script.js
   DARING_MOVE: SVG feTurbulence + feDisplacementMap 비닐 노이즈
                마우스 이동 시 displacement scale 실시간 변화
   ============================================================ */

'use strict';

/* ── 전역 접두사: spark_ / app_ ── */

/* ── 1. feTurbulence 비닐 노이즈 캔버스 (DARING_MOVE) ── */
const spark_canvas = document.getElementById('spark-canvas');
const spark_ctx = spark_canvas ? spark_canvas.getContext('2d') : null;

let spark_canvasW = 0;
let spark_canvasH = 0;
let spark_noisePhase = 0;
let spark_mouseX = 0;
let spark_mouseY = 0;
let spark_displace = 0;   /* 현재 displacement 강도 */
let spark_targetDisplace = 0;

/* SVG 필터가 인라인이므로 feDisplacementMap scale을 JS로 업데이트 */
const spark_filterEl = document.querySelector('#spark-vinyl-noise feDisplacementMap');

function spark_resizeCanvas() {
  if (!spark_canvas) return;
  spark_canvasW = window.innerWidth;
  spark_canvasH = window.innerHeight;
  spark_canvas.width = spark_canvasW;
  spark_canvas.height = spark_canvasH;
}

/* 비닐 그레인 캔버스: 정적 노이즈 레이어 (매 프레임 재생성 아님 — PERF_LAW 준수) */
function spark_drawGrain() {
  if (!spark_ctx) return;
  spark_ctx.clearRect(0, 0, spark_canvasW, spark_canvasH);

  /* 동심원 비닐 그루브 패턴 */
  const cx = spark_canvasW * 0.5;
  const cy = spark_canvasH * 0.5;
  const maxR = Math.max(spark_canvasW, spark_canvasH) * 0.75;

  spark_ctx.save();
  spark_ctx.globalAlpha = 0.06;
  for (let r = 20; r < maxR; r += 7) {
    spark_ctx.beginPath();
    spark_ctx.arc(cx, cy, r, 0, Math.PI * 2);
    spark_ctx.strokeStyle = `oklch(60% 0.01 30)`;
    spark_ctx.lineWidth = 0.5;
    spark_ctx.stroke();
  }
  spark_ctx.restore();

  /* 필름 그레인 점들 */
  spark_ctx.save();
  spark_ctx.globalAlpha = 0.04;
  const grainCount = Math.floor((spark_canvasW * spark_canvasH) / 3000);
  for (let i = 0; i < grainCount; i++) {
    const gx = Math.random() * spark_canvasW;
    const gy = Math.random() * spark_canvasH;
    const gr = Math.random() * 1.2;
    const bright = Math.floor(Math.random() * 180 + 60);
    spark_ctx.fillStyle = `rgb(${bright},${bright},${bright})`;
    spark_ctx.beginPath();
    spark_ctx.arc(gx, gy, gr, 0, Math.PI * 2);
    spark_ctx.fill();
  }
  spark_ctx.restore();
}

/* 마우스 위치에 따라 feDisplacementMap scale 변화 (DARING_MOVE 핵심) */
function spark_updateDisplacement() {
  if (!spark_filterEl) return;
  /* 마우스가 중앙에서 멀수록 더 강한 왜곡 — 비닐 회전 환영 */
  const dx = (spark_mouseX / spark_canvasW) - 0.5;
  const dy = (spark_mouseY / spark_canvasH) - 0.5;
  const dist = Math.sqrt(dx * dx + dy * dy);  /* 0 ~ ~0.7 */
  spark_targetDisplace = dist * 28;            /* 최대 ~20px 왜곡 */
  /* 부드럽게 보간 */
  spark_displace += (spark_targetDisplace - spark_displace) * 0.08;
  spark_filterEl.setAttribute('scale', spark_displace.toFixed(2));
}

/* 레코드 회전 — transform만 사용 (PERF_LAW 준수) */
const spark_recordEl = document.getElementById('spark-record');
let spark_recordAngle = 0;
let spark_recordSpeed = 0.25;   /* deg/frame */

function spark_tickRecord() {
  if (!spark_recordEl) return;
  spark_recordAngle = (spark_recordAngle + spark_recordSpeed) % 360;
  spark_recordEl.style.transform = `rotate(${spark_recordAngle}deg)`;
}

/* 레코드 래퍼 마우스 parallax */
const spark_recordWrap = document.getElementById('spark-record-wrap');
function spark_parallaxRecord() {
  if (!spark_recordWrap) return;
  const px = (spark_mouseX / spark_canvasW - 0.5) * 22;
  const py = (spark_mouseY / spark_canvasH - 0.5) * 22;
  spark_recordWrap.style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`;
}

/* 아치 타이포 글자 parallax — 각기 다른 강도 */
const spark_archSpans = document.querySelectorAll('.spark-arch-type span');
const spark_archDepths = [0.04, 0.07, 0.03, 0.06, 0.05, 0.04];
function spark_parallaxArch() {
  if (!spark_archSpans.length) return;
  const cx = spark_mouseX - spark_canvasW * 0.5;
  const cy = spark_mouseY - spark_canvasH * 0.5;
  spark_archSpans.forEach((span, i) => {
    const d = spark_archDepths[i] || 0.05;
    span.style.transform = `translate(${cx * d}px, ${cy * d}px)`;
  });
}

/* RAF 루프 */
let spark_rafId = null;
function spark_loop() {
  spark_updateDisplacement();
  spark_tickRecord();
  spark_parallaxRecord();
  spark_parallaxArch();
  spark_rafId = requestAnimationFrame(spark_loop);
}

/* 마우스 이벤트 */
document.addEventListener('mousemove', (e) => {
  spark_mouseX = e.clientX;
  spark_mouseY = e.clientY;
});

/* 초기화 */
spark_resizeCanvas();
spark_drawGrain();  /* 그레인은 정적 — resize 때만 재생성 */

let spark_resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(spark_resizeTimer);
  spark_resizeTimer = setTimeout(() => {
    spark_resizeCanvas();
    spark_drawGrain();
  }, 150);
});

/* ── 2. Lenis + GSAP + ScrollTrigger ── */
function spark_initScroll() {
  if (typeof Lenis === 'undefined' || typeof gsap === 'undefined') {
    /* 라이브러리 로드 실패 시 폴백: 그냥 시작 */
    spark_loop();
    return;
  }

  const app_lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  app_lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => app_lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  gsap.registerPlugin(ScrollTrigger);

  /* ── 진행 바 ── */
  const app_progressFill = document.getElementById('spark-progress-fill');
  if (app_progressFill) {
    app_lenis.on('scroll', ({ progress }) => {
      app_progressFill.style.height = `${(progress * 100).toFixed(1)}%`;
    });
  }

  /* ── 사이드 네비 활성화 ── */
  const app_sections = document.querySelectorAll('.spark-section');
  const app_navDots = document.querySelectorAll('.spark-nav-dot');

  app_sections.forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 55%',
      end: 'bottom 45%',
      onToggle: ({ isActive }) => {
        if (!isActive) return;
        const id = sec.id;
        app_navDots.forEach((dot) => {
          dot.classList.toggle('active', dot.dataset.target === id);
        });
      },
    });
  });

  /* ── 네비 클릭 → Lenis 스크롤 ── */
  app_navDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const target = document.getElementById(dot.dataset.target);
      if (target) app_lenis.scrollTo(target, { offset: 0, duration: 1.4 });
    });
  });

  /* ── CTA 버튼 → Lenis 스크롤 ── */
  document.querySelectorAll('[data-lenis-target]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.lenisTarget);
      if (target) app_lenis.scrollTo(target, { offset: 0, duration: 1.4 });
    });
  });

  /* ── GSAP 등장 애니메이션 — transform/opacity만 ── */

  /* 인트로 콘텐츠 */
  const app_introTl = gsap.timeline({ delay: 0.3 });
  app_introTl
    .from('.spark-eyebrow', { opacity: 0, y: 16, duration: 0.7, ease: 'power2.out' })
    .from('.spark-intro-h1', { opacity: 0, y: 24, duration: 0.8, ease: 'power2.out' }, '-=0.4')
    .from('.spark-intro-desc', { opacity: 0, y: 12, duration: 0.6, ease: 'power2.out' }, '-=0.4')
    .from('.spark-scroll-cue', { opacity: 0, y: 8, duration: 0.5, ease: 'power2.out' }, '-=0.3')
    .from('.spark-torn-label', { opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.5');

  /* 아치 타이포 등장 */
  gsap.from('.spark-arch-type span', {
    opacity: 0,
    stagger: 0.07,
    duration: 1.2,
    ease: 'power3.out',
    delay: 0.1,
  });

  /* 레코드 등장 */
  gsap.from('.spark-record-wrap', {
    opacity: 0,
    scale: 0.7,
    duration: 1.4,
    ease: 'back.out(1.3)',
    delay: 0.2,
  });

  /* 컬렉션 섹션 */
  gsap.from('.col-h2-big', {
    scrollTrigger: { trigger: '.s-collection', start: 'top 75%' },
    opacity: 0,
    xPercent: -6,
    duration: 1,
    ease: 'power3.out',
  });
  gsap.from('.spark-col-sub', {
    scrollTrigger: { trigger: '.s-collection', start: 'top 70%' },
    opacity: 0,
    y: 12,
    duration: 0.7,
    ease: 'power2.out',
    delay: 0.2,
  });

  /* 콜라주 아이템 — 각자 다른 방향에서 등장 (파쇄된 질서) */
  gsap.from('.ci-1', {
    scrollTrigger: { trigger: '.spark-collage', start: 'top 80%' },
    opacity: 0,
    xPercent: -8,
    yPercent: 5,
    duration: 1.1,
    ease: 'power3.out',
  });
  gsap.from('.ci-2', {
    scrollTrigger: { trigger: '.spark-collage', start: 'top 75%' },
    opacity: 0,
    xPercent: 5,
    yPercent: -8,
    duration: 1.0,
    ease: 'power3.out',
    delay: 0.15,
  });
  gsap.from('.ci-3', {
    scrollTrigger: { trigger: '.spark-collage', start: 'top 70%' },
    opacity: 0,
    xPercent: 8,
    yPercent: 10,
    duration: 0.9,
    ease: 'power3.out',
    delay: 0.28,
  });
  gsap.from('.collage-overlay-text', {
    scrollTrigger: { trigger: '.spark-collage', start: 'top 60%' },
    opacity: 0,
    xPercent: 10,
    duration: 1.3,
    ease: 'power2.out',
    delay: 0.4,
  });

  /* 파인더 섹션 */
  gsap.from('.spark-finder-h2', {
    scrollTrigger: { trigger: '.s-finder', start: 'top 75%' },
    opacity: 0,
    y: 20,
    duration: 0.9,
    ease: 'power3.out',
  });
  gsap.from('.spark-genre-btn', {
    scrollTrigger: { trigger: '.spark-genre-selector', start: 'top 80%' },
    opacity: 0,
    xPercent: -3,
    stagger: 0.12,
    duration: 0.7,
    ease: 'power2.out',
  });

  /* 비짓 섹션 */
  gsap.from('.spark-visit-h2', {
    scrollTrigger: { trigger: '.s-visit', start: 'top 75%' },
    opacity: 0,
    y: 16,
    duration: 0.8,
    ease: 'power2.out',
  });
  gsap.from('.spark-info-row', {
    scrollTrigger: { trigger: '.spark-info-list', start: 'top 80%' },
    opacity: 0,
    y: 10,
    stagger: 0.1,
    duration: 0.6,
    ease: 'power2.out',
  });

  /* 비짓 이미지 parallax (스크롤 기반 — transform만) */
  gsap.to('.spark-visit-img', {
    scrollTrigger: {
      trigger: '.s-visit',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1,
    },
    yPercent: -15,
    ease: 'none',
  });

  /* RAF 시작 */
  spark_loop();
}

/* ── 3. 전략적 마찰 — 장르 선택 패널 ── */
const spark_genreBtns = document.querySelectorAll('.spark-genre-btn');
const spark_findReveal = document.getElementById('spark-finder-reveal');
const spark_revealConfirm = document.getElementById('spark-reveal-confirm');

const app_genreMessages = {
  jazz: '재즈 레코드 섹션을 가장 두껍게 운영합니다.\n하드밥부터 쿨재즈, ECM 계열까지 — 이 가게가 당신을 위해 존재합니다.',
  citypop: '국내 최다 시티팝 바이닐 재고를 보유하고 있습니다.\n야마시타 타츠로부터 오오누키 타에코까지 직접 손으로 고르세요.',
  indie: '국내 인디 씬의 바이닐을 꾸준히 입고합니다.\n검정치마·새소년·혁오·술탄 오브 더 디스코 — 여기서 찾으세요.',
};

let app_selectedGenre = null;

spark_genreBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const genre = btn.dataset.genre;

    /* 이미 선택된 것 다시 클릭하면 닫기 */
    if (app_selectedGenre === genre && spark_findReveal.classList.contains('open')) {
      spark_findReveal.classList.remove('open');
      spark_findReveal.setAttribute('aria-hidden', 'true');
      btn.setAttribute('aria-pressed', 'false');
      app_selectedGenre = null;
      return;
    }

    /* 이전 선택 해제 */
    spark_genreBtns.forEach((b) => b.setAttribute('aria-pressed', 'false'));

    /* 새 선택 */
    btn.setAttribute('aria-pressed', 'true');
    app_selectedGenre = genre;

    if (spark_revealConfirm && app_genreMessages[genre]) {
      spark_revealConfirm.textContent = app_genreMessages[genre];
    }

    if (spark_findReveal) {
      spark_findReveal.setAttribute('aria-hidden', 'false');
      /* rAF 2프레임 후 open 클래스 추가 — transition 트리거 */
      requestAnimationFrame(() => requestAnimationFrame(() => {
        spark_findReveal.classList.add('open');
      }));
    }
  });
});

/* ── 4. 라이브러리 로드 대기 후 초기화 ── */
function spark_waitForLibs(callback, attempts) {
  const att = attempts || 0;
  if (att > 40) { callback(); return; }
  if (typeof Lenis !== 'undefined' && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    callback();
  } else {
    setTimeout(() => spark_waitForLibs(callback, att + 1), 80);
  }
}

spark_waitForLibs(spark_initScroll);
