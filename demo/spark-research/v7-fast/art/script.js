(function () {
  'use strict';

  // ─── Parallax: mouse moves hero SVG layers via transform (composite only) ───
  var hero = document.getElementById('hero');
  var pLayers = hero ? Array.from(hero.querySelectorAll('.p-layer')) : [];

  var mouseX = 0, mouseY = 0;
  var curX = 0, curY = 0;
  var rafId = null;

  function tickParallax() {
    curX += (mouseX - curX) * 0.055;
    curY += (mouseY - curY) * 0.055;

    for (var i = 0; i < pLayers.length; i++) {
      var factor = parseFloat(pLayers[i].dataset.parallax) || 0;
      pLayers[i].style.transform =
        'translate(' + (curX * factor).toFixed(2) + 'px,' +
                       (curY * factor).toFixed(2) + 'px)';
    }

    rafId = requestAnimationFrame(tickParallax);
  }

  function stopParallax() {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  function returnToCenter() {
    mouseX = 0;
    mouseY = 0;
    if (!rafId) rafId = requestAnimationFrame(tickParallax);
  }

  if (hero && pLayers.length) {
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      mouseX = e.clientX - r.left - r.width  * 0.5;
      mouseY = e.clientY - r.top  - r.height * 0.5;
      if (!rafId) rafId = requestAnimationFrame(tickParallax);
    });

    hero.addEventListener('mouseleave', returnToCenter);

    // Touch: gentle tilt on mobile
    hero.addEventListener('touchmove', function (e) {
      var t = e.touches[0];
      var r = hero.getBoundingClientRect();
      mouseX = (t.clientX - r.left - r.width  * 0.5) * 0.5;
      mouseY = (t.clientY - r.top  - r.height * 0.5) * 0.5;
      if (!rafId) rafId = requestAnimationFrame(tickParallax);
    }, { passive: true });

    hero.addEventListener('touchend', returnToCenter);
  }

  // ─── Scroll reveal via IntersectionObserver ────────────────────────────────
  var revealEls = Array.from(document.querySelectorAll('.reveal'));

  if (!revealEls.length) return;

  if (typeof IntersectionObserver === 'undefined') {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

  revealEls.forEach(function (el) { observer.observe(el); });

  // ─── Smooth-scroll nav links (respects reduced-motion pref) ───────────────
  var prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

}());
