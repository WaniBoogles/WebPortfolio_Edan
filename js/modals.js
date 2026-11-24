(function () {
  'use strict';

  window.EdanPortfolio = window.EdanPortfolio || {};

  const getData = () => window.EdanPortfolio.data || {};

  // Lightbox Modal
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const lbTitle = document.getElementById('lightboxTitle');
  const lbClose = document.getElementById('lightboxClose');

  // Project Extended Details Modal
  const projModal = document.getElementById('projectDetailsModal');
  const projModalTitle = document.getElementById('projModalTitle');
  const projModalOverview = document.getElementById('projModalOverview');
  const projModalFeatures = document.getElementById('projModalFeatures');
  const projModalNote = document.getElementById('projModalNote');
  const projModalRepo = document.getElementById('projModalRepo');
  const projModalClose = document.getElementById('projModalClose');

  // Language, Technology & Soft Skill Overview Modal
  const infoModal = document.getElementById('infoModal');
  const infoModalTitle = document.getElementById('infoModalTitle');
  const infoModalImg = document.getElementById('infoModalImg');
  const infoModalName = document.getElementById('infoModalName');
  const infoModalCat = document.getElementById('infoModalCat');
  const infoModalDesc = document.getElementById('infoModalDesc');
  const infoModalUsage = document.getElementById('infoModalUsage');
  const infoModalClose = document.getElementById('infoModalClose');

  const allModals = [lightbox, projModal, infoModal].filter(Boolean);

  const syncBodyModalState = () => {
    const anyOpen = allModals.some((m) => m.classList.contains('open'));
    document.documentElement.classList.toggle('modal-open', anyOpen);
    document.body.classList.toggle('modal-open', anyOpen);
  };

  const openLightbox = (src, alt, caption) => {
    if (!lightbox || !lbImg || !lbTitle || !src) return false;
    lbImg.src = src;
    lbImg.alt = alt || '';
    lbTitle.textContent = caption || alt || 'Preview';
    lightbox.classList.add('open');
    syncBodyModalState();
    return true;
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    syncBodyModalState();
  };

  const closeProjModal = () => {
    if (!projModal) return;
    projModal.classList.remove('open');
    syncBodyModalState();
  };

  const closeInfoModal = () => {
    if (!infoModal) return;
    infoModal.classList.remove('open');
    syncBodyModalState();
  };

  const closeAllModals = () => {
    const wasOpen = allModals.some((m) => m.classList.contains('open'));
    allModals.forEach((m) => m.classList.remove('open'));
    syncBodyModalState();
    return wasOpen;
  };

  const openProjectModalByKey = (key) => {
    const { projectDetailsData } = getData();
    const item = projectDetailsData && projectDetailsData[key];
    if (!item || !projModal) return false;

    projModalTitle.textContent = item.title;
    projModalOverview.textContent = item.overview;
    projModalFeatures.innerHTML = '';
    item.features.forEach(([lead, desc]) => {
      const li = document.createElement('li');
      const strong = document.createElement('strong');
      strong.textContent = lead + ' ';
      li.appendChild(strong);
      li.appendChild(document.createTextNode(desc));
      projModalFeatures.appendChild(li);
    });
    projModalNote.textContent = item.note || '';
    if (item.repo) {
      projModalRepo.href = item.repo;
      projModalRepo.style.display = 'inline-flex';
    } else {
      projModalRepo.style.display = 'none';
    }
    projModal.classList.add('open');
    syncBodyModalState();
    return true;
  };

  const openInfoModalByKey = (key) => {
    const { infoCatalog } = getData();
    const entry = infoCatalog && infoCatalog[key];
    if (!entry || !infoModal) return false;

    infoModalTitle.textContent = entry.name + ' — Overview';
    infoModalImg.src = entry.icon;
    infoModalImg.alt = entry.name + ' icon';
    infoModalName.textContent = entry.name;
    infoModalCat.textContent = entry.cat;
    infoModalDesc.textContent = entry.desc;
    infoModalUsage.textContent = entry.usage;
    infoModal.classList.add('open');
    syncBodyModalState();
    return true;
  };

  // Close buttons & backdrop outside-click dismissal
  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  if (projModalClose) projModalClose.addEventListener('click', closeProjModal);
  if (projModal) {
    projModal.addEventListener('click', (e) => {
      if (e.target === projModal) closeProjModal();
    });
  }

  if (infoModalClose) infoModalClose.addEventListener('click', closeInfoModal);
  if (infoModal) {
    infoModal.addEventListener('click', (e) => {
      if (e.target === infoModal) closeInfoModal();
    });
  }

  // Trigger bindings for Project Details & Skill/Language Info
  document.querySelectorAll('[data-project-details]').forEach((btn) => {
    btn.addEventListener('click', () => openProjectModalByKey(btn.dataset.projectDetails));
  });

  document.querySelectorAll('[data-info]').forEach((trigger) => {
    trigger.addEventListener('click', () => openInfoModalByKey(trigger.dataset.info));
  });

  // Standalone GIF / direct lightbox triggers (non-slideshow containers)
  document.querySelectorAll('[data-lightbox]').forEach((trigger) => {
    if (trigger.classList.contains('slideshow-window')) return;
    trigger.addEventListener('click', () => {
      const img = trigger.tagName === 'IMG' ? trigger : trigger.querySelector('img');
      const src = trigger.dataset.lightboxSrc || (img && img.src);
      const alt = trigger.dataset.lightboxAlt || (img && img.alt) || '';
      const caption = trigger.dataset.caption || trigger.dataset.lightboxCaption || alt;
      openLightbox(src, alt, caption);
    });
  });

  // Escape key dismissal: close open modals first, else unmaximize terminal if maximized
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const closedAny = closeAllModals();
    if (!closedAny) {
      const term = window.EdanPortfolio && window.EdanPortfolio.terminal;
      if (term && typeof term.isMaximized === 'function' && term.isMaximized()) {
        term.unmaximizeTerminal();
      }
    }
  });

  window.EdanPortfolio.modals = {
    openProjectModalByKey,
    openInfoModalByKey,
    openLightbox,
    closeLightbox,
    closeProjModal,
    closeInfoModal,
    closeAllModals
  };
})();
