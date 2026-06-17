/* ============================================================
   GROOVE 회현 · BOLD
   INTERACTION: 무게와 탄성 (관성 + 스프링 잔향)
   VISUAL: 가짜 광택 MatCap Materials
   THE LAW: 매 프레임 transform/opacity만.
   ============================================================ */
import * as THREE from "three";

const spark_reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Lenis + GSAP ticker (SKILL 표준) ---------- */
const spark_lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});
spark_lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => spark_lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
gsap.registerPlugin(ScrollTrigger);

/* ============================================================
   DARING_MOVE 1 · MatCap 광택 LP 오브젝트
   미리 렌더된 구형 MatCap 텍스처(정적 이미지)로 금속 질감.
   드래그 시 각속도 관성 + 놓으면 스프링 잔향으로 천천히 멈춤.
   ============================================================ */
function spark_initDisc() {
  const app_canvas = document.getElementById("disc-canvas");
  const app_stage = document.getElementById("disc-stage");
  if (!app_canvas || !app_stage) return;

  const app_renderer = new THREE.WebGLRenderer({
    canvas: app_canvas,
    antialias: true,
    alpha: true,
  });
  app_renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const app_scene = new THREE.Scene();
  const app_cam = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  app_cam.position.set(0, 0, 6.2);

  // MatCap 텍스처: 정적 SVG 데이터 URI (구형 금속/유리 광택 그라디언트)
  const app_matSrc =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'>
        <defs>
          <radialGradient id='g' cx='38%' cy='32%' r='75%'>
            <stop offset='0%' stop-color='#fbfdff'/>
            <stop offset='22%' stop-color='#d7e3ef'/>
            <stop offset='50%' stop-color='#8fa6bd'/>
            <stop offset='74%' stop-color='#3c5066'/>
            <stop offset='100%' stop-color='#16202c'/>
          </radialGradient>
          <radialGradient id='hot' cx='70%' cy='78%' r='40%'>
            <stop offset='0%' stop-color='#e9c98a' stop-opacity='.9'/>
            <stop offset='100%' stop-color='#e9c98a' stop-opacity='0'/>
          </radialGradient>
        </defs>
        <circle cx='128' cy='128' r='128' fill='url(#g)'/>
        <circle cx='128' cy='128' r='128' fill='url(#hot)'/>
      </svg>`
    );

  const app_loader = new THREE.TextureLoader();
  const app_matcap = app_loader.load(app_matSrc);
  app_matcap.colorSpace = THREE.SRGBColorSpace;

  const app_labelTex = app_loader.load(
    "https://picsum.photos/seed/groove-lp/256/256"
  );
  app_labelTex.colorSpace = THREE.SRGBColorSpace;

  const app_group = new THREE.Group();
  app_scene.add(app_group);

  // LP 본체 (검은 비닐 디스크) · MatCap 광택
  const app_vinyl = new THREE.Mesh(
    new THREE.CylinderGeometry(2.4, 2.4, 0.06, 96),
    new THREE.MeshMatcapMaterial({ matcap: app_matcap, color: 0x222a33 })
  );
  app_vinyl.rotation.x = Math.PI / 2;
  app_group.add(app_vinyl);

  // 가운데 라벨
  const app_label = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 0.85, 0.07, 64),
    new THREE.MeshBasicMaterial({ map: app_labelTex })
  );
  app_label.rotation.x = Math.PI / 2;
  app_group.add(app_label);

  // 그루브 링 (얇은 금속 링 몇 개로 홈 표현)
  for (let i = 0; i < 5; i++) {
    const r = 1.1 + i * 0.26;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.012, 8, 96),
      new THREE.MeshMatcapMaterial({ matcap: app_matcap, color: 0x5a6b7d })
    );
    app_group.add(ring);
  }

  // 약간의 기울임 · 비대칭 무게감
  app_group.rotation.x = -0.5;
  app_group.rotation.z = 0.18;

  // ---- 물리: 각속도(velocity) + 관성 마찰 + 스프링 잔향 ----
  const app_phys = {
    velY: 0.006, // 평상시 천천히 회전 (질량 있는 듯)
    velX: 0,
    targetTiltX: -0.5,
    dragging: false,
    lastX: 0,
    lastY: 0,
  };

  function resize() {
    const w = app_stage.clientWidth;
    const h = app_stage.clientHeight;
    if (w === 0 || h === 0) return;
    app_renderer.setSize(w, h, false);
    app_cam.aspect = w / h;
    app_cam.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  // 드래그: 포인터 이동량 → 각속도 주입 (관성)
  function pointerDown(e) {
    app_phys.dragging = true;
    app_phys.lastX = e.clientX;
    app_phys.lastY = e.clientY;
    app_canvas.setPointerCapture(e.pointerId);
  }
  function pointerMove(e) {
    if (!app_phys.dragging) return;
    const dx = e.clientX - app_phys.lastX;
    const dy = e.clientY - app_phys.lastY;
    app_phys.velY += dx * 0.0009; // 좌우 → 회전 가속
    app_phys.velX += dy * 0.0006; // 상하 → 기울임 가속
    app_phys.lastX = e.clientX;
    app_phys.lastY = e.clientY;
  }
  function pointerUp() {
    app_phys.dragging = false;
  }
  app_canvas.addEventListener("pointerdown", pointerDown);
  app_canvas.addEventListener("pointermove", pointerMove);
  app_canvas.addEventListener("pointerup", pointerUp);
  app_canvas.addEventListener("pointercancel", pointerUp);

  // 렌더 루프 · three 내부 transform만, DOM layout 없음
  let app_rafActive = true;
  function frame() {
    if (!app_rafActive) return;
    requestAnimationFrame(frame);

    // 관성: 마찰로 서서히 감속, 평상 회전속도로 복귀
    if (!app_phys.dragging) {
      app_phys.velY += (0.006 - app_phys.velY) * 0.012; // 기준 회전으로 스프링 복귀
      app_phys.velX *= 0.9; // 기울임 잔향 감쇠
    } else {
      app_phys.velY *= 0.96;
      app_phys.velX *= 0.96;
    }

    app_group.rotation.y += app_phys.velY;

    // 기울임: 스프링 잔향 (놓아도 미세히 흔들리다 멈춤)
    app_group.rotation.x += app_phys.velX;
    app_group.rotation.x += (app_phys.targetTiltX - app_group.rotation.x) * 0.04;

    app_renderer.render(app_scene, app_cam);
  }
  if (spark_reduce) {
    // 모션 최소화: 정지 렌더 1회
    app_phys.velY = 0;
    app_renderer.render(app_scene, app_cam);
  } else {
    frame();
  }

  // 화면 밖이면 루프 정지 (성능)
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (spark_reduce) return;
        if (en.isIntersecting && !app_rafActive) {
          app_rafActive = true;
          frame();
        } else if (!en.isIntersecting) {
          app_rafActive = false;
        }
      });
    },
    { threshold: 0.01 }
  );
  io.observe(app_stage);
}

/* ============================================================
   DARING_MOVE 2 · 무게추 내비 + 스프링 잔향 reveal
   요소가 무게(translateY)에서 스프링 easing으로 떨어져 자리잡고
   멈춘 뒤 미세히 흔들린다. 무거운 매대일수록 둔하게.
   ============================================================ */
function spark_initReveals() {
  if (spark_reduce) return;

  // data-spring 요소: 스프링 잔향으로 진입
  gsap.utils.toArray("[data-spring]").forEach((el, i) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1.1,
      ease: "elastic.out(0.65, 0.55)", // 잔향 스프링
      scrollTrigger: { trigger: el, start: "top 88%" },
      delay: (i % 3) * 0.04,
    });
  });

  // crate: 무게(data-mass)에 따라 다른 진입 · 무거울수록 덜 튀고 늦게
  const massEase = {
    heavy: { y: 24, dur: 1.0, ease: "power3.out", rot: 0 },
    medium: { y: 40, dur: 1.05, ease: "back.out(1.4)", rot: -1 },
    light: { y: 60, dur: 1.15, ease: "elastic.out(0.8, 0.5)", rot: -2 },
  };
  gsap.utils.toArray(".crate").forEach((el) => {
    const m = massEase[el.dataset.mass] || massEase.medium;
    gsap.fromTo(
      el,
      { opacity: 0, y: m.y, rotation: m.rot },
      {
        opacity: 1,
        y: 0,
        rotation: 0,
        duration: m.dur,
        ease: m.ease,
        scrollTrigger: { trigger: ".shelf", start: "top 82%" },
      }
    );
  });

  // VISIT 거대 워드마크 · 스크롤 무게 패럴랙스 (transform만)
  gsap.to(".visit__bigword", {
    xPercent: -8,
    ease: "none",
    scrollTrigger: {
      trigger: ".visit",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
    },
  });
}

/* ---------- 무게추 내비: 활성 표시 + lenis 이동 ---------- */
function spark_initNav() {
  const app_items = Array.from(document.querySelectorAll(".scale-nav__item"));

  app_items.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.target;
      const el = document.getElementById(id);
      if (el) spark_lenis.scrollTo(el, { offset: -20, duration: 1.4 });
    });
  });

  // 현재 섹션 → 점 활성
  const app_sections = ["philosophy", "collection", "listening", "arrivals", "visit"];
  app_sections.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    ScrollTrigger.create({
      trigger: el,
      start: "top 55%",
      end: "bottom 55%",
      onToggle: (self) => {
        const btn = app_items.find((b) => b.dataset.target === id);
        if (btn) btn.classList.toggle("is-active", self.isActive);
      },
    });
  });
}

/* ---------- init ---------- */
spark_initDisc();
spark_initReveals();
spark_initNav();
ScrollTrigger.refresh();
