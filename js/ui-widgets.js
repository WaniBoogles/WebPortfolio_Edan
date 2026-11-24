(function () {
  'use strict';

  window.EdanPortfolio = window.EdanPortfolio || {};

  // 1. Auto Cross-Fade Project Slideshow Windows (every 4s) & Lightbox Zoom
  document.querySelectorAll('.slideshow-window').forEach((win) => {
    const slides = Array.from(win.querySelectorAll('.slide-item'));
    const dots = Array.from(win.querySelectorAll('.slide-dot'));
    const captionEl = win.querySelector('.slide-caption');
    const intervalMs = parseInt(win.dataset.interval || '4000', 10);
    let current = 0;
    let timer = null;

    const showSlide = (idx) => {
      if (!slides.length) return;
      current = (idx + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('active', i === current));
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
      if (captionEl && slides[current]) {
        captionEl.textContent = slides[current].dataset.caption || '';
      }
    };

    const startAuto = () => {
      if (timer || slides.length < 2) return;
      timer = setInterval(() => showSlide(current + 1), intervalMs);
    };

    const stopAuto = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    dots.forEach((dot, i) => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        showSlide(i);
        stopAuto();
        startAuto();
      });
    });

    win.addEventListener('pointermove', (e) => {
      const rect = win.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const rx = ((e.clientX - rect.left) / rect.width) * 100;
      const ry = ((e.clientY - rect.top) / rect.height) * 100;
      win.style.setProperty('--ox', rx.toFixed(1) + '%');
      win.style.setProperty('--oy', ry.toFixed(1) + '%');
    });

    win.addEventListener('mouseenter', stopAuto);
    win.addEventListener('mouseleave', () => {
      win.style.setProperty('--ox', '50%');
      win.style.setProperty('--oy', '50%');
      startAuto();
    });

    win.addEventListener('click', () => {
      const active = slides[current];
      const img = (active && active.querySelector('img')) || win.querySelector('img');
      if (!img) return;
      const caption = (active && active.dataset.caption) || win.dataset.caption || img.alt;
      const modals = window.EdanPortfolio.modals;
      if (modals && typeof modals.openLightbox === 'function') {
        modals.openLightbox(img.src, img.alt, caption);
      }
    });

    startAuto();
  });

  // 2. 1-Click Copy Email Button (works on HTTPS and local file://)
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  const copyEmailLabel = document.getElementById('copyEmailLabel');
  if (copyEmailBtn && copyEmailLabel) {
    let copyTimer = null;
    copyEmailBtn.addEventListener('click', async () => {
      const email = copyEmailBtn.dataset.email || 'rhonyuane@gmail.com';
      let ok = false;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(email);
          ok = true;
        } catch (_) {}
      }
      if (!ok) {
        const ta = document.createElement('textarea');
        ta.value = email;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { ok = document.execCommand('copy'); } catch (_) {}
        ta.remove();
      }
      if (ok) {
        copyEmailBtn.classList.add('copied');
        copyEmailLabel.textContent = 'Copied!';
        clearTimeout(copyTimer);
        copyTimer = setTimeout(() => {
          copyEmailBtn.classList.remove('copied');
          copyEmailLabel.textContent = 'Copy Email';
        }, 2200);
      }
    });
  }

  // 3. Floating Back-to-Top Button
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    const toggleBackToTop = () => {
      backToTopBtn.classList.toggle('visible', window.scrollY > 420);
    };
    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    toggleBackToTop();
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
