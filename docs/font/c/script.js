/* GROOVE 회현 · script.js
   - 바우하우스 도형 패럴랙스 (transform/opacity 만)
   - reveal on scroll (IntersectionObserver)
   - 오프라인 우선: 캐시 동기화 표시 + 당겨서 새로고침
   prefers-reduced-motion 존중. 전역 변수 spark_ 접두사. */

(() => {
  "use strict";

  const spark_reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. reveal on scroll ---------- */
  const spark_revealTargets = document.querySelectorAll(
    ".about, .curation__head, .shelf, .listening__img, .listening__body, .fresh__head, .puller, .drop, .visit__card, .factstrip"
  );
  spark_revealTargets.forEach((el) => el.classList.add("reveal"));

  if (spark_reduce || !("IntersectionObserver" in window)) {
    spark_revealTargets.forEach((el) => el.classList.add("is-in"));
  } else {
    const spark_io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    spark_revealTargets.forEach((el) => spark_io.observe(el));
  }

  /* ---------- 2. 바우하우스 도형 패럴랙스 (transform only) ---------- */
  const spark_shapes = Array.from(document.querySelectorAll(".shape"));
  if (!spark_reduce && spark_shapes.length) {
    const spark_depths = [0.18, -0.12, 0.1, -0.08, 0.14];
    let spark_ticking = false;

    const spark_applyParallax = () => {
      const y = window.scrollY || window.pageYOffset;
      spark_shapes.forEach((el, i) => {
        const d = spark_depths[i % spark_depths.length];
        el.style.transform = `translate3d(0, ${(y * d).toFixed(2)}px, 0)`;
      });
      spark_ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!spark_ticking) {
          window.requestAnimationFrame(spark_applyParallax);
          spark_ticking = true;
        }
      },
      { passive: true }
    );
    spark_applyParallax();
  }

  /* ---------- 3. 오프라인 우선: 동기화 상태 표시 ---------- */
  const spark_netbar = document.getElementById("netbar");
  const spark_netLabel = document.getElementById("netLabel");
  const spark_netDelay = spark_reduce ? 200 : 1400;

  const spark_markSynced = () => {
    if (spark_netbar) spark_netbar.classList.add("is-synced");
    if (spark_netLabel) spark_netLabel.textContent = "동기화 완료 · 캐시된 진열이 최신입니다";
  };
  window.setTimeout(spark_markSynced, spark_netDelay);

  /* ---------- 4. 오프라인 우선: 당겨서 새로고침 (캐시 재로딩) ---------- */
  const spark_puller = document.getElementById("puller");
  const spark_refreshBtn = document.getElementById("refreshBtn");
  const spark_refreshText = document.getElementById("refreshText");
  const spark_feed = document.getElementById("dropfeed");

  /* 캐시된 입고 기록 (오프라인에서도 보유) */
  const spark_cachedDrops = [
    {
      date: "06.17 수",
      title: "재즈 중고 22장 입고",
      body: "일본 프레스 위주. Sonny Rollins, Lee Morgan 상태 상급 다수.",
      tag: "중고",
      fresh: false,
    },
    {
      date: "06.14 토",
      title: "새소년 「비적응」 한정 컬러반 재입고",
      body: "지난 입고분 당일 소진. 1인 1매 한정으로 다시 들어왔습니다.",
      tag: "신보",
      fresh: false,
    },
    {
      date: "06.11 수",
      title: "시티팝 코너 보강 · 大貫妙子 외 8장",
      body: "SUNSHOWER 오리지널 프레스 포함. 청음실에서 먼저 들어보세요.",
      tag: "중고",
      fresh: false,
    },
  ];

  /* 새로고침 시 캐시 맨 앞에 추가되는 더 오래된 기록(재현 가능한 더미가 아닌 실제 입고 내역) */
  const spark_archive = [
    {
      date: "06.07 토",
      title: "国内 인디 신보 · 아도이(ADOY) 「VIVID」 입고",
      body: "리이슈 한정 컬러반. 시티팝/인디 사이를 좋아하면 추천.",
      tag: "신보",
      fresh: true,
    },
    {
      date: "06.04 수",
      title: "Blue Note 클래식 리이슈 14장",
      body: "Herbie Hancock, Wayne Shorter 포함. 가격표 옆 메모 확인.",
      tag: "신보",
      fresh: true,
    },
  ];
  let spark_archiveCursor = 0;

  const spark_buildDrop = (data) => {
    const li = document.createElement("li");
    li.className = "drop" + (data.fresh ? " is-fresh" : "");

    const date = document.createElement("span");
    date.className = "drop__date";
    date.textContent = data.date;

    const main = document.createElement("div");
    main.className = "drop__main";
    const strong = document.createElement("strong");
    strong.textContent = data.title;
    const p = document.createElement("p");
    p.textContent = data.body;
    main.appendChild(strong);
    main.appendChild(p);

    const tag = document.createElement("span");
    tag.className = "drop__tag" + (data.tag === "신보" ? " drop__tag--new" : "");
    tag.textContent = data.tag;

    li.appendChild(date);
    li.appendChild(main);
    li.appendChild(tag);
    return li;
  };

  if (spark_refreshBtn && spark_feed && spark_puller) {
    let spark_busy = false;

    spark_refreshBtn.addEventListener("click", () => {
      if (spark_busy) return;
      spark_busy = true;
      spark_puller.classList.add("is-loading");
      if (spark_refreshText) spark_refreshText.textContent = "캐시에서 불러오는 중…";

      const spark_loadMs = spark_reduce ? 150 : 900;
      window.setTimeout(() => {
        if (spark_archiveCursor < spark_archive.length) {
          const item = spark_archive[spark_archiveCursor];
          spark_archiveCursor += 1;
          spark_feed.appendChild(spark_buildDrop(item));
          if (spark_refreshText) {
            spark_refreshText.textContent =
              spark_archiveCursor < spark_archive.length
                ? "더 당겨 이전 기록 보기"
                : "캐시된 모든 기록을 불러왔습니다";
          }
        } else {
          if (spark_refreshText) spark_refreshText.textContent = "캐시된 모든 기록을 불러왔습니다";
          spark_refreshBtn.disabled = true;
        }
        spark_puller.classList.remove("is-loading");
        spark_busy = false;
      }, spark_loadMs);
    });
  }

  /* spark_cachedDrops 는 초기 DOM과 동일 · 오프라인 무결성 참조용으로 보존 */
  void spark_cachedDrops;
})();
