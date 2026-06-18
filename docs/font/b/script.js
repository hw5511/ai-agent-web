(() => {
  'use strict';

  const spark_reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const spark_platter = document.querySelector('[data-rig] .platter');
  const spark_hud = document.querySelector('[data-hud]');
  const spark_hudTag = document.querySelector('[data-hud-scene]');
  const spark_hudTitle = document.querySelector('[data-hud-title]');
  const spark_hudMeta = document.querySelector('[data-hud-meta]');
  const spark_scenes = Array.from(document.querySelectorAll('.scene'));
  const spark_indices = Array.from(document.querySelectorAll('.si'));

  /* 장면별 무대 설정 · 스크롤 진행에 따라 transform/opacity만 바뀐다 */
  const spark_stageConfig = [
    { rotZ: 0,   spin: 0,  tilt: 58, tag: 'SCANNING',  title: 'GROOVE 회현',   meta: '회현역 뒷골목 · vinyl only' },
    { rotZ: 90,  spin: 1,  tilt: 50, tag: 'CRATE A1',  title: '재즈 / 시티팝',  meta: '중고 VG+ · 신보 큐레이션' },
    { rotZ: 180, spin: 1,  tilt: 42, tag: 'GROOVE SCAN', title: '청음실 가동중', meta: 'SL-1200 MK7 · 한 면 20분' },
    { rotZ: 270, spin: 0,  tilt: 56, tag: 'NEW IN',     title: '이번 주 입고',  meta: '한정 컬러반 · B1 매대' }
  ];

  let spark_current = -1;

  const spark_applyScene = (i) => {
    if (i === spark_current) return;
    spark_current = i;
    const c = spark_stageConfig[i] || spark_stageConfig[0];
    if (spark_platter && !spark_reduce) {
      spark_platter.style.transform =
        `translate(-50%,-50%) rotateX(${c.tilt}deg) rotateZ(${c.rotZ}deg)`;
      spark_platter.style.transition = 'transform 1s cubic-bezier(.22,.61,.36,1)';
    }
    if (spark_hudTag) spark_hudTag.textContent = c.tag;
    if (spark_hudTitle) spark_hudTitle.textContent = c.title;
    if (spark_hudMeta) spark_hudMeta.textContent = c.meta;
    spark_indices.forEach((el, k) => el.classList.toggle('on', k === i));
  };

  /* 어느 장면이 화면 중앙에 있는지 판정 + reveal */
  const spark_io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        const idx = parseInt(e.target.dataset.scene, 10);
        if (e.intersectionRatio > 0.5) spark_applyScene(idx);
      }
    });
  }, { threshold: [0.15, 0.5, 0.75] });

  spark_scenes.forEach((s) => spark_io.observe(s));
  spark_applyScene(0);

  /* AR HUD · 마우스 추적 (transform만, rAF로 스로틀) */
  const spark_stage = document.querySelector('.stage');
  let spark_mx = 0, spark_my = 0, spark_raf = null;

  const spark_track = () => {
    spark_raf = null;
    if (spark_hud) {
      spark_hud.style.transform =
        `translate(calc(-50% + ${spark_mx}px), calc(-50% + ${spark_my}px))`;
    }
  };

  if (spark_stage && !spark_reduce) {
    window.addEventListener('mousemove', (ev) => {
      const r = spark_stage.getBoundingClientRect();
      // 마우스를 무대 중심 기준 작은 오프셋으로 변환 (증강 추적 느낌)
      spark_mx = ((ev.clientX - (r.left + r.width / 2)) / r.width) * 36;
      spark_my = ((ev.clientY - (r.top + r.height / 2)) / r.height) * 36;
      if (!spark_raf) spark_raf = requestAnimationFrame(spark_track);
    }, { passive: true });
  }

  /* 그루브 인스펙터 · 미시적 관찰: 호버 위치로 매크로 확대 */
  const spark_scope = document.querySelector('[data-scope]');
  const spark_scopeGr = document.querySelector('.scope-grooves');
  if (spark_scope && spark_scopeGr && !spark_reduce) {
    let spark_srf = null, spark_px = 0, spark_py = 0, spark_active = false;
    const spark_render = () => {
      spark_srf = null;
      const scale = spark_active ? 2.4 : 1;
      spark_scopeGr.style.transform =
        `translate(${spark_px}px, ${spark_py}px) scale(${scale})`;
    };
    spark_scope.addEventListener('mousemove', (ev) => {
      const r = spark_scope.getBoundingClientRect();
      spark_active = true;
      spark_px = ((r.left + r.width / 2) - ev.clientX) * 0.5;
      spark_py = ((r.top + r.height / 2) - ev.clientY) * 0.5;
      if (!spark_srf) spark_srf = requestAnimationFrame(spark_render);
    }, { passive: true });
    spark_scope.addEventListener('mouseleave', () => {
      spark_active = false; spark_px = 0; spark_py = 0;
      if (!spark_srf) spark_srf = requestAnimationFrame(spark_render);
    });
  }
})();
