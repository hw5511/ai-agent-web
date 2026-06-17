/* ============================================================
   GROOVE 회현 — script.js
   SPARK: 아트데코 분리선 clip-path 확장 + 레코드 슬로우 회전
   + Zeigarnik 진행률 바 + 매거진 타이포 reveal
   60fps 규칙: transform/opacity만 애니. blur/shadow/filter 이동 금지.
   ============================================================ */

'use strict';

/* ── 전역 상수 (spark_ 접두사) ── */
const spark_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Lenis 스무스 스크롤 ── */
const spark_lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

spark_lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  spark_lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

/* ── ScrollTrigger 플러그인 등록 ── */
gsap.registerPlugin(ScrollTrigger);

/* ── 레코드 슬로우 회전 (transform만 — 60fps 안전) ── */
function spark_initRecordSpin() {
  const spark_recordImg = document.querySelector('.record-img');
  if (!spark_recordImg || spark_REDUCED) return;

  gsap.to(spark_recordImg, {
    rotation: 360,
    duration: 18,
    repeat: -1,
    ease: 'none',
    transformOrigin: '50% 50%',
  });
}

/* ── 아트데코 분리선 clip-path 확장 (DARING_MOVE) ── */
/* 분리선이 뷰포트에 진입하면 clip-path inset(0 50% ...) → inset(0 0% ...)
   — CSS transition과 IntersectionObserver 조합으로 추가 부드러움 확보 */
function spark_initDividerExpansion() {
  const spark_divLines = document.querySelectorAll('.div-line');

  if (spark_REDUCED) {
    spark_divLines.forEach((el) => el.classList.add('expanded'));
    return;
  }

  const spark_divObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('expanded');
          spark_divObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  spark_divLines.forEach((el) => spark_divObs.observe(el));
}

/* ── 헤드라인 아트데코 수평선 확장 (DARING_MOVE 핵심) ── */
/* scaleX(0) → scaleX(1) 로 transform 단독 애니 */
function spark_initRuleExpansion() {
  const spark_ruleLines = document.querySelectorAll('.rule-line');
  if (spark_REDUCED) {
    spark_ruleLines.forEach((el) => {
      el.style.transform = 'scaleX(1)';
    });
    return;
  }

  /* 오프닝 섹션 로드 후 트리거 */
  const spark_colHead = document.querySelector('.col-headline');
  if (!spark_colHead) return;

  const spark_ruleObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          gsap.to(spark_ruleLines, {
            scaleX: 1,
            duration: 1.2,
            ease: 'expo.out',
            stagger: 0.12,
            delay: 0.4,
          });
          spark_ruleObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  spark_ruleObs.observe(spark_colHead);
}

/* ── 매거진 타이포 reveal (transform/opacity만) ── */
function spark_initTypoReveal() {
  if (spark_REDUCED) return;

  /* 메인 타이틀 라인별 reveal */
  const spark_titleLines = document.querySelectorAll('.title-line');
  spark_titleLines.forEach((line, i) => {
    gsap.fromTo(
      line,
      { opacity: 0, yPercent: 40 },
      {
        opacity: 1,
        yPercent: 0,
        duration: 1.0,
        delay: 0.15 + i * 0.12,
        ease: 'expo.out',
      }
    );
  });

  /* 이슈 태그 */
  gsap.fromTo(
    '.issue-tag',
    { opacity: 0, xPercent: -10 },
    { opacity: 1, xPercent: 0, duration: 0.8, delay: 0.05, ease: 'expo.out' }
  );

  /* 서브 카피 */
  gsap.fromTo(
    '.sub-copy',
    { opacity: 0, yPercent: 15 },
    { opacity: 1, yPercent: 0, duration: 0.9, delay: 0.55, ease: 'expo.out' }
  );

  /* Zeigarnik 블록 */
  gsap.fromTo(
    '.zeigarnik-block',
    { opacity: 0, xPercent: 6 },
    { opacity: 1, xPercent: 0, duration: 0.9, delay: 0.6, ease: 'expo.out' }
  );
}

/* ── Zeigarnik 진행률 바 (방문 유도 — 15%에서 시작) ── */
function spark_initZeigarnik() {
  const spark_barFill = document.querySelector('.zk-bar-fill');
  if (!spark_barFill) return;

  const spark_pctEl = document.querySelector('.zk-pct');

  /* 페이지 로드 후 0 → 15% 애니 */
  const spark_zk_delay = spark_REDUCED ? 0 : 900;

  setTimeout(() => {
    spark_barFill.style.width = '15%';
    if (spark_pctEl) spark_pctEl.textContent = '15%';
  }, spark_zk_delay);

  /* 방문 섹션 진입 시 완결 바 → 100% */
  const spark_completebar = document.querySelector('.zk-complete-bar');
  if (!spark_completebar) return;

  if (spark_REDUCED) {
    spark_completebar.classList.add('full');
    return;
  }

  const spark_visitObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          spark_completebar.classList.add('full');
          spark_visitObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  const spark_visitSec = document.querySelector('.visit');
  if (spark_visitSec) spark_visitObs.observe(spark_visitSec);
}

/* ── 스크롤 기반 컬렉션 아이템 reveal ── */
function spark_initScrollReveal() {
  if (spark_REDUCED) return;

  const spark_revealEls = document.querySelectorAll('.coll-item, .about-pull-quote, .about-body, .visit-info, .visit-map-area');

  spark_revealEls.forEach((el, i) => {
    gsap.fromTo(
      el,
      { opacity: 0, yPercent: 12 },
      {
        opacity: 1,
        yPercent: 0,
        duration: 0.85,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
        },
      }
    );
  });
}

/* ── 네비게이션 활성 링크 (스크롤 위치 기반) ── */
function spark_initNavHighlight() {
  const spark_navLinks = document.querySelectorAll('.nav-link');
  const spark_sections = ['top', 'collection', 'about', 'visit'].map((id) =>
    document.getElementById(id)
  );

  const spark_navObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const spark_id = entry.target.id;
          spark_navLinks.forEach((link) => {
            link.style.color = '';
            const spark_href = link.getAttribute('href');
            if (spark_href === `#${spark_id}` || (spark_id === 'top' && spark_href === '#collection')) {
              link.style.color = 'var(--gold)';
            }
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  spark_sections.forEach((sec) => {
    if (sec) spark_navObs.observe(sec);
  });
}

/* ── 레코드 호버: 속도 변화 (transform만 — PERF 안전) ── */
function spark_initRecordHover() {
  const spark_recordFrame = document.querySelector('.record-frame');
  if (!spark_recordFrame || spark_REDUCED) return;

  spark_recordFrame.addEventListener('mouseenter', () => {
    gsap.to('.record-img', { timeScale: 2.5, duration: 0.6, ease: 'power2.out' });
  });

  spark_recordFrame.addEventListener('mouseleave', () => {
    gsap.to('.record-img', { timeScale: 1, duration: 1.2, ease: 'power2.out' });
  });
}

/* ── 초기화 ── */
function spark_init() {
  spark_initRecordSpin();
  spark_initRuleExpansion();
  spark_initDividerExpansion();
  spark_initTypoReveal();
  spark_initZeigarnik();
  spark_initScrollReveal();
  spark_initNavHighlight();
  spark_initRecordHover();
}

/* DOMContentLoaded 후 실행 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', spark_init);
} else {
  spark_init();
}
