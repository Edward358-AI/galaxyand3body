/* ============================================================
   script.js — Starfield Canvas & Smooth Scroll
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1.  STARFIELD ANIMATION
     ---------------------------------------------------------- */
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height, stars;
  const STAR_COUNT  = 260;
  const MAX_DEPTH   = 1200;
  const BASE_SPEED  = 0.15;            // slow drift

  /** Create a single star at a random position. */
  function createStar() {
    return {
      x:  Math.random() * width  - width  / 2,
      y:  Math.random() * height - height / 2,
      z:  Math.random() * MAX_DEPTH,
      px: 0,
      py: 0,
    };
  }

  /** Initialise (or re-initialise) the star array. */
  function initStars() {
    width  = canvas.width  = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
    stars  = Array.from({ length: STAR_COUNT }, createStar);
  }

  /** Main render loop. */
  function tick() {
    // Slight translucent fill for a trail effect
    ctx.fillStyle = 'rgba(10, 10, 10, 0.35)';
    ctx.fillRect(0, 0, width, height);

    const cx = width  / 2;
    const cy = height / 2;

    for (const star of stars) {
      star.z -= BASE_SPEED;

      if (star.z <= 0) {
        star.x = Math.random() * width  - cx;
        star.y = Math.random() * height - cy;
        star.z = MAX_DEPTH;
        star.px = 0;
        star.py = 0;
        continue;
      }

      const k  = 600 / star.z;
      const sx = star.x * k + cx;
      const sy = star.y * k + cy;

      if (sx < 0 || sx > width || sy < 0 || sy > height) {
        star.x = Math.random() * width  - cx;
        star.y = Math.random() * height - cy;
        star.z = MAX_DEPTH;
        star.px = 0;
        star.py = 0;
        continue;
      }

      const brightness = 1 - star.z / MAX_DEPTH;
      const radius = Math.max(0.4, brightness * 2);

      // Subtle color tint — mostly white, with occasional cyan or magenta
      const hue = Math.random() > 0.92
        ? (Math.random() > 0.5 ? 180 : 300)  // cyan or magenta
        : 0;
      const saturation = hue === 0 ? 0 : 60;

      ctx.beginPath();
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, ${saturation}%, 90%, ${brightness * 0.85})`;
      ctx.fill();

      // Short trail line
      if (star.px && star.py) {
        ctx.strokeStyle = `hsla(${hue}, ${saturation}%, 80%, ${brightness * 0.15})`;
        ctx.lineWidth = radius * 0.5;
        ctx.beginPath();
        ctx.moveTo(star.px, star.py);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      }

      star.px = sx;
      star.py = sy;
    }

    requestAnimationFrame(tick);
  }

  initStars();
  tick();

  // Resize handler
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initStars, 200);
  });

  /* ----------------------------------------------------------
     2.  SMOOTH SCROLL FOR CTA BUTTON
     ---------------------------------------------------------- */
  const ctaBtn = document.getElementById('cta-btn');
  if (ctaBtn) {
    ctaBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(ctaBtn.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  /* ----------------------------------------------------------
     3.  INTERSECTION OBSERVER — fade-in on scroll
     ---------------------------------------------------------- */
  const faders = document.querySelectorAll('.project-card');
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    faders.forEach((card) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = 'opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1)';
      obs.observe(card);
    });
  }

  // The observer adds .visible — make sure CSS agrees
  document.head.insertAdjacentHTML(
    'beforeend',
    '<style>.project-card.visible{opacity:1!important;transform:translateY(0)!important;}</style>'
  );
})();
