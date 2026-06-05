/* ============================================================
   NOCTURNE — script.js
   Color field state machine + reveal + nav
   ============================================================ */

(function () {
  'use strict';

  /* ── Color field state ───────────────────────────────────
     IntersectionObserver flips body[data-scene] attribute.
     CSS transitions on .field-layer opacity handle crossfade.
     Only opacity changes — composite-only, PERF LAW compliant.
  ──────────────────────────────────────────────────────── */
  var SCENES = ['hero', 'philosophy', 'collection', 'process', 'store'];

  var sceneObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && SCENES.indexOf(entry.target.id) !== -1) {
        document.body.dataset.scene = entry.target.id;
      }
    });
  }, { threshold: 0.38 });

  SCENES.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) sceneObs.observe(el);
  });

  /* ── Reveal on scroll ────────────────────────────────── */
  var REVEAL_SELECTORS = [
    '.section-title',
    '.phil-text',
    '.brand-values',
    '.frag-card',
    '.step-item',
    '.store-address-block',
    '.atelier-photo',
    '.reservation-wrap',
    '.process-diagram-wrap',
    '.hero-text',
    '.scroll-indicator'
  ].join(', ');

  var revealEls = document.querySelectorAll(REVEAL_SELECTORS);

  revealEls.forEach(function (el) {
    el.classList.add('reveal');
  });

  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  revealEls.forEach(function (el) {
    revealObs.observe(el);
  });

  /* Staggered cards */
  var cards = document.querySelectorAll('.frag-card');
  var cardObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var idx = 0;
        cards.forEach(function (c, i) { if (c === entry.target) idx = i; });
        var delay = idx * 90;
        setTimeout(function () {
          entry.target.classList.add('in-view');
        }, delay);
        cardObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  cards.forEach(function (el) { cardObs.observe(el); });

  /* ── Mobile navigation ───────────────────────────────── */
  var toggle  = document.querySelector('.nav-toggle');
  var closeBtn = document.querySelector('.nav-close');
  var nav     = document.querySelector('.main-nav');

  function openNav() {
    if (!nav) return;
    nav.classList.add('nav-open');
    toggle && toggle.setAttribute('aria-expanded', 'true');
    toggle && toggle.setAttribute('aria-label', '메뉴 닫기');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    if (!nav) return;
    nav.classList.remove('nav-open');
    toggle && toggle.setAttribute('aria-expanded', 'false');
    toggle && toggle.setAttribute('aria-label', '메뉴 열기');
    document.body.style.overflow = '';
  }

  if (toggle) toggle.addEventListener('click', function () {
    nav.classList.contains('nav-open') ? closeNav() : openNav();
  });

  if (closeBtn) closeBtn.addEventListener('click', closeNav);

  nav && nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeNav);
  });

  /* Close on Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  /* ── Reservation form ────────────────────────────────── */
  var form = document.querySelector('.res-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('.res-submit');
      if (!btn) return;
      btn.textContent = '예약 문의가 접수되었습니다.';
      btn.disabled = true;
    });
  }

}());
