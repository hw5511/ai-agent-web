(() => {
  "use strict";

  const spark_reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Lenis smooth scroll ---------- */
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

  /* anchor -> lenis.scrollTo (no scrollIntoView) */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (spark_lenis) spark_lenis.scrollTo(target, { offset: -20 });
      else target.scrollTo?.();
    });
  });

  /* ---------- reveals ---------- */
  const spark_reveals = Array.from(document.querySelectorAll(".reveal"));
  if (spark_reduce || !window.gsap) {
    spark_reveals.forEach((el) => { el.style.opacity = "1"; el.style.transform = "none"; });
  } else {
    spark_reveals.forEach((el) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    });

    /* platter rotates + tonearm drops as you scroll the intro (scrub:1, transform only) */
    const spark_platter = document.getElementById("platter");
    const spark_tonearm = document.getElementById("tonearm");
    if (spark_platter) {
      gsap.fromTo(spark_platter, { rotate: 0 }, {
        rotate: 220,
        ease: "none",
        scrollTrigger: { trigger: ".intro", start: "top top", end: "bottom top", scrub: 1 },
      });
    }
    if (spark_tonearm) {
      gsap.fromTo(spark_tonearm, { rotate: -22 }, {
        rotate: -7,
        ease: "none",
        scrollTrigger: { trigger: ".intro", start: "top 70%", end: "bottom top", scrub: 1 },
      });
    }
  }

  /* ---------- new-arrivals horizontal rail loop ---------- */
  const spark_rail = document.getElementById("rail");
  if (spark_rail && !spark_reduce && window.gsap) {
    /* duplicate cards so the loop is seamless */
    const spark_originals = Array.from(spark_rail.children);
    spark_originals.forEach((node) => spark_rail.appendChild(node.cloneNode(true)));
    const spark_half = spark_rail.scrollWidth / 2;
    const spark_railTween = gsap.to(spark_rail, {
      x: -spark_half,
      duration: 28,
      ease: "none",
      repeat: -1,
      modifiers: { x: (x) => `${parseFloat(x) % spark_half}px` },
    });
    spark_rail.parentElement.addEventListener("mouseenter", () => spark_railTween.timeScale(0.2));
    spark_rail.parentElement.addEventListener("mouseleave", () => spark_railTween.timeScale(1));
  }

  /* ---------- VISUAL/INTERACTION SPARK: synesthetic sound + haptic ----------
     공감각적 브랜딩 · a short warm "needle drop" chord on toggle / sleeve focus.
     손끝의 실재감 · navigator.vibrate haptic where supported. Off by default. */
  let ui_audioOn = false;
  let ui_ctx = null;

  const ui_haptic = (ms) => {
    if (ui_audioOn && navigator.vibrate) navigator.vibrate(ms);
  };

  const ui_tone = (freq, when, dur, gainPeak) => {
    if (!ui_ctx) return;
    const osc = ui_ctx.createOscillator();
    const gain = ui_ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const t0 = ui_ctx.currentTime + when;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(gainPeak, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(ui_ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  };

  /* a soft minor-7th "groove" sound logo */
  const ui_soundLogo = () => {
    if (!ui_audioOn || !ui_ctx) return;
    [329.63, 392.0, 493.88, 587.33].forEach((f, i) => ui_tone(f, i * 0.06, 0.55, 0.07));
  };

  const ui_pluck = () => {
    if (!ui_audioOn || !ui_ctx) return;
    ui_tone(523.25, 0, 0.22, 0.05);
  };

  const ui_toggle = document.getElementById("soundToggle");
  const ui_label = document.getElementById("soundLabel");
  if (ui_toggle) {
    ui_toggle.addEventListener("click", () => {
      ui_audioOn = !ui_audioOn;
      ui_toggle.setAttribute("aria-pressed", String(ui_audioOn));
      ui_toggle.setAttribute("aria-label", ui_audioOn ? "청음 사운드 끄기" : "청음 사운드 켜기");
      if (ui_label) ui_label.textContent = ui_audioOn ? "청음 켜짐" : "청음 켜기";
      if (ui_audioOn) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC && !ui_ctx) ui_ctx = new AC();
        if (ui_ctx && ui_ctx.state === "suspended") ui_ctx.resume();
        ui_haptic(18);
        ui_soundLogo();
      } else {
        ui_haptic(8);
      }
    });
  }

  /* sleeve focus/hover = subtle pluck + micro-haptic (손끝의 실재감) */
  document.querySelectorAll(".sleeve").forEach((sleeve) => {
    const fire = () => { ui_pluck(); ui_haptic(6); };
    sleeve.addEventListener("mouseenter", fire);
    sleeve.addEventListener("focusin", fire);
  });
})();
