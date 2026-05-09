/* ════════════════════════════════════════════════
   Portfolio — Vanilla JS
   No frameworks. No animation libraries.
   Smooth by design.
════════════════════════════════════════════════ */

'use strict';

/* ── Cursor ──────────────────────────────────────── */
(function initCursor() {
  const el = document.getElementById('cursor');
  if (!el || window.matchMedia('(pointer:coarse)').matches) {
    if (el) el.style.display = 'none';
    return;
  }

  /* Hide until first mouse move so it doesn't flash at 0,0 */
  el.style.opacity = '0';

  window.addEventListener('mousemove', e => {
    el.style.transform = `translate(${e.clientX - 6}px, ${e.clientY - 6}px)`;
    el.style.opacity = '1';
  }, { passive: true });

  document.querySelectorAll('a, button, summary, input, textarea, [role="button"]').forEach(node => {
    node.addEventListener('mouseenter', () => {
      el.style.width  = '24px';
      el.style.height = '24px';
    });
    node.addEventListener('mouseleave', () => {
      el.style.width  = '12px';
      el.style.height = '12px';
    });
  });
})();

/* ── Scroll reveal ───────────────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  const io = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    }),
    {
      threshold: isTouch ? 0.05 : 0.12,
      rootMargin: isTouch ? '0px 0px -20px 0px' : '0px 0px -40px 0px'
    }
  );
  els.forEach(el => io.observe(el));
})();

/* ── Active nav link ─────────────────────────────── */
(function initNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a');

  const io = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      const id = e.target.id;
      links.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
      });
    }),
    { rootMargin: `-${52}px 0px -55% 0px` }
  );
  sections.forEach(s => io.observe(s));

  /* Mobile toggle */
  const btn   = document.getElementById('nav-toggle');
  const menu  = document.getElementById('nav-mobile');
  if (btn && menu) {
    btn.addEventListener('click', () => {
      menu.classList.toggle('open');
    });
    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => menu.classList.remove('open'));
    });
  }
})();

/* ── Typewriter ──────────────────────────────────── */
(function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;

  const roles = [
    'Software Engineer',
    'ML & AI Engineer',
    'Backend Architect',
    'Full-Stack Developer'
  ];

  let ri = 0, ci = 0, deleting = false;

  function tick() {
    const role = roles[ri];
    if (!deleting) {
      ci++;
      el.textContent = role.slice(0, ci);
      if (ci === role.length) {
        deleting = true;
        setTimeout(tick, 2200);
        return;
      }
      setTimeout(tick, 60);
    } else {
      ci--;
      el.textContent = role.slice(0, ci);
      if (ci === 0) {
        deleting = false;
        ri = (ri + 1) % roles.length;
        setTimeout(tick, 320);
        return;
      }
      setTimeout(tick, 32);
    }
  }
  setTimeout(tick, 500);
})();

/* ── Contact form (demo — wire to any backend) ───── */
(function initForm() {
  const form   = document.getElementById('contact-form');
  const btn    = document.getElementById('send-btn');
  const status = document.getElementById('form-status');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    btn.disabled    = true;
    btn.textContent = 'Sending…';

    /* Simulate a send — replace with fetch('/api/contact', ...) */
    await new Promise(r => setTimeout(r, 1400));

    btn.textContent  = '✓ Sent!';
    status.textContent = 'Thanks! I\'ll get back to you within 24 hours.';
    form.reset();

    setTimeout(() => {
      btn.disabled    = false;
      btn.textContent = 'Send Message';
      status.textContent = '';
    }, 4000);
  });
})();
