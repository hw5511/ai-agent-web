/* GROOVE 회현 · 가로 홀을 세로 스크롤로 구동.
   THE LAW: 매 프레임 transform/opacity만. var 금지, 고유 접두사 spark_. */

(() => {
  "use strict";

  const spark_reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const spark_mobile = window.matchMedia("(max-width: 860px)").matches;

  document.body.classList.add("js-on");

  /* ---------- 1. 의식(儀式)형 청음 폼: 전략적 마찰 ----------
     모션/스크롤 라이브러리와 무관하게 항상 작동 (JS만 필요). */
  const spark_initRite = () => {
    const form = document.getElementById("rite");
    if (!form) return;

    const stages = Array.from(form.querySelectorAll(".rite-stage"));
    const doneBox = form.querySelector(".rite-done");
    const backBtn = form.querySelector(".rite-back");
    const summary = document.getElementById("rite-summary");
    const answers = { genre: "", mood: "", who: "", when: "" };
    let spark_cur = 0;

    const showStage = (idx) => {
      stages.forEach((s, i) => { s.hidden = i !== idx; });
      backBtn.hidden = idx === 0;
      const firstFocus = stages[idx].querySelector("button, input");
      if (firstFocus) firstFocus.focus({ preventScroll: true });
    };

    // 선택형 마찰: 고르면 잠시 머문 뒤 다음 물음으로
    form.querySelectorAll(".rite-pick").forEach((btn) => {
      btn.addEventListener("click", () => {
        const name = btn.dataset.name;
        answers[name] = btn.dataset.value;
        const group = btn.closest(".rite-choices");
        group.querySelectorAll(".rite-pick").forEach((b) => {
          b.classList.remove("is-chosen");
          b.setAttribute("aria-checked", "false");
        });
        btn.classList.add("is-chosen");
        btn.setAttribute("aria-checked", "true");
        if (spark_cur < stages.length - 1) {
          const delay = spark_reduce ? 0 : 360;
          window.setTimeout(() => {
            spark_cur += 1;
            showStage(spark_cur);
          }, delay);
        }
      });
      btn.setAttribute("role", "radio");
      btn.setAttribute("aria-checked", "false");
    });

    backBtn.addEventListener("click", () => {
      if (spark_cur > 0) { spark_cur -= 1; showStage(spark_cur); }
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const who = form.querySelector('[name="who"]').value.trim();
      const when = form.querySelector('[name="when"]').value.trim();
      if (!who || !when) {
        const empty = !who ? form.querySelector('[name="who"]') : form.querySelector('[name="when"]');
        empty.focus();
        return;
      }
      answers.who = who; answers.when = when;
      stages.forEach((s) => { s.hidden = true; });
      backBtn.hidden = true;
      const g = answers.genre || "아직 못 정한";
      const m = answers.mood ? `, ${answers.mood} 마음으로` : "";
      summary.textContent =
        `${who} 님, ${answers.when}에 ${g} 한 장을 위해${m} 한 자리를 비워 두었습니다.`;
      doneBox.hidden = false;
      doneBox.focus?.();
    });

    showStage(0);
  };

  spark_initRite();

  /* ---------- 2. 가로 홀 구동 + 인덱스 ---------- */
  const spark_initMotion = () => {
    const hall = document.getElementById("hall");
    const rooms = Array.from(document.querySelectorAll(".room"));
    const atlasBtns = Array.from(document.querySelectorAll(".atlas-btn"));
    const meterFill = document.querySelector(".meter-fill");
    const hasGsap = window.gsap && window.ScrollTrigger;

    // reveal 즉시 복원 (모션 최소화 시)
    const reveals = Array.from(document.querySelectorAll(".reveal"));
    if (spark_reduce) {
      reveals.forEach((el) => { el.style.opacity = "1"; el.style.transform = "none"; });
    }

    // 인덱스 현재 표시
    const setCurrent = (idx) => {
      atlasBtns.forEach((b, i) => {
        const on = i === idx;
        b.classList.toggle("is-current", on);
        if (on) b.setAttribute("aria-current", "true");
        else b.removeAttribute("aria-current");
      });
    };

    /* --- 모바일/라이브러리 부재: 세로 폴백. 인덱스만 연결 --- */
    if (spark_mobile || !hasGsap) {
      atlasBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const idx = parseInt(btn.dataset.go, 10);
          const target = rooms[idx];
          if (target) {
            const top = target.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({ top, behavior: spark_reduce ? "auto" : "smooth" });
          }
        });
      });
      // 세로 폴백 reveal
      if (!spark_reduce && "IntersectionObserver" in window) {
        reveals.forEach((el) => { el.style.opacity = "0"; });
        const io = new IntersectionObserver((entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              en.target.style.transition = "opacity .7s ease, transform .7s ease";
              en.target.style.opacity = "1";
              en.target.style.transform = "none";
              io.unobserve(en.target);
            }
          });
        }, { threshold: 0.18 });
        reveals.forEach((el) => io.observe(el));
      }
      // 세로 스크롤로 인덱스 갱신
      if ("IntersectionObserver" in window) {
        const roomIo = new IntersectionObserver((entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) setCurrent(rooms.indexOf(en.target));
          });
        }, { threshold: 0.5 });
        rooms.forEach((r) => roomIo.observe(r));
      }
      return;
    }

    /* --- 데스크톱: Lenis + 가로 변환 --- */
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);

    let lenis = null;
    if (window.Lenis) {
      lenis = new window.Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    // 가로 거리: 마지막 룸이 화면 왼쪽 정렬될 때까지
    const getDistance = () => hall.scrollWidth - window.innerWidth;

    const horizontal = gsap.to(hall, {
      x: () => -getDistance(),
      ease: "none",
      scrollTrigger: {
        trigger: hall,
        start: "top top",
        end: () => "+=" + getDistance(),
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (meterFill) meterFill.style.transform = "scaleX(" + self.progress + ")";
          const idx = Math.round(self.progress * (rooms.length - 1));
          setCurrent(idx);
        },
      },
    });

    // 인덱스 클릭 = 해당 룸으로 비선형 이동
    const distAt = (idx) => {
      const frac = rooms.length > 1 ? idx / (rooms.length - 1) : 0;
      return horizontal.scrollTrigger.start +
        frac * (horizontal.scrollTrigger.end - horizontal.scrollTrigger.start);
    };
    atlasBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.go, 10);
        const y = distAt(idx);
        if (lenis) lenis.scrollTo(y, { duration: 1.1 });
        else window.scrollTo({ top: y, behavior: "auto" });
      });
    });

    // 룸 내부 콘텐츠 reveal · 가로 진입 시 (transform/opacity only)
    if (!spark_reduce) {
      // 자동 reveal 대상 지정
      const markReveal = (sel, room) => {
        room.querySelectorAll(sel).forEach((el) => el.classList.add("reveal"));
      };
      rooms.forEach((room) => {
        markReveal(".room-h, .room-inner > *, .gallery-head > *, .plinth, .listen-left > *, .ledger-row, .access-list, .access-close, .access-sig, .news-foot", room);
      });
      const fresh = Array.from(document.querySelectorAll(".reveal"));
      fresh.forEach((el) => { el.style.opacity = "0"; el.style.transform = "translateY(26px)"; });

      rooms.forEach((room) => {
        const items = room.querySelectorAll(".reveal");
        if (!items.length) return;
        gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: "power2.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: room,
            containerAnimation: horizontal,
            start: "left 78%",
            toggleActions: "play none none reverse",
          },
        });
      });

      // 영원한 찰나: 색 띠의 영구 미세 표류 (정지 같은 움직임)
      gsap.utils.toArray(".field-band").forEach((band, i) => {
        gsap.to(band, {
          xPercent: i % 2 === 0 ? 4 : -4,
          opacity: 0.7,
          duration: 7 + i * 1.6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
      // 입구 힌트 라인 박동
      const hintLine = document.querySelector(".entry-hint-line");
      if (hintLine) {
        gsap.fromTo(hintLine, { scaleX: 0.3 }, { scaleX: 1, duration: 1.6, repeat: -1, yoyo: true, ease: "sine.inOut" });
      }
    }

    window.addEventListener("resize", () => ScrollTrigger.refresh());
  };

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", spark_initMotion);
  } else {
    spark_initMotion();
  }
})();
