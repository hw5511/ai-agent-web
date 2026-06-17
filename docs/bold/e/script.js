/* ============================================================
   GROOVE 회현 · BOLD / e
   - Lenis 부드러운 스크롤 + ScrollTrigger reveal (transform/opacity)
   - DARING 1: LP 그루브 트랙바 비선형 내비 (lenis.scrollTo)
   - DARING 2: 사운드 핸드셰이크 청음 입장 의식
   - VISUAL: Web Audio 미세 사운드 (기본 음소거, 토글 필수, 자동재생 없음)
   접두사: spark_
   ============================================================ */

const spark_reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Lenis + GSAP ticker ---------- */
let spark_lenis = null;
if (!spark_reduce && window.Lenis) {
  spark_lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    spark_lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => spark_lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    const spark_raf = (t) => { spark_lenis.raf(t); requestAnimationFrame(spark_raf); };
    requestAnimationFrame(spark_raf);
  }
}

/* ---------- 부드러운 이동 헬퍼 ---------- */
function spark_scrollTo(target) {
  const el = document.getElementById(target);
  if (!el) return;
  if (spark_lenis) {
    spark_lenis.scrollTo(el, { offset: 0, duration: 1.3 });
  } else {
    window.scrollTo({ top: el.offsetTop, behavior: spark_reduce ? "auto" : "smooth" });
  }
}

/* ============================================================
   Web Audio · 미세 브랜드 사운드 (기본 OFF)
   ============================================================ */
let spark_audioOn = false;
let spark_ctx = null;

function spark_ensureCtx() {
  if (!spark_ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) spark_ctx = new AC();
  }
  if (spark_ctx && spark_ctx.state === "suspended") spark_ctx.resume();
  return spark_ctx;
}

/* 짧은 톤 · 버튼별 고유 음색/주파수 */
function spark_tone(freq, dur, type, gainPeak) {
  if (!spark_audioOn) return;
  const ctx = spark_ensureCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type || "sine";
  osc.frequency.setValueAtTime(freq, now);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(gainPeak || 0.06, now + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, now + (dur || 0.18));
  osc.connect(g).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + (dur || 0.18) + 0.02);
}

/* 촉각 · 진동 패턴 (지원 기기에서만) */
function spark_buzz(pattern) {
  if (!spark_audioOn) return;
  if (navigator.vibrate) navigator.vibrate(pattern);
}

/* 버튼 종류별 고유 사운드 시그니처 */
function spark_sig(kind) {
  if (kind === "nav") { spark_tone(523.25, 0.12, "triangle", 0.05); spark_buzz(8); }
  else if (kind === "step") { spark_tone(440, 0.14, "sine", 0.06); spark_buzz([10, 20, 10]); }
  else if (kind === "confirm") {
    spark_tone(659.25, 0.16, "sine", 0.07);
    setTimeout(() => spark_tone(987.77, 0.22, "triangle", 0.06), 110);
    spark_buzz([14, 30, 14, 30, 40]);
  }
}

/* ---------- 사운드 토글 ---------- */
const spark_soundBtn = document.getElementById("sound-toggle");
if (spark_soundBtn) {
  spark_soundBtn.addEventListener("click", () => {
    spark_audioOn = !spark_audioOn;
    spark_soundBtn.setAttribute("aria-pressed", String(spark_audioOn));
    spark_soundBtn.setAttribute("aria-label", spark_audioOn ? "브랜드 사운드 끄기" : "브랜드 사운드 켜기");
    spark_soundBtn.querySelector(".ctrl-label").textContent = spark_audioOn ? "SOUND ON" : "SOUND OFF";
    if (spark_audioOn) { spark_ensureCtx(); spark_tone(392, 0.18, "sine", 0.06); }
  });
}

/* ============================================================
   DARING 1 · 그루브 트랙바 (비선형 내비 + 스크롤 동기)
   ============================================================ */
const spark_grooves = Array.from(document.querySelectorAll(".groove"));
spark_grooves.forEach((btn) => {
  btn.addEventListener("click", () => {
    spark_sig("nav");
    spark_scrollTo(btn.dataset.target);
  });
});

function spark_setActive(id) {
  spark_grooves.forEach((b) => b.classList.toggle("is-active", b.dataset.target === id));
}

const spark_sections = Array.from(document.querySelectorAll(".track"));
if (window.ScrollTrigger && !spark_reduce) {
  spark_sections.forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec,
      start: "top center",
      end: "bottom center",
      onToggle: (self) => { if (self.isActive) spark_setActive(sec.id); },
    });
  });
} else {
  /* reduced-motion / no GSAP: IntersectionObserver 폴백 */
  const spark_io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) spark_setActive(e.target.id); });
  }, { rootMargin: "-45% 0px -45% 0px" });
  spark_sections.forEach((s) => spark_io.observe(s));
}
if (spark_sections[0]) spark_setActive(spark_sections[0].id);

/* ============================================================
   reveal · data-rhythm 그룹의 자식을 리듬감 있게 (stagger)
   ============================================================ */
const spark_rhythmGroups = Array.from(document.querySelectorAll("[data-rhythm]"));
if (window.gsap && window.ScrollTrigger && !spark_reduce) {
  spark_rhythmGroups.forEach((group) => {
    const kids = Array.from(group.children);
    gsap.to(kids, {
      opacity: 1,
      y: 0,
      duration: 0.85,
      ease: "power3.out",
      stagger: 0.09,
      scrollTrigger: { trigger: group, start: "top 80%" },
    });
  });
} else {
  /* 폴백: 즉시 가시화 */
  spark_rhythmGroups.forEach((group) => {
    Array.from(group.children).forEach((k) => { k.style.opacity = "1"; k.style.transform = "none"; });
  });
}

/* ============================================================
   DARING 2 · 사운드 핸드셰이크 청음 입장 의식
   3단계 진입: 시작 → 톤암 정렬 → 입장 확정
   ============================================================ */
const spark_hs = document.getElementById("handshake");
const spark_hsBtn = document.getElementById("hs-btn");
const spark_hsStatus = document.getElementById("hs-status");
const spark_hsLabel = spark_hsBtn ? spark_hsBtn.querySelector(".hs-btn-label") : null;
const spark_hsNodes = Array.from(document.querySelectorAll(".hs-node"));

const spark_hsScript = [
  { label: "톤암을 정렬하는 중", status: "신호를 맞추는 중입니다… 잠시만요." },
  { label: "청음실 자리 확인", status: "부스 한 자리를 확보했습니다. 한 번 더 눌러 입장하세요." },
  { label: "입장 확정", status: "환영합니다. 듣고 싶은 판을 들고 청음실로 오세요." },
];

let spark_hsStep = 0;
let spark_hsBusy = false;

function spark_fillNode(i) {
  if (spark_hsNodes[i]) spark_hsNodes[i].classList.add("filled");
}

if (spark_hsBtn) {
  spark_hsBtn.addEventListener("click", (e) => {
    if (spark_hsBusy || spark_hs.classList.contains("is-done")) return;

    /* 버튼 표면 리플 (transform/opacity만) */
    spark_hsRipple(e);
    spark_sig("step");
    spark_hsBusy = true;
    spark_hsBtn.setAttribute("disabled", "");

    const cur = spark_hsScript[spark_hsStep];
    spark_hsStatus.textContent = cur.status;
    spark_fillNode(spark_hsStep);

    const delay = spark_reduce ? 60 : 720;
    setTimeout(() => {
      spark_hsStep += 1;
      if (spark_hsStep >= spark_hsScript.length) {
        spark_hs.classList.add("is-done");
        spark_hsLabel.textContent = "입장 완료";
        spark_sig("confirm");
        spark_hsBtn.setAttribute("aria-disabled", "true");
      } else {
        spark_hsLabel.textContent = spark_hsScript[spark_hsStep].label;
        spark_hsBtn.removeAttribute("disabled");
        spark_hsBusy = false;
      }
    }, delay);
  });
}

function spark_hsRipple(e) {
  if (spark_reduce || !window.gsap) return;
  const r = spark_hsBtn.querySelector(".hs-ripple");
  if (!r) return;
  const rect = spark_hsBtn.getBoundingClientRect();
  const x = (e.clientX || rect.left + rect.width / 2) - rect.left;
  const y = (e.clientY || rect.top + rect.height / 2) - rect.top;
  gsap.set(r, { left: x, top: y, xPercent: -50, yPercent: -50, scale: 0, opacity: 0.6 });
  gsap.to(r, { scale: 16, opacity: 0, duration: 0.7, ease: "power2.out" });
}

/* ---------- 큐레이션 카드: 키보드 사운드 피드백 ---------- */
Array.from(document.querySelectorAll(".lp")).forEach((card) => {
  card.addEventListener("mouseenter", () => spark_tone(330 + Math.random() * 40, 0.09, "triangle", 0.03));
});
