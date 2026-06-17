/* ============================================================
   GROOVE 회현 · 여정 트랙 엔진
   세로 스크롤 -> 가로 트랙 진행 (나이키식 서사 전개)
   THE LAW: 매 프레임 transform/opacity만
   ============================================================ */
(() => {
  "use strict";

  const spark_reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const spark_narrow = window.matchMedia("(max-width: 900px)").matches;

  const spark_track = document.getElementById("track");
  const spark_stages = Array.from(document.querySelectorAll(".stage"));
  const spark_dots = Array.from(document.querySelectorAll(".spine-dot"));
  const spark_needle = document.querySelector(".spine-needle");
  const spark_rail = document.querySelector(".spine-rail");

  /* ---------- 마이크로카피: 인격체의 목소리 ---------- */
  const spark_beginNote = document.getElementById("begin-note");
  const spark_beginLines = [
    "살살 내려도 됩니다. 급할 것 없어요.",
    "바늘은 아직 따뜻합니다.",
    "이 한 장, 멀리서 왔어요.",
    "준비되셨으면 · 천천히."
  ];

  const spark_libsReady = () =>
    window.gsap && window.ScrollTrigger && window.Lenis;

  function spark_run() {
    /* prefers-reduced-motion 또는 라이브러리 부재: 모든 reveal 가시 복원 */
    if (spark_reduce || !spark_libsReady()) {
      document.querySelectorAll(".reveal, .reveal-x").forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      spark_bindStatic();
      return;
    }

    const { gsap } = window;
    gsap.registerPlugin(window.ScrollTrigger);

    /* ---------- Lenis ---------- */
    const lenis = new window.Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    });
    lenis.on("scroll", window.ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    spark_bindNav(lenis);
    spark_bindCrates();
    spark_bindBeginNote();
    spark_revealStages(gsap);

    if (spark_narrow) {
      /* 세로 폴백: 가로 트랜지션 없음, 단순 reveal + 액티브 추적 */
      spark_verticalActive();
      return;
    }

    spark_horizontal(gsap, lenis);
  }

  /* ============================================================
     가로 트랙 · 세로 스크롤 픽셀을 x 트랜스폼으로 변환
     ============================================================ */
  function spark_horizontal(gsap, lenis) {
    const getScrollAmount = () =>
      spark_track.scrollWidth - window.innerWidth;

    const tween = gsap.to(spark_track, {
      x: () => -getScrollAmount(),
      ease: "none"
    });

    window.ScrollTrigger.create({
      trigger: spark_track,
      start: "top top",
      end: () => "+=" + getScrollAmount(),
      pin: true,
      anticipatePin: 1,
      scrub: 1,
      invalidateOnRefresh: true,
      animation: tween,
      onUpdate: (self) => spark_progress(self.progress)
    });

    /* 디스크 회전: progress 기반 transform (정적 그림자 유지) */
    const platter = document.querySelector(".disc-platter");

    window.ScrollTrigger.create({
      trigger: spark_track,
      start: "top top",
      end: () => "+=" + getScrollAmount(),
      scrub: 1,
      onUpdate: (self) => {
        if (platter) platter.style.transform = "rotate(" + (self.progress * 540) + "deg)";
      }
    });

    /* 큐레이션 셀: 트랙 진행에 따라 시차 등장 */
    gsap.utils.toArray(".crate").forEach((crate, i) => {
      gsap.fromTo(crate,
        { y: 40, autoAlpha: 0 },
        {
          y: 0, autoAlpha: 1, duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: crate,
            containerAnimation: tween,
            start: "left 88%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    /* 티커 행: 가로 컨테이너 기준 슬라이드 인 */
    gsap.utils.toArray(".ticker-row").forEach((row) => {
      gsap.fromTo(row,
        { x: 50, autoAlpha: 0 },
        {
          x: 0, autoAlpha: 1, duration: .8, ease: "power2.out",
          scrollTrigger: {
            trigger: row,
            containerAnimation: tween,
            start: "left 92%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    window.addEventListener("resize", () => window.ScrollTrigger.refresh());
  }

  /* progress(0~1) -> 척추 바늘 위치 + 액티브 닷 */
  function spark_progress(p) {
    if (spark_needle && spark_rail) {
      const h = spark_rail.offsetHeight - spark_needle.offsetHeight;
      spark_needle.style.transform =
        "translate(-50%, " + (p * h) + "px)";
    }
    const idx = Math.min(
      spark_stages.length - 1,
      Math.round(p * (spark_stages.length - 1))
    );
    spark_setActive(idx);
  }

  function spark_setActive(idx) {
    spark_dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
  }

  /* ============================================================
     내비게이션 · 닷/버튼 클릭으로 해당 챕터의 스크롤 위치로 이동
     ============================================================ */
  function spark_bindNav(lenis) {
    const targets = ["chapter-0","chapter-1","chapter-2","chapter-3","chapter-4","chapter-5"];

    const goTo = (id) => {
      const idx = targets.indexOf(id);
      if (idx < 0) return;
      if (spark_narrow) {
        const el = document.getElementById(id);
        if (el) lenis.scrollTo(el, { offset: -40 });
        return;
      }
      /* 가로 모드: 트랙 pin 구간 내 비례 위치로 이동 */
      const st = window.ScrollTrigger.getAll()
        .find((s) => s.pin === spark_track);
      if (!st) return;
      const frac = idx / (targets.length - 1);
      const y = st.start + (st.end - st.start) * frac;
      lenis.scrollTo(y, { duration: 1.3 });
    };

    document.querySelectorAll("[data-target]").forEach((btn) => {
      btn.addEventListener("click", () => goTo(btn.dataset.target));
    });
  }

  /* ============================================================
     큐레이션 셀 · 클릭/키보드로 펼침 (뉴모피즘 누름 직관)
     ============================================================ */
  function spark_bindCrates() {
    document.querySelectorAll(".crate").forEach((crate) => {
      const toggle = () => crate.classList.toggle("is-open");
      crate.addEventListener("click", toggle);
      crate.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
      });
    });
  }

  /* 마이크로카피 회전 · 프롤로그 버튼 호버 시 목소리 변화 */
  function spark_bindBeginNote() {
    const btn = document.getElementById("begin-btn");
    if (!btn || !spark_beginNote) return;
    let n = 0;
    btn.addEventListener("mouseenter", () => {
      n = (n + 1) % spark_beginLines.length;
      spark_beginNote.style.opacity = "0";
      setTimeout(() => {
        spark_beginNote.textContent = spark_beginLines[n];
        spark_beginNote.style.opacity = "1";
      }, 160);
    });
  }

  /* 가로 비활성 reveal 대상은 컨테이너 애니메이션에서 처리되므로
     여기선 첫 스테이지 카피만 진입 reveal */
  function spark_revealStages(gsap) {
    const first = document.querySelector(".stage-prologue .prologue-copy");
    if (first) {
      gsap.from(first.children, {
        y: 24, autoAlpha: 0, duration: .9, stagger: .08, ease: "power2.out", delay: .2
      });
    }
  }

  /* 세로 폴백: IntersectionObserver로 액티브 닷 추적 */
  function spark_verticalActive() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const idx = spark_stages.indexOf(e.target);
          if (idx >= 0) spark_setActive(idx);
        }
      });
    }, { threshold: 0.5 });
    spark_stages.forEach((s) => io.observe(s));
  }

  /* 라이브러리 없을 때 최소 인터랙션 */
  function spark_bindStatic() {
    spark_bindCrates();
    document.querySelectorAll("[data-target]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const el = document.getElementById(btn.dataset.target);
        if (el) {
          const y = el.getBoundingClientRect().top + window.pageYOffset - 40;
          window.scrollTo(0, y);
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", spark_run);
  } else {
    spark_run();
  }
})();
