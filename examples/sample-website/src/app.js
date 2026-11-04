/**
 * Aether Studio — Application Logic & Controller
 * Implements interactive estimator, form validation, accessible dialog, and mobile nav.
 */

// Pure calculation logic (tested via TDD)
export function calculateScope(pages, tier = 'standard') {
  const pageNum = Math.max(1, parseInt(pages, 10) || 1);
  let baseSprints = Math.ceil(pageNum / 2);
  let rateMultiplier = 1.0;

  if (tier === 'minimal') {
    rateMultiplier = 0.85;
  } else if (tier === 'overdrive') {
    rateMultiplier = 1.35;
    baseSprints += 1;
  }

  const baseCostPerSprint = 6000;
  const totalCost = Math.round(baseSprints * baseCostPerSprint * rateMultiplier);

  return {
    pages: pageNum,
    sprints: baseSprints,
    gates: 13,
    estimatedCostUsd: totalCost,
    formattedCost: `$${totalCost.toLocaleString('en-US')} USD`
  };
}

// Pure validation logic (tested via TDD)
export function validateAuditForm({ name, email, url }) {
  const errors = {};

  if (!name || name.trim().length < 2) {
    errors.name = 'Full name must be at least 2 characters.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    errors.email = 'Please provide a valid email address.';
  }

  if (!url || !url.trim().startsWith('http')) {
    errors.url = 'URL must start with http:// or https://.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// DOM Controller (only initializes in browser context)
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Estimator Elements
    const pageSlider = document.getElementById('pageSlider');
    const pageCountDisplay = document.getElementById('pageCountDisplay');
    const motionSelect = document.getElementById('motionSelect');
    const sprintEstimate = document.getElementById('sprintEstimate');
    const costEstimate = document.getElementById('costEstimate');

    function updateEstimatorUI() {
      if (!pageSlider || !motionSelect) return;
      const res = calculateScope(pageSlider.value, motionSelect.value);
      if (pageCountDisplay) pageCountDisplay.textContent = `${res.pages} Page${res.pages > 1 ? 's' : ''}`;
      if (sprintEstimate) sprintEstimate.textContent = `${res.sprints} Sprint${res.sprints > 1 ? 's' : ''}`;
      if (costEstimate) costEstimate.textContent = res.formattedCost;
    }

    if (pageSlider) pageSlider.addEventListener('input', updateEstimatorUI);
    if (motionSelect) motionSelect.addEventListener('change', updateEstimatorUI);

    // Mobile Navigation Toggle
    const navToggle = document.getElementById('navToggle');
    const primaryNav = document.getElementById('primaryNav');

    if (navToggle && primaryNav) {
      navToggle.addEventListener('click', () => {
        const isOpen = primaryNav.classList.toggle('is-open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
      });
    }

    // Modal Dialog Controller
    const auditModal = document.getElementById('auditModal');
    const openAuditBtn = document.getElementById('openAuditBtn');
    const openAuditHeroBtn = document.getElementById('openAuditHeroBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const auditForm = document.getElementById('auditForm');

    function openModal() {
      if (auditModal && typeof auditModal.showModal === 'function') {
        auditModal.showModal();
        const firstInput = auditModal.querySelector('input');
        if (firstInput) firstInput.focus();
      }
    }

    function closeModal() {
      if (auditModal && typeof auditModal.close === 'function') {
        auditModal.close();
      }
    }

    if (openAuditBtn) openAuditBtn.addEventListener('click', openModal);
    if (openAuditHeroBtn) openAuditHeroBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

    if (auditModal) {
      // Close on backdrop click
      auditModal.addEventListener('click', (e) => {
        const rect = auditModal.getBoundingClientRect();
        const isInDialog = (
          rect.top <= e.clientY &&
          e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX &&
          e.clientX <= rect.left + rect.width
        );
        if (!isInDialog) closeModal();
      });
    }

    // Form Submission & Validation
    if (auditForm) {
      auditForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('clientName');
        const emailInput = document.getElementById('clientEmail');
        const urlInput = document.getElementById('projectUrl');

        const nameErr = document.getElementById('nameError');
        const emailErr = document.getElementById('emailError');
        const urlErr = document.getElementById('urlError');
        const successMsg = document.getElementById('formSuccessMessage');

        // Clear previous errors
        if (nameErr) nameErr.textContent = '';
        if (emailErr) emailErr.textContent = '';
        if (urlErr) urlErr.textContent = '';
        if (successMsg) successMsg.style.display = 'none';

        const validation = validateAuditForm({
          name: nameInput ? nameInput.value : '',
          email: emailInput ? emailInput.value : '',
          url: urlInput ? urlInput.value : ''
        });

        if (!validation.isValid) {
          if (validation.errors.name && nameErr) nameErr.textContent = validation.errors.name;
          if (validation.errors.email && emailErr) emailErr.textContent = validation.errors.email;
          if (validation.errors.url && urlErr) urlErr.textContent = validation.errors.url;
          return;
        }

        // Success state
        if (successMsg) successMsg.style.display = 'block';
        auditForm.reset();
        setTimeout(() => {
          closeModal();
          if (successMsg) successMsg.style.display = 'none';
        }, 3000);
      });
    }
  });
}
