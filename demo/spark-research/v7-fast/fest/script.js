'use strict';

/* ─── TIMETABLE TABS ─────────────────────────────────────────────── */
(function initTabs() {
  const tabs = document.querySelectorAll('.tt-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.tt-panel').forEach(p => {
        p.hidden = true;
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      if (panel) panel.hidden = false;
    });
  });
})();

/* ─── MOBILE NAV ─────────────────────────────────────────────────── */
(function initMobileNav() {
  const btn = document.querySelector('.nav-hamburger');
  const menu = document.getElementById('nav-mobile');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    menu.hidden = open;
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      btn.setAttribute('aria-expanded', 'false');
      menu.hidden = true;
    });
  });
})();

/* ─── SCROLL REVEAL ──────────────────────────────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  els.forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 0.08 + 's';
    observer.observe(el);
  });
})();

/* ─── ACTIVE NAV ON SCROLL ───────────────────────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a, .nav-mobile a');

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.removeAttribute('aria-current');
            if (link.getAttribute('href') === '#' + entry.target.id) {
              link.setAttribute('aria-current', 'page');
            }
          });
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sections.forEach(s => observer.observe(s));
})();

/* ─── NEEDLE: ADD WILL-CHANGE ONLY WHILE PAGE IS VISIBLE ────────── */
(function manageWillChange() {
  const needles = document.querySelectorAll('.needle-wrap');
  document.addEventListener('visibilitychange', () => {
    needles.forEach(n => {
      n.style.willChange = document.hidden ? 'auto' : 'transform';
    });
  });
  needles.forEach(n => { n.style.willChange = 'transform'; });
})();
