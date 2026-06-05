'use strict';

// Mark JS as available (enables reveal animations, hides elements initially)
document.documentElement.classList.add('has-js');

// ─── COLOR FIELD STATE MACHINE ────────────────────────────────────────────────

const colorField = document.querySelector('.color-field');

const SECTION_STATES = {
  hero:    { bg: '#1C1008', theme: 'dark' },
  artist:  { bg: '#EDE4D3', theme: 'light' },
  gallery: { bg: '#1A1410', theme: 'dark' },
  process: { bg: '#B89870', theme: 'light' },
  classes: { bg: '#F0E8D5', theme: 'light' },
  footer:  { bg: '#DDD0B8', theme: 'light' },
};

function applyState(sectionId) {
  const state = SECTION_STATES[sectionId];
  if (!state || !colorField) return;
  colorField.style.backgroundColor = state.bg;
  document.body.setAttribute('data-theme', state.theme);
}

// IntersectionObserver: switch state when a section clears 30% visibility
const sectionEls = document.querySelectorAll('[data-section]');

const stateObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        applyState(entry.target.dataset.section);
      }
    });
  },
  { threshold: 0.28 }
);

sectionEls.forEach((el) => stateObserver.observe(el));

// Boot with hero state
applyState('hero');

// ─── REVEAL ANIMATIONS ────────────────────────────────────────────────────────

const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (prefersReducedMotion) {
  // Immediately make all reveals visible — no animation
  document.querySelectorAll('.reveal').forEach((el) => {
    el.classList.add('is-visible');
  });
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => {
    revealObserver.observe(el);
  });
}

// ─── MOBILE NAV ───────────────────────────────────────────────────────────────

const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!isExpanded));
    navLinks.classList.toggle('is-open');
    navToggle.setAttribute(
      'aria-label',
      isExpanded ? '메뉴 열기' : '메뉴 닫기'
    );
  });

  // Close nav on link click (smooth scroll takes over)
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('is-open');
      navToggle.setAttribute('aria-label', '메뉴 열기');
    });
  });

  // Close nav on outside click
  document.addEventListener('click', (e) => {
    if (
      navLinks.classList.contains('is-open') &&
      !navToggle.contains(e.target) &&
      !navLinks.contains(e.target)
    ) {
      navToggle.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('is-open');
      navToggle.setAttribute('aria-label', '메뉴 열기');
    }
  });
}
