/* =====================================================
   GROOVE 회현 — script.js
   DARING_MOVE: 시간대별 oklch 팔레트 실시간 주입 + 분침 단위 전환
   SPARK 규칙: const/let only, spark_ 접두사, scrollIntoView 금지
   ===================================================== */

/* ── 팔레트 정의 (3 시간대) ──────────────────────────── */
const spark_PALETTES = {
  day: {        /* 10:00–17:59 — 골든 앰버 낮 */
    bg:          'oklch(96% 0.025 82)',
    bg2:         'oklch(91% 0.032 78)',
    fg:          'oklch(17% 0.04 58)',
    accent:      'oklch(56% 0.17 52)',
    accent2:     'oklch(70% 0.13 44)',
    decoLine:    'oklch(54% 0.09 54)',
    decoAccent:  'oklch(61% 0.15 49)',
    muted:       'oklch(50% 0.07 68)',
    vinylCenter: 'oklch(22% 0.05 58)',
    vinylMid:    'oklch(14% 0.02 0)',
    vinylOuter:  'oklch(9%  0.01 0)',
    vinylEdge:   'oklch(7%  0.01 0)',
    grooveLine:  'oklch(70% 0.05 60)',
    labelBg:     'oklch(56% 0.17 52)',
    label:       '낮',
  },
  evening: {    /* 18:00–21:59 — 딥 버건디 저녁 */
    bg:          'oklch(16% 0.04 10)',
    bg2:         'oklch(21% 0.05 12)',
    fg:          'oklch(88% 0.02 30)',
    accent:      'oklch(65% 0.18 22)',
    accent2:     'oklch(55% 0.14 15)',
    decoLine:    'oklch(45% 0.10 18)',
    decoAccent:  'oklch(58% 0.16 20)',
    muted:       'oklch(60% 0.07 25)',
    vinylCenter: 'oklch(35% 0.10 22)',
    vinylMid:    'oklch(20% 0.05 10)',
    vinylOuter:  'oklch(12% 0.02 0)',
    vinylEdge:   'oklch(8%  0.01 0)',
    grooveLine:  'oklch(55% 0.08 22)',
    labelBg:     'oklch(42% 0.14 20)',
    label:       '저녁',
  },
  night: {      /* 22:00–09:59 — 인디고 블랙 밤 */
    bg:          'oklch(10% 0.03 260)',
    bg2:         'oklch(14% 0.04 255)',
    fg:          'oklch(85% 0.03 240)',
    accent:      'oklch(68% 0.20 260)',
    accent2:     'oklch(58% 0.16 250)',
    decoLine:    'oklch(40% 0.12 258)',
    decoAccent:  'oklch(55% 0.18 258)',
    muted:       'oklch(55% 0.08 250)',
    vinylCenter: 'oklch(28% 0.10 260)',
    vinylMid:    'oklch(16% 0.04 255)',
    vinylOuter:  'oklch(10% 0.02 0)',
    vinylEdge:   'oklch(6%  0.01 0)',
    grooveLine:  'oklch(48% 0.08 255)',
    labelBg:     'oklch(36% 0.16 260)',
    label:       '밤',
  },
};

/* 시간대 무드 텍스트 */
const spark_MOODS = {
  day: {
    title: '햇살 속 스윙',
    desc:  '낮의 가게는 조용합니다. 커피 한 잔 들고 와 재즈 한 장 골라가는 사람들을 위한 시간.',
  },
  evening: {
    title: '황혼의 시티팝',
    desc:  '퇴근길 들러 레코드 한 장. 야마시타 타츠로가 흐르는 골목, 저녁 7시의 회현.',
  },
  night: {
    title: '인디의 한밤',
    desc:  '문 닫기 전 마지막 손님. 서울 인디의 소리가 가장 깊어지는 시간, 가게를 채웁니다.',
  },
};

/* ── 현재 시간대 계산 ─────────────────────────────────── */
function spark_getTimeSlot() {
  const spark_h = new Date().getHours();
  if (spark_h >= 10 && spark_h < 18) return 'day';
  if (spark_h >= 18 && spark_h < 22) return 'evening';
  return 'night';
}

/* 하루 안 진행률 (0–1) — 타임바 */
function spark_getDayProgress() {
  const spark_now = new Date();
  const spark_totalSecs = 24 * 3600;
  const spark_elapsed = spark_now.getHours() * 3600 + spark_now.getMinutes() * 60 + spark_now.getSeconds();
  return spark_elapsed / spark_totalSecs;
}

/* ── DARING_MOVE: CSS 변수 팔레트 주입 ──────────────── */
function spark_applyPalette(slot) {
  const spark_p = spark_PALETTES[slot];
  const spark_root = document.documentElement;
  spark_root.style.setProperty('--bg',          spark_p.bg);
  spark_root.style.setProperty('--bg2',         spark_p.bg2);
  spark_root.style.setProperty('--fg',          spark_p.fg);
  spark_root.style.setProperty('--accent',      spark_p.accent);
  spark_root.style.setProperty('--accent2',     spark_p.accent2);
  spark_root.style.setProperty('--deco-line',   spark_p.decoLine);
  spark_root.style.setProperty('--deco-accent', spark_p.decoAccent);
  spark_root.style.setProperty('--muted',       spark_p.muted);
  spark_root.style.setProperty('--vinyl-center',spark_p.vinylCenter);
  spark_root.style.setProperty('--vinyl-mid',   spark_p.vinylMid);
  spark_root.style.setProperty('--vinyl-outer', spark_p.vinylOuter);
  spark_root.style.setProperty('--vinyl-edge',  spark_p.vinylEdge);
  spark_root.style.setProperty('--groove-line', spark_p.grooveLine);
  spark_root.style.setProperty('--label-bg',    spark_p.labelBg);
}

function spark_updateTimeUI(slot) {
  const spark_labelEl  = document.getElementById('spark-time-label');
  const spark_fillEl   = document.getElementById('spark-time-fill');
  const spark_nowLabel = document.getElementById('spark-now-label');
  const spark_moodEl   = document.getElementById('spark-now-mood');
  const spark_descEl   = document.getElementById('spark-now-desc');

  if (spark_labelEl) spark_labelEl.textContent = spark_PALETTES[slot].label;
  if (spark_fillEl) {
    spark_fillEl.style.width = (spark_getDayProgress() * 100).toFixed(1) + '%';
  }
  if (spark_nowLabel) {
    spark_nowLabel.textContent = '지금 가게엔';
  }
  if (spark_moodEl) {
    spark_moodEl.textContent = spark_MOODS[slot].title;
  }
  if (spark_descEl) {
    spark_descEl.textContent = spark_MOODS[slot].desc;
  }
}

/* ── 팔레트 초기 적용 ─────────────────────────────────── */
const spark_initialSlot = spark_getTimeSlot();
spark_applyPalette(spark_initialSlot);

/* ── DOM 로드 후 실행 ─────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  /* 시간대 UI 초기 세팅 */
  const spark_slot = spark_getTimeSlot();
  spark_updateTimeUI(spark_slot);

  /* 분 단위 팔레트 재확인 — 시간대 넘어갈 때 전환 */
  let spark_lastSlot = spark_slot;
  setInterval(function () {
    const spark_newSlot = spark_getTimeSlot();
    if (spark_newSlot !== spark_lastSlot) {
      spark_applyPalette(spark_newSlot);
      spark_lastSlot = spark_newSlot;
    }
    /* 타임바는 매분 갱신 */
    const spark_fillEl2 = document.getElementById('spark-time-fill');
    if (spark_fillEl2) {
      spark_fillEl2.style.width = (spark_getDayProgress() * 100).toFixed(1) + '%';
    }
    spark_updateTimeUI(spark_newSlot);
  }, 60000); /* 60초 */

  /* ── Lenis 스무스 스크롤 ─────────────────────────────── */
  /* GSAP/ScrollTrigger/Lenis CDN 로드 완료 대기 */
  const spark_waitLibs = setInterval(function () {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof Lenis === 'undefined') {
      return;
    }
    clearInterval(spark_waitLibs);
    spark_initAnimations();
  }, 80);
});

/* ── GSAP + Lenis 애니메이션 ──────────────────────────── */
function spark_initAnimations() {
  /* reduced-motion 체크 */
  const spark_reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (spark_reduced) {
    /* 모든 대상 즉시 가시 상태 */
    document.querySelectorAll('.genre-card, .info-block, .now-mood, .now-desc').forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  /* Lenis 초기화 */
  const spark_lenis = new Lenis({
    duration: 1.2,
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
  });
  spark_lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(function (time) { spark_lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  gsap.registerPlugin(ScrollTrigger);

  /* 리듬 타이틀 진입 — stagger로 반복 리듬 */
  gsap.fromTo(
    ['.r-line-1', '.r-line-2', '.r-line-3'],
    { opacity: 0, y: 40 },
    {
      opacity: function (i) { return [0.08, 0.18, 1][i]; },
      y: 0,
      stagger: 0.18,
      duration: 1.1,
      ease: 'power3.out',
      delay: 0.2,
    }
  );
  gsap.fromTo(
    ['.store-kor-main', '.store-kor-sub', '.deco-divider', '.tagline'],
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, stagger: 0.14, duration: 0.9, ease: 'power2.out', delay: 0.7 }
  );

  /* now-mood, now-desc 진입 */
  gsap.to('.now-mood', {
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '#section-now',
      start: 'top 72%',
    },
  });
  gsap.to('.now-desc', {
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: 'power2.out',
    delay: 0.2,
    scrollTrigger: {
      trigger: '#section-now',
      start: 'top 72%',
    },
  });

  /* 장르 카드 — 리듬 반복 순차 진입 (stagger) */
  gsap.to('.genre-card', {
    opacity: 1,
    y: 0,
    stagger: 0.15,
    duration: 0.8,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '#section-genre',
      start: 'top 68%',
    },
  });

  /* 정보 블록 — 바우하우스 좌→우 순차 진입 */
  gsap.to('.info-block', {
    opacity: 1,
    x: 0,
    stagger: 0.12,
    duration: 0.75,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '#section-info',
      start: 'top 72%',
    },
  });

  /* 레코드 호버 인터랙션 — 빠르게 회전 */
  const spark_vinyl = document.getElementById('spark-vinyl');
  if (spark_vinyl) {
    spark_vinyl.addEventListener('mouseenter', function () {
      gsap.to(spark_vinyl, { '--vinyl-speed': 1, duration: 0.5 });
      spark_vinyl.style.animationDuration = '5s';
    });
    spark_vinyl.addEventListener('mouseleave', function () {
      spark_vinyl.style.animationDuration = '18s';
    });
  }

  /* 장르 카드 마우스 패럴랙스 — 리듬 변주 */
  document.querySelectorAll('.genre-card').forEach(function (spark_card) {
    spark_card.addEventListener('mousemove', function (e) {
      const spark_rect = spark_card.getBoundingClientRect();
      const spark_cx = (e.clientX - spark_rect.left) / spark_rect.width - 0.5;
      const spark_cy = (e.clientY - spark_rect.top) / spark_rect.height - 0.5;
      gsap.to(spark_card, {
        rotateY: spark_cx * 6,
        rotateX: -spark_cy * 4,
        transformPerspective: 800,
        duration: 0.4,
        ease: 'power1.out',
      });
    });
    spark_card.addEventListener('mouseleave', function () {
      gsap.to(spark_card, {
        rotateY: 0,
        rotateX: 0,
        duration: 0.55,
        ease: 'power2.out',
      });
    });
  });

  /* 아트데코 배경 SVG — 스크롤 패럴랙스 */
  gsap.to('.deco-bg', {
    yPercent: 25,
    ease: 'none',
    scrollTrigger: {
      trigger: 'body',
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
    },
  });

  /* 리듬 반복 타이틀 패럴랙스 — 3단이 서로 다른 속도로 흐름 */
  gsap.to('.r-line-1', {
    yPercent: -40,
    ease: 'none',
    scrollTrigger: {
      trigger: '#section-identity',
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
    },
  });
  gsap.to('.r-line-2', {
    yPercent: -20,
    ease: 'none',
    scrollTrigger: {
      trigger: '#section-identity',
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
    },
  });
  gsap.to('.r-line-3', {
    yPercent: -8,
    ease: 'none',
    scrollTrigger: {
      trigger: '#section-identity',
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
    },
  });
}
