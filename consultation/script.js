(function() {
  'use strict';

  // ===== Track toggle =====
  var body = document.body;
  var tabs = document.querySelectorAll('[data-track-tab]');
  var chooseCards = document.querySelectorAll('[data-track-choose]');

  function setTrack(track, opts) {
    opts = opts || {};
    if (track !== 'basic' && track !== 'advanced') track = 'basic';
    body.classList.remove('track-basic', 'track-advanced');
    body.classList.add('track-' + track);

    tabs.forEach(function(btn) {
      var on = btn.getAttribute('data-track-tab') === track;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });

    if (opts.updateHash !== false) {
      try { history.replaceState(null, '', '#' + track); } catch(e) { location.hash = track; }
    }
    if (opts.scrollTo) {
      var target = document.getElementById(opts.scrollTo);
      if (target) {
        var tabbar = document.getElementById('trackTabbar');
        var off = tabbar ? tabbar.offsetHeight : 0;
        var y = target.getBoundingClientRect().top + window.pageYOffset - off - 8;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
    // 트랙 전환 시 새로 보이는 reveal 다시 트리거 가능하도록
    setTimeout(triggerInViewport, 50);
  }

  tabs.forEach(function(btn) {
    btn.addEventListener('click', function() {
      setTrack(btn.getAttribute('data-track-tab'), { scrollTo: 'curriculum-' + btn.getAttribute('data-track-tab') });
    });
  });

  chooseCards.forEach(function(card) {
    card.addEventListener('click', function(e) {
      e.preventDefault();
      setTrack(card.getAttribute('data-track-choose'), { scrollTo: 'intro' });
    });
  });

  // 초기 트랙: URL hash 우선
  var initial = (location.hash || '').replace('#', '');
  setTrack(initial === 'advanced' ? 'advanced' : 'basic', { updateHash: false });

  window.addEventListener('hashchange', function() {
    var h = (location.hash || '').replace('#', '');
    if (h === 'basic' || h === 'advanced') setTrack(h, { updateHash: false });
  });

  // ===== Reveal animations =====
  var revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  function observeReveals() {
    document.querySelectorAll('.reveal:not(.visible), .reveal-children:not(.visible)').forEach(function(el) {
      revealObserver.observe(el);
    });
  }

  function triggerInViewport() {
    document.querySelectorAll('.reveal:not(.visible), .reveal-children:not(.visible)').forEach(function(el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0 && el.offsetParent !== null) {
        el.classList.add('visible');
      }
    });
  }

  observeReveals();

  // Hero reveal on load
  var heroEls = document.querySelectorAll('.hero-section .reveal, .hero-section .reveal-children');
  var delays = [0, 150, 300, 450, 600];
  heroEls.forEach(function(el, i) {
    setTimeout(function() { el.classList.add('visible'); }, delays[i] || i * 120);
  });

  // ===== Sticky tabbar — scroll direction dim =====
  var tabbar = document.getElementById('trackTabbar');
  if (tabbar) {
    var lastY = window.pageYOffset;
    var ticking = false;
    var DELTA = 8;       // jitter 방지 임계값
    var TOP_GUARD = 80;  // 상단 근처에서는 항상 활성

    function evalDim() {
      var y = window.pageYOffset;
      if (Math.abs(y - lastY) < DELTA) { ticking = false; return; }
      if (y < TOP_GUARD) {
        tabbar.classList.remove('is-dimmed');
      } else if (y > lastY) {
        tabbar.classList.add('is-dimmed');     // scrolling down
      } else {
        tabbar.classList.remove('is-dimmed');  // scrolling up
      }
      lastY = y;
      ticking = false;
    }

    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(evalDim);
        ticking = true;
      }
    }, { passive: true });
  }

  // ===== Example preview modal =====
  (function() {
    var exModal = document.getElementById('exModal');
    if (!exModal) return;
    var exFrame = document.getElementById('exModalFrame');
    var exTitle = document.getElementById('exModalTitle');
    var exOpen  = document.getElementById('exModalOpen');
    function openEx(src, title) {
      exFrame.src = src; exTitle.textContent = title || ''; exOpen.href = src;
      exModal.classList.add('open'); exModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function closeEx() {
      exModal.classList.remove('open'); exModal.setAttribute('aria-hidden', 'true');
      exFrame.src = 'about:blank'; document.body.style.overflow = '';
    }
    document.querySelectorAll('.example-card').forEach(function(c) {
      c.addEventListener('click', function() { openEx(c.getAttribute('data-ex'), c.getAttribute('data-title')); });
      c.addEventListener('keydown', function(e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEx(c.getAttribute('data-ex'), c.getAttribute('data-title')); } });
    });
    exModal.querySelectorAll('[data-close]').forEach(function(b) { b.addEventListener('click', closeEx); });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && exModal.classList.contains('open')) closeEx(); });
  })();

})();
