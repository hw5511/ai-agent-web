/* ═══════════════════════════════════════════════════════════════
   토림 TORIM · script.js
   SURPRISE: 키네틱 타이포그래피 · 마우스가 히어로 두 줄을 반대 방향으로 밀어
             "흙을 빚는" 압력 메타포를 실현 (CHOSEN_MECHANISM: lb-110 반영)
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── Reduced motion guard ─── */
  const spark_rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── GSAP plugin registration ─── */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ─── Lenis smooth scroll ─── */
  let spark_lenis = null;

  if (!spark_rm && typeof Lenis !== 'undefined') {
    spark_lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    });
    spark_lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => spark_lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ─── Scroll progress bar ─── */
  const spark_progressBar = document.getElementById('scrollBar');

  ScrollTrigger.create({
    trigger: 'body',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      if (spark_progressBar) {
        spark_progressBar.style.transform = `scaleX(${self.progress})`;
      }
    }
  });

  /* ─── Header opacity on scroll ─── */
  const spark_header = document.getElementById('siteHeader');
  const spark_heroSection = document.querySelector('.section-hero');

  if (spark_header && spark_heroSection) {
    ScrollTrigger.create({
      trigger: spark_heroSection,
      start: 'bottom 72px',
      onEnter: () => spark_header.classList.add('header--solid'),
      onLeaveBack: () => spark_header.classList.remove('header--solid')
    });
  }

  /* ─── Side indicator: update on section enter ─── */
  const spark_sideText = document.getElementById('sideText');
  const spark_sections = document.querySelectorAll('[data-section]');

  spark_sections.forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 60%',
      end: 'bottom 40%',
      onEnter: () => {
        if (spark_sideText) spark_sideText.textContent = section.dataset.section;
      },
      onEnterBack: () => {
        if (spark_sideText) spark_sideText.textContent = section.dataset.section;
      }
    });
  });

  /* ─── SURPRISE: 키네틱 타이포그래피 · Hero parallax interaction
       두 줄이 마우스 위치에 따라 반대 방향으로 미세하게 이동.
       흙을 빚는 압력 메타포. lerp 0.04 = 매우 부드러운 지연 ─── */
  const spark_heroLine1 = document.getElementById('heroLine1');
  const spark_heroLine2 = document.getElementById('heroLine2');

  const spark_mouse = { x: 0.5, y: 0.5 };
  const spark_cur   = { x: 0.5, y: 0.5 };

  if (!spark_rm && spark_heroSection) {
    spark_heroSection.addEventListener('mousemove', (e) => {
      const rect = spark_heroSection.getBoundingClientRect();
      spark_mouse.x = (e.clientX - rect.left) / rect.width;
      spark_mouse.y = (e.clientY - rect.top)  / rect.height;
    });

    spark_heroSection.addEventListener('mouseleave', () => {
      spark_mouse.x = 0.5;
      spark_mouse.y = 0.5;
    });
  }

  /* ─── Reveal animations via GSAP ScrollTrigger ─── */
  if (!spark_rm) {
    const spark_revealItems = document.querySelectorAll('.reveal-item');

    spark_revealItems.forEach((item) => {
      const delay = parseFloat(item.dataset.delay || '0') * 0.1;

      gsap.fromTo(
        item,
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          delay,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 87%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    /* Process steps: staggered left slide */
    const spark_steps = document.querySelectorAll('.process-step');

    spark_steps.forEach((step) => {
      const idx = parseInt(step.dataset.stepIdx || '0', 10);

      gsap.fromTo(
        step,
        { opacity: 0, x: -18 },
        {
          opacity: 1,
          x: 0,
          duration: 0.75,
          delay: idx * 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: step,
            start: 'top 89%',
            toggleActions: 'play none none none'
          }
        }
      );
    });
  }

  /* ─── GSAP ticker: hero parallax ─── */
  if (!spark_rm) {
    gsap.ticker.add(() => {
      const lerpFactor = 0.04;
      spark_cur.x += (spark_mouse.x - spark_cur.x) * lerpFactor;
      spark_cur.y += (spark_mouse.y - spark_cur.y) * lerpFactor;

      const dx = (spark_cur.x - 0.5) * 22;
      const dy = (spark_cur.y - 0.5) * 12;

      if (spark_heroLine1) {
        spark_heroLine1.style.transform = `translate(${dx * 0.65}px, ${dy * 0.45}px)`;
      }
      if (spark_heroLine2) {
        /* Second line moves opposite horizontal: pinch/spread of clay */
        spark_heroLine2.style.transform = `translate(${dx * -0.45}px, ${dy * 0.25}px)`;
      }
    });
  }

  /* ─── Mobile navigation toggle ─── */
  const spark_navToggle = document.getElementById('navToggle');
  const spark_mobileMenu = document.getElementById('mobileMenu');

  if (spark_navToggle && spark_mobileMenu) {
    spark_navToggle.addEventListener('click', () => {
      const isExpanded = spark_navToggle.getAttribute('aria-expanded') === 'true';
      spark_navToggle.setAttribute('aria-expanded', String(!isExpanded));
      spark_mobileMenu.hidden = isExpanded;
    });

    spark_mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        spark_mobileMenu.hidden = true;
        spark_navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ─── Smooth anchor scrolling ─── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetSelector = anchor.getAttribute('href');
      if (!targetSelector || targetSelector === '#') return;

      const targetEl = document.querySelector(targetSelector);
      if (!targetEl) return;

      e.preventDefault();

      if (spark_lenis) {
        spark_lenis.scrollTo(targetEl, { offset: -72 });
      } else {
        window.scrollTo({
          top: targetEl.getBoundingClientRect().top + window.scrollY - 72,
          behavior: 'smooth'
        });
      }

      /* Close mobile menu if open */
      if (spark_mobileMenu && !spark_mobileMenu.hidden) {
        spark_mobileMenu.hidden = true;
        spark_navToggle?.setAttribute('aria-expanded', 'false');
      }
    });
  });

  /* ─── Gallery: touch-friendly caption reveal ─── */
  const spark_galleryItems = document.querySelectorAll('.gallery-item');

  spark_galleryItems.forEach((item) => {
    item.addEventListener('focus', () => {
      const caption = item.querySelector('figcaption');
      if (caption) caption.style.opacity = '1';
    });
    item.addEventListener('blur', () => {
      const caption = item.querySelector('figcaption');
      if (caption) caption.style.opacity = '';
    });
  });

})();
