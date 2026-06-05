(function () {
    'use strict';

    /* --------------------------------------------------------
       CUSTOM CURSOR  (desktop / hover-capable only)
    -------------------------------------------------------- */
    const cur = document.getElementById('cur');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let curX = mouseX;
    let curY = mouseY;
    let rafId;

    const interactiveSelector = 'a, button, [role="button"], .gal-item, .class-card';

    if (window.matchMedia('(hover: hover)').matches) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(interactiveSelector)) {
                cur.classList.add('is-hover');
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(interactiveSelector)) {
                cur.classList.remove('is-hover');
            }
        });

        function tickCursor() {
            curX += (mouseX - curX) * 0.12;
            curY += (mouseY - curY) * 0.12;
            cur.style.transform = `translate(${curX}px, ${curY}px) translate(-50%, -50%)`;
            rafId = requestAnimationFrame(tickCursor);
        }
        tickCursor();
    }

    /* --------------------------------------------------------
       COLORFIELD BLOBS — cursor tracks blob positions
    -------------------------------------------------------- */
    const blobA = document.getElementById('blobA');
    const blobB = document.getElementById('blobB');
    const blobC = document.getElementById('blobC');

    let blobAx = 0, blobAy = 0;
    let blobBx = 0, blobBy = 0;
    let blobCx = 0, blobCy = 0;
    let targetNX = 0.5, targetNY = 0.5;
    let nX = 0.5, nY = 0.5;

    document.addEventListener('mousemove', (e) => {
        targetNX = e.clientX / window.innerWidth;
        targetNY = e.clientY / window.innerHeight;
    });

    /* Touch support for colorfield */
    document.addEventListener('touchmove', (e) => {
        const t = e.touches[0];
        targetNX = t.clientX / window.innerWidth;
        targetNY = t.clientY / window.innerHeight;
    }, { passive: true });

    function tickBlobs() {
        nX += (targetNX - nX) * 0.04;
        nY += (targetNY - nY) * 0.04;

        const dx = nX - 0.5;
        const dy = nY - 0.5;

        blobAx += ((dx * 120) - blobAx) * 0.06;
        blobAy += ((dy * 90)  - blobAy) * 0.06;

        blobBx += ((-dx * 80) - blobBx) * 0.05;
        blobBy += ((-dy * 60) - blobBy) * 0.05;

        blobCx += ((dx * 180)  - blobCx) * 0.07;
        blobCy += ((-dy * 130) - blobCy) * 0.07;

        blobA.style.transform = `translate(${blobAx}px, ${blobAy}px)`;
        blobB.style.transform = `translate(${blobBx}px, ${blobBy}px)`;
        blobC.style.transform = `translate(${blobCx}px, ${blobCy}px)`;

        requestAnimationFrame(tickBlobs);
    }

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        tickBlobs();
    }

    /* --------------------------------------------------------
       HERO LOAD REVEAL
    -------------------------------------------------------- */
    const hero = document.getElementById('hero');
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            hero.classList.add('hero--loaded');
        });
    });

    /* Hint text fades out after 4 seconds */
    const hint = document.getElementById('heroHint');
    if (hint) {
        setTimeout(() => hint.classList.add('hidden'), 4000);
    }

    /* --------------------------------------------------------
       SCROLL REVEALS via IntersectionObserver
    -------------------------------------------------------- */
    const revealEls = document.querySelectorAll('[data-reveal]');

    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach((el) => io.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add('in-view'));
    }

    /* --------------------------------------------------------
       NAVIGATION — scroll state + mobile toggle
    -------------------------------------------------------- */
    const nav    = document.getElementById('siteNav');
    const toggle = document.getElementById('navToggle');
    const navList = document.getElementById('navList');

    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });

    toggle.addEventListener('click', () => {
        const open = navList.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    });

    navList.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            navList.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });

    /* Close nav when clicking outside */
    document.addEventListener('click', (e) => {
        if (
            navList.classList.contains('is-open') &&
            !navList.contains(e.target) &&
            !toggle.contains(e.target)
        ) {
            navList.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });

    /* Cursor RAF already guarded by hover media query above;
       blob RAF guarded by the reduced-motion check above. */

}());
