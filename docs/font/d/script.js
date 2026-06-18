/* GROOVE 회현 · script.js
   - 가변 폰트 굵기 보간 (INTERACTION_SPARK: 가변 폰트의 유연성)
   - LP 원반의 느린 회전 (transform만)
   - Lenis 부드러운 스크롤 + 앵커 이동
   - reveal (transform/opacity)
   전역 접두사 spark_ , var 금지, 단일 파일 + defer
*/
(() => {
  "use strict";

  const spark_reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- 1. 가변 폰트 굵기 보간 ----------------------------------
     각 [data-weight-flex] 제목의 뷰포트 내 위치에 따라
     --wflex 를 200(가벼움) → 700(묵직함) 으로 보간.
     마루부리/프리텐다드의 다중 굵기를 "유연한 한 서체"처럼 호흡시킨다. */
  const spark_flexEls = Array.from(document.querySelectorAll("[data-weight-flex]"));
  const spark_W_MIN = 200;
  const spark_W_MAX = 700;

  const spark_clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  let spark_ticking = false;
  const spark_updateWeights = () => {
    spark_ticking = false;
    const vh = window.innerHeight;
    for (const el of spark_flexEls) {
      const r = el.getBoundingClientRect();
      const center = r.top + r.height / 2;
      // 화면 중앙(0.5)에 가까울수록 굵게. 위/아래로 멀어질수록 가늘게.
      const dist = Math.abs(center - vh * 0.5) / (vh * 0.7);
      const t = spark_clamp(1 - dist, 0, 1); // 1 = 화면 중앙
      const w = Math.round(spark_W_MIN + (spark_W_MAX - spark_W_MIN) * t);
      el.style.setProperty("--wflex", String(w));
    }
  };

  const spark_requestWeights = () => {
    if (!spark_ticking) {
      spark_ticking = true;
      requestAnimationFrame(spark_updateWeights);
    }
  };

  if (spark_reduce) {
    // 모션 최소화: 중간 굵기로 고정
    for (const el of spark_flexEls) el.style.setProperty("--wflex", "400");
  } else {
    spark_updateWeights();
    window.addEventListener("scroll", spark_requestWeights, { passive: true });
    window.addEventListener("resize", spark_requestWeights);
  }

  /* ---- 2. LP 원반 / 비닐의 느린 회전 (transform만) ------------- */
  const spark_discs = Array.from(document.querySelectorAll("[data-disc], .vinyl"));
  if (!spark_reduce && spark_discs.length) {
    let spark_t0 = null;
    const spark_spin = (now) => {
      if (spark_t0 === null) spark_t0 = now;
      const elapsed = (now - spark_t0) / 1000;
      const deg = (elapsed * 9) % 360; // 분당 1.5회전 정도, 묵직하게
      for (const d of spark_discs) {
        d.style.transform =
          (d.classList.contains("vinyl") ? "translate(-38%,-50%) " : "") +
          "rotate(" + deg.toFixed(2) + "deg)";
      }
      requestAnimationFrame(spark_spin);
    };
    requestAnimationFrame(spark_spin);
  }

  /* ---- 3. reveal (transform/opacity) -------------------------- */
  const spark_revealTargets = document.querySelectorAll(
    ".section-index, .overture-copy > *, .slab, .philosophy-grid p, .lp-block, .listening-head, .booth, .stock-list li, .stock-note, .visit-info > div, .visit-photo, .curation-head, .stock-head, .visit-head"
  );
  if (spark_reduce || !("IntersectionObserver" in window)) {
    spark_revealTargets.forEach((el) => el.classList.add("is-in"));
  } else {
    spark_revealTargets.forEach((el) => el.classList.add("reveal"));
    const spark_io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            spark_io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    spark_revealTargets.forEach((el) => spark_io.observe(el));
  }

  /* ---- 4. Lenis 부드러운 스크롤 + 앵커 이동 -------------------- */
  let spark_lenis = null;
  const spark_initLenis = () => {
    if (spark_reduce || typeof window.Lenis === "undefined") return;
    spark_lenis = new window.Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    const spark_raf = (time) => {
      spark_lenis.raf(time);
      requestAnimationFrame(spark_raf);
    };
    requestAnimationFrame(spark_raf);
    spark_lenis.on("scroll", spark_requestWeights);
  };

  document.querySelectorAll("[data-jump]").forEach((a) => {
    a.addEventListener("click", (ev) => {
      const id = a.getAttribute("href");
      if (!id || id.charAt(0) !== "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      ev.preventDefault();
      if (spark_lenis) spark_lenis.scrollTo(target, { offset: -64 });
      else {
        const y = target.getBoundingClientRect().top + window.pageYOffset - 64;
        window.scrollTo({ top: y, behavior: spark_reduce ? "auto" : "smooth" });
      }
    });
  });

  /* Lenis CDN 동적 로드 (선택적 향상) */
  if (!spark_reduce) {
    const spark_s = document.createElement("script");
    spark_s.src = "https://unpkg.com/@studio-freight/lenis@1.0.42/dist/lenis.min.js";
    spark_s.onload = spark_initLenis;
    document.head.appendChild(spark_s);
  }
})();
