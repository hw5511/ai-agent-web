// GROOVE 회현 · 감정의 열쇠 가게
// 전역 접두사 spark_ , const/let only, scrollIntoView 금지
(() => {
  'use strict';

  const spark_reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const spark_keys = Array.from(document.querySelectorAll('.spark-key'));
  const spark_sections = Array.from(document.querySelectorAll('.spark-lock'));

  // 열쇠 hue를 CSS 변수로 주입 (호버/포커스 색)
  spark_keys.forEach((key) => {
    const hue = key.getAttribute('data-hue') || '60';
    key.style.setProperty('--hue', hue);
  });
  // 섹션 인덱스 외곽선 hue
  spark_sections.forEach((sec) => {
    const hue = sec.getAttribute('data-hue') || '85';
    sec.style.setProperty('--idx-hue', hue);
  });

  const spark_hasGsap = typeof window.gsap !== 'undefined';
  const spark_hasLenis = typeof window.Lenis !== 'undefined';
  const spark_hasST = spark_hasGsap && typeof window.ScrollTrigger !== 'undefined';

  // ===== Lenis 부드러운 스크롤 =====
  let spark_lenis = null;
  if (spark_hasLenis && !spark_reduce) {
    spark_lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    if (spark_hasST) {
      spark_lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => spark_lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const spark_raf = (time) => { spark_lenis.raf(time); requestAnimationFrame(spark_raf); };
      requestAnimationFrame(spark_raf);
    }
  }

  // ===== 열쇠고리 내비: 클릭 시 lenis.scrollTo + 열쇠 회전(피크 모먼트) =====
  const spark_goTo = (target) => {
    if (!target) return;
    if (spark_lenis) {
      spark_lenis.scrollTo(target, { offset: 0, duration: 1.1 });
    } else {
      const top = target.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top, behavior: spark_reduce ? 'auto' : 'smooth' });
    }
  };

  spark_keys.forEach((key) => {
    key.addEventListener('click', (e) => {
      const id = key.getAttribute('href');
      if (!id || id.charAt(0) !== '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      // 클릭한 열쇠를 즉시 "돌림" · 자물쇠가 열리는 촉각적 피드백 (피크)
      key.classList.add('is-turned');
      spark_goTo(target);
    });
  });

  // ===== 현재 섹션에 맞춰 해당 열쇠를 돌려놓기 =====
  const spark_setActive = (id) => {
    spark_keys.forEach((key) => {
      const turned = key.getAttribute('href') === '#' + id;
      key.classList.toggle('is-turned', turned);
    });
  };

  if (spark_hasST && !spark_reduce) {
    spark_sections.forEach((sec) => {
      ScrollTrigger.create({
        trigger: sec,
        start: 'top center',
        end: 'bottom center',
        onToggle: (self) => { if (self.isActive) spark_setActive(sec.id); },
      });
    });
  } else if ('IntersectionObserver' in window) {
    const spark_io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) spark_setActive(en.target.id); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    spark_sections.forEach((sec) => spark_io.observe(sec));
  }

  // ===== reveal 애니메이션 (transform/opacity만) =====
  const spark_revealTargets = document.querySelectorAll(
    '.spark-lock__body > *, .spark-lock__plate, .spark-genre, .spark-stock__item, .spark-visit, .spark-final > *'
  );

  if (spark_reduce) {
    // 모션 최소화: 즉시 가시 상태
    spark_revealTargets.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; });
  } else if (spark_hasST) {
    spark_revealTargets.forEach((el) => el.classList.add('spark-reveal'));
    spark_revealTargets.forEach((el) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });

    // ===== 무지개 프리즘 시차 (transform만, blur는 정적이지만 레이어 전체 이동은 GPU 합성) =====
    const spark_bands = gsap.utils.toArray('.spark-band');
    spark_bands.forEach((band, i) => {
      const dir = i % 2 === 0 ? 1 : -1;
      gsap.to(band, {
        yPercent: 12 * dir,
        xPercent: 5 * dir,
        ease: 'none',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1 },
      });
    });

    // ===== 입구 키홀: 스크롤 시작하면 빛이 차오름 (opacity만) =====
    const spark_keyhole = document.querySelector('.spark-gate__keyhole');
    if (spark_keyhole) {
      gsap.fromTo(spark_keyhole, { opacity: 0.5 }, {
        opacity: 0.85, ease: 'none',
        scrollTrigger: { trigger: '.spark-gate', start: 'top top', end: 'bottom top', scrub: 1 },
      });
    }
  } else if ('IntersectionObserver' in window) {
    spark_revealTargets.forEach((el) => el.classList.add('spark-reveal'));
    const spark_rio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.style.transition = 'opacity .8s ease, transform .8s ease';
          en.target.style.opacity = '1';
          en.target.style.transform = 'none';
          spark_rio.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    spark_revealTargets.forEach((el) => spark_rio.observe(el));
  } else {
    spark_revealTargets.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; });
  }

  // ===== 마우스 따라 프리즘 미세 반응 (데스크톱, transform만) =====
  if (!spark_reduce && window.matchMedia('(pointer:fine)').matches) {
    const spark_prism = document.querySelector('.spark-prism');
    let spark_tx = 0, spark_ty = 0, spark_cx = 0, spark_cy = 0, spark_raf2 = 0;
    const spark_loop = () => {
      spark_cx += (spark_tx - spark_cx) * 0.06;
      spark_cy += (spark_ty - spark_cy) * 0.06;
      if (spark_prism) spark_prism.style.transform = `translate3d(${spark_cx}px, ${spark_cy}px, 0)`;
      spark_raf2 = requestAnimationFrame(spark_loop);
    };
    window.addEventListener('mousemove', (e) => {
      spark_tx = (e.clientX / window.innerWidth - 0.5) * 26;
      spark_ty = (e.clientY / window.innerHeight - 0.5) * 26;
    }, { passive: true });
    spark_raf2 = requestAnimationFrame(spark_loop);
  }
})();
