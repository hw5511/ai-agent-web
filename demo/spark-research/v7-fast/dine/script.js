/* 공명(共鳴) — script.js
   Performance: only transform / opacity change per frame.
   No layout-triggering properties animated.
*/

(function () {
  'use strict';

  /* ── NAV: scroll state ─────────────────────────────────── */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 60) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Mobile nav toggle ─────────────────────────────────── */
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      toggle.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', '메뉴 열기');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── Scroll reveal via IntersectionObserver ────────────── */
  const reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && reveals.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    reveals.forEach(el => observer.observe(el));
  } else {
    // Fallback: show all
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  /* ── Smooth anchor scroll (keyboard & click) ───────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Shift focus for accessibility
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  /* ── Reservation form: minimal UX ─────────────────────── */
  const form = document.querySelector('.res-form');
  if (form) {
    // Set min date to today
    const dateInput = form.querySelector('#res-date');
    if (dateInput) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm   = String(today.getMonth() + 1).padStart(2, '0');
      const dd   = String(today.getDate()).padStart(2, '0');
      dateInput.setAttribute('min', `${yyyy}-${mm}-${dd}`);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const submit = form.querySelector('.res-submit');
      if (!submit) return;

      // Validate required fields
      let valid = true;
      form.querySelectorAll('[required]').forEach(field => {
        if (!field.value.trim()) {
          valid = false;
          field.style.borderColor = 'rgba(220,80,80,0.7)';
          field.addEventListener('input', () => {
            field.style.borderColor = '';
          }, { once: true });
        }
      });

      if (!valid) return;

      // Simulate submission feedback (opacity state only)
      const originalText = submit.textContent;
      submit.textContent = '전송 중…';
      submit.disabled = true;
      submit.style.opacity = '0.6';

      setTimeout(() => {
        submit.textContent = '예약 신청이 완료되었습니다.';
        submit.style.opacity = '1';
        form.reset();
        setTimeout(() => {
          submit.textContent = originalText;
          submit.disabled = false;
        }, 3500);
      }, 1200);
    });
  }

  /* ── Stagger reveal delays for grid children ───────────── */
  // Apply incremental delay to .course-card and .value-item groups
  document.querySelectorAll('.courses-grid').forEach(grid => {
    grid.querySelectorAll('.reveal').forEach((card, i) => {
      card.style.transitionDelay = `${i * 0.1}s`;
    });
  });

  document.querySelectorAll('.phil-values').forEach(list => {
    list.querySelectorAll('.reveal').forEach((item, i) => {
      item.style.transitionDelay = `${0.1 + i * 0.1}s`;
    });
  });

})();
