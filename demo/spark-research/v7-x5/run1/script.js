'use strict';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── NAV: scroll state ─────────────────────────────── */
const header = document.querySelector('.site-header');

function onScroll() {
  header.classList.toggle('scrolled', window.scrollY > 48);
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();


/* ── NAV: mobile toggle ────────────────────────────── */
const navToggle = document.querySelector('.nav-toggle');
const siteNav   = document.querySelector('.site-nav');

navToggle.addEventListener('click', () => {
  const isOpen = siteNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

siteNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    siteNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});


/* ── SMOOTH SCROLL ─────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({
      behavior: reducedMotion ? 'instant' : 'smooth',
      block: 'start'
    });
  });
});


/* ── SCROLL REVEAL ─────────────────────────────────── */
const revealEls = document.querySelectorAll('.reveal');

if (reducedMotion) {
  revealEls.forEach(el => el.classList.add('visible'));
} else {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -32px 0px'
  });

  revealEls.forEach(el => observer.observe(el));
}


/* ── HERO PARALLAX (transform only) ───────────────── */
const heroRight = document.querySelector('.hero-right');

if (heroRight && !reducedMotion) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroRight.style.transform = `translateY(${y * 0.12}px)`;
  }, { passive: true });
}
