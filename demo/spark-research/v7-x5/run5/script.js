/* TORIM — script.js
   Web Worker computational art metaphor:
   Gallery tiles reveal in a computed parallel-queue sequence,
   as if assigned to worker threads by grid position.
*/

(function () {
  'use strict';

  /* --- Nav: mobile toggle --- */
  const navToggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function () {
      const expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!expanded));
      mobileMenu.hidden = expanded;
      this.classList.toggle('is-open', !expanded);
      this.setAttribute('aria-label', expanded ? '메뉴 열기' : '메뉴 닫기');
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.hidden = true;
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-label', '메뉴 열기');
      });
    });
  }

  /* --- Nav: shrink on scroll --- */
  var nav = document.querySelector('.site-nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('nav--scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  /* --- Scroll Reveal: Computational Tile Assembly ---
     Simulates web worker thread assignment:
     Items are grouped by their column index (0, 1, 2...)
     acting as parallel processing queues. Items in the same
     column queue reveal nearly simultaneously; adjacent columns
     stagger by ~120ms — like worker threads draining in parallel.
  */
  var revealItems = document.querySelectorAll('.reveal-item');

  if (!revealItems.length) return;

  function computeThreadDelay(el) {
    var section = el.closest('section');
    if (!section) return 0;

    var siblings = Array.prototype.slice.call(
      section.querySelectorAll('.reveal-item')
    );
    var idx = siblings.indexOf(el);
    if (idx < 0) return 0;

    /* Assign to thread by column position */
    var containerW = section.offsetWidth || 1;
    var rect = el.getBoundingClientRect();
    var xRatio = (rect.left + window.scrollX) / containerW;
    var thread = Math.floor(xRatio * 3); /* 3 virtual threads */
    var queueDepth = Math.floor(idx / 3);

    return thread * 110 + queueDepth * 55;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var delay = computeThreadDelay(el);
      el.style.transitionDelay = delay + 'ms';
      el.classList.add('is-visible');
      observer.unobserve(el);
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  revealItems.forEach(function (item) {
    observer.observe(item);
  });

  /* --- Collage: subtle parallax on scroll (transform only, no top/left) --- */
  var tileA = document.querySelector('.tile--a');
  var tileB = document.querySelector('.tile--b');
  var tileD = document.querySelector('.tile--d');

  if (tileA && tileB) {
    var heroSection = document.querySelector('.hero');
    var ticking = false;

    function updateParallax() {
      if (!heroSection) return;
      var heroH = heroSection.offsetHeight;
      var scrollY = window.scrollY;
      if (scrollY > heroH) return;

      var factor = scrollY / heroH;
      tileA.style.transform = 'translateY(' + (factor * -30) + 'px)';
      tileB.style.transform = 'translateY(' + (factor * 20) + 'px)';
      if (tileD) {
        tileD.style.transform = 'rotate(-2.5deg) translateY(' + (factor * 15) + 'px)';
      }
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  /* --- Reduced motion: disable parallax --- */
  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq.matches) {
    if (tileA) tileA.style.transform = '';
    if (tileB) tileB.style.transform = '';
    if (tileD) tileD.style.transform = '';
  }

})();
