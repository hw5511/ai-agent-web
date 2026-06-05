'use strict';

/* ============================================================
   이안 관측소 (夷安) — script.js
   MECHANISM: 타입·이미지 스크램블 / FLIP 셔플
   THEME: 맥락적 동적 (현재 시각 기반)
   ============================================================ */

/* ----------------------------------------------------------
   1. CONTEXTUAL DYNAMIC THEME
   Sets CSS custom properties once at load based on local hour.
   No per-frame changes — safe.
   ---------------------------------------------------------- */
(function applyTheme() {
  const hour = new Date().getHours();
  const root = document.documentElement;

  const themes = {
    dawn: {           // 05-07 새벽 마감
      '--sky-top':      '#040210',
      '--sky-mid':      '#0a0618',
      '--sky-bot':      '#160b28',
      '--hglow':        'rgba(120, 55, 155, 0.2)',
      '--accent':       '#c49fcc',
      '--accent-faint': 'rgba(196, 159, 204, 0.22)',
      '--blue':         '#a0b0d8',
      '--green':        '#c49fcc',
      label: '새벽 마감',
    },
    day: {            // 07-18 낮 대기
      '--sky-top':      '#080a16',
      '--sky-mid':      '#0e1020',
      '--sky-bot':      '#12162a',
      '--hglow':        'rgba(50, 70, 110, 0.1)',
      '--accent':       '#9a9070',
      '--accent-faint': 'rgba(154, 144, 112, 0.2)',
      '--blue':         '#6090a8',
      '--green':        '#78987a',
      label: '낮 대기',
    },
    dusk: {           // 18-21 준비 모드
      '--sky-top':      '#040108',
      '--sky-mid':      '#08040e',
      '--sky-bot':      '#120818',
      '--hglow':        'rgba(155, 75, 35, 0.25)',
      '--accent':       '#c8905a',
      '--accent-faint': 'rgba(200, 144, 90, 0.22)',
      '--blue':         '#90a8c0',
      '--green':        '#c8905a',
      label: '관측 준비',
    },
    night: {          // 21-05 관측 모드
      '--sky-top':      '#010107',
      '--sky-mid':      '#02050e',
      '--sky-bot':      '#05091a',
      '--hglow':        'rgba(96, 72, 32, 0.14)',
      '--accent':       '#b4a97b',
      '--accent-faint': 'rgba(180, 169, 123, 0.22)',
      '--blue':         '#7fb3c8',
      '--green':        '#4caf7a',
      label: '관측 모드',
    },
  };

  let key = 'night';
  if (hour >= 5 && hour < 7)   key = 'dawn';
  else if (hour >= 7 && hour < 18) key = 'day';
  else if (hour >= 18 && hour < 21) key = 'dusk';

  const t = themes[key];
  Object.entries(t).forEach(([prop, val]) => {
    if (prop.startsWith('--')) root.style.setProperty(prop, val);
  });

  const chip = document.getElementById('theme-label');
  if (chip) chip.textContent = t.label;
})();

/* ----------------------------------------------------------
   2. DATE DISPLAY
   ---------------------------------------------------------- */
(function setDate() {
  const el = document.getElementById('dash-date');
  if (!el) return;
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  el.textContent = `${y}.${m}.${d}`;
})();

/* ----------------------------------------------------------
   3. TYPE SCRAMBLE
   Progressively reveals text from randomized characters.
   Only mutates textContent — zero layout changes.
   ---------------------------------------------------------- */
const CHARS = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz가나다라마바사아자차카타파하기니디리미비시이지치키티피히';

function scramble(el, finalText, duration) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = finalText;
    return;
  }

  let startTs = null;
  const len = finalText.length;

  function tick(ts) {
    if (!startTs) startTs = ts;
    const prog = Math.min((ts - startTs) / duration, 1);
    const revealN = Math.floor(prog * len);
    let out = '';

    for (let i = 0; i < len; i++) {
      const ch = finalText[i];
      if (ch === ' ' || ch === '.' || ch === '%' || ch === 'k' || ch === 'm') {
        out += i < revealN ? ch : CHARS[Math.floor(Math.random() * CHARS.length)];
      } else if (i < revealN) {
        out += ch;
      } else {
        out += CHARS[Math.floor(Math.random() * CHARS.length)];
      }
    }

    el.textContent = out;
    if (prog < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

function initScramble() {
  const els = document.querySelectorAll('[data-scramble]');
  els.forEach((el, i) => {
    const target = el.getAttribute('data-scramble');
    const delay = 400 + i * 180;
    const dur = 900 + i * 80;
    setTimeout(() => scramble(el, target, dur), delay);
  });
}

/* ----------------------------------------------------------
   4. IMAGE SHUFFLE — FLIP technique (transform only)
   Reorders DOM, computes inverse transforms, then plays to
   natural positions. Only uses transform — no layout/paint.
   ---------------------------------------------------------- */
function flipShuffle(grid) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const items = Array.from(grid.querySelectorAll('.obs-card'));
  if (items.length < 2) return;

  // FIRST: record current bounding rects (all reads before writes)
  const firstRects = items.map(el => el.getBoundingClientRect());

  // Shuffle DOM order (Fisher-Yates)
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    grid.insertBefore(arr[j], arr[i]);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  // LAST: read new positions (after DOM reorder)
  const lastRects = items.map(el => el.getBoundingClientRect());

  // INVERT: apply reversed transforms so elements appear to be in their old positions
  // Enable will-change only during animation, remove after
  items.forEach((el, i) => {
    const dx = firstRects[i].left - lastRects[i].left;
    const dy = firstRects[i].top - lastRects[i].top;
    el.style.willChange = 'transform';
    el.style.transition = 'none';
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  });

  // Force reflow so the inverted positions are painted
  void grid.offsetHeight;

  // PLAY: animate to final (natural) positions
  items.forEach(el => {
    el.style.transition = 'transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)';
    el.style.transform = '';
  });

  // Clean up after animation completes
  setTimeout(() => {
    items.forEach(el => {
      el.style.willChange = '';
      el.style.transition = '';
    });
  }, 750);
}

function initShuffle() {
  const btn = document.getElementById('shuffle-btn');
  const grid = document.getElementById('obs-grid');
  if (!btn || !grid) return;

  let busy = false;
  btn.addEventListener('click', () => {
    if (busy) return;
    busy = true;
    flipShuffle(grid);
    setTimeout(() => { busy = false; }, 800);
  });
}

/* ----------------------------------------------------------
   5. SCROLL REVEAL — IntersectionObserver
   ---------------------------------------------------------- */
function initReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Make everything visible immediately
    document.querySelectorAll('.reveal').forEach(el => {
      el.classList.add('visible');
    });
    return;
  }

  const els = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
}

/* ----------------------------------------------------------
   6. NAV DRAWER
   ---------------------------------------------------------- */
function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const drawer = document.querySelector('.nav-drawer');
  const closeBtn = drawer && drawer.querySelector('.nav-close');

  if (!toggle || !drawer) return;

  function open() {
    drawer.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    closeBtn && closeBtn.focus();
  }

  function close() {
    drawer.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.focus();
  }

  toggle.addEventListener('click', () => {
    drawer.classList.contains('open') ? close() : open();
  });

  closeBtn && closeBtn.addEventListener('click', close);

  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', close);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) close();
  });

  document.addEventListener('click', (e) => {
    if (drawer.classList.contains('open') &&
        !drawer.contains(e.target) &&
        !toggle.contains(e.target)) {
      close();
    }
  });
}

/* ----------------------------------------------------------
   7. BOOT
   ---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initReveal();
  initShuffle();
  initScramble();
});
