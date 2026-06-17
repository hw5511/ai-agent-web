/* =========================================================
   GROOVE 회현 · script.js
   INTERACTION: 영웅 여정 · 챕터를 한 칸씩 해금(unlock)하는 비선형 탐험
   PERF LAW: transform/opacity만. GSAP x/y, scrub:1+, Lenis.
   ========================================================= */
(() => {
  "use strict";

  const spark_reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const spark_chapters = Array.from(document.querySelectorAll(".chapter"));
  const spark_trailSteps = Array.from(document.querySelectorAll(".trail-step"));
  const spark_foundEl = document.getElementById("found");

  /* ---- 해금 상태 (영웅 여정) ---- */
  let spark_maxUnlocked = 0;          // 지금까지 해금된 최고 단계
  const spark_total = 5;              // 해금 가능한 챕터 수 (1~5)
  const spark_discovered = new Set([0]);

  function spark_updateCount() {
    const n = Math.min(spark_discovered.size - 1, spark_total); // 입구(0) 제외
    if (spark_foundEl) spark_foundEl.textContent = String(Math.max(0, n));
  }

  function spark_unlock(step) {
    if (step <= spark_maxUnlocked) return;
    spark_maxUnlocked = step;
    const li = spark_trailSteps[step];
    if (li) {
      li.classList.add("unlocked");
      const btn = li.querySelector(".trail-dot");
      if (btn) btn.disabled = false;
    }
  }

  function spark_setActive(step) {
    spark_trailSteps.forEach((li, i) => li.classList.toggle("active", i === step));
  }

  function spark_reveal(section) {
    if (!section || section.classList.contains("revealed")) return;
    section.classList.add("revealed");
    const step = Number(section.dataset.step || 0);
    if (step > 0) {
      spark_unlock(step);
      spark_discovered.add(step);
      spark_updateCount();
    }
  }

  /* ---- reduced motion: 전부 즉시 해금/표시 ---- */
  if (spark_reduce) {
    spark_chapters.forEach((s) => s.classList.add("revealed"));
    spark_trailSteps.forEach((li) => {
      li.classList.add("unlocked");
      const b = li.querySelector(".trail-dot");
      if (b) b.disabled = false;
    });
    spark_maxUnlocked = spark_total;
    for (let i = 0; i <= spark_total; i++) spark_discovered.add(i);
    spark_updateCount();
  }

  /* ---- Lenis + GSAP 부트 (CDN defer 이후) ---- */
  function spark_boot() {
    const hasGsap = typeof window.gsap !== "undefined";
    const hasLenis = typeof window.Lenis !== "undefined";
    const hasST = hasGsap && typeof window.ScrollTrigger !== "undefined";

    let spark_lenis = null;

    if (hasLenis && !spark_reduce) {
      spark_lenis = new window.Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      if (hasST) {
        spark_lenis.on("scroll", window.ScrollTrigger.update);
        window.gsap.ticker.add((time) => spark_lenis.raf(time * 1000));
        window.gsap.ticker.lagSmoothing(0);
      } else {
        const raf = (t) => { spark_lenis.raf(t); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);
      }
    }

    /* ---- 챕터 reveal: 해금형. ScrollTrigger 우선, 폴백 IO ---- */
    if (hasST && !spark_reduce) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      spark_chapters.forEach((sec) => {
        window.ScrollTrigger.create({
          trigger: sec,
          start: "top 72%",
          once: true,
          onEnter: () => spark_reveal(sec),
        });
        // 활성 단계 추적(채도 트레일)
        window.ScrollTrigger.create({
          trigger: sec,
          start: "top 50%",
          end: "bottom 50%",
          onToggle: (self) => { if (self.isActive) spark_setActive(Number(sec.dataset.step || sec.id.replace("ch-", ""))); },
        });
      });

      /* 카드/뉴스 개별 stagger (transform/opacity만) */
      const items = document.querySelectorAll("[data-card], .news-item");
      items.forEach((el) => {
        el.classList.add("will");
        window.ScrollTrigger.create({
          trigger: el,
          start: "top 86%",
          once: true,
          onEnter: () => el.classList.add("in"),
        });
      });
    } else if (!spark_reduce && "IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            if (e.target.classList.contains("chapter")) spark_reveal(e.target);
            else e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.18 });
      spark_chapters.forEach((s) => io.observe(s));
      document.querySelectorAll("[data-card], .news-item").forEach((el) => io.observe(el));
    }

    /* ---- 트레일 점프 (해금된 곳만) ---- */
    function spark_goto(id) {
      const target = document.getElementById(id);
      if (!target) return;
      const step = Number(target.dataset.step || 0);
      if (step > spark_maxUnlocked) return; // 잠긴 곳은 못 감
      if (spark_lenis) spark_lenis.scrollTo(target, { offset: -10 });
      else window.scrollTo({ top: target.offsetTop - 10, behavior: spark_reduce ? "auto" : "smooth" });
    }

    document.querySelectorAll("[data-go]").forEach((btn) => {
      btn.addEventListener("click", () => spark_goto(btn.dataset.go));
    });

    /* ---- 컬렉션: 절반만 드러난 본문 토글 (의도된 불친절) ---- */
    document.querySelectorAll("[data-reveal]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const card = btn.closest("[data-card]");
        if (!card) return;
        const open = card.classList.toggle("open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        btn.textContent = open ? "절반을 다시 덮기" : "나머지 절반 보기";
      });
    });

    /* 입구는 항상 보이게 */
    const entry = document.getElementById("ch-0");
    if (entry) entry.classList.add("revealed");
    spark_unlock(1); // 첫 단계는 진입 즉시 해금
    spark_setActive(0);
    spark_updateCount();
  }

  if (document.readyState === "complete") spark_boot();
  else window.addEventListener("load", spark_boot);
})();
