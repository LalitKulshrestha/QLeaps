/* =====================================================
   main.js — Quantum Leaps lead capture site
   Vanilla JS only. No frameworks.
   
   Features:
   - Mobile nav toggle
   - Form validation (HTML5 + custom inline errors)
   - Honeypot detection
   - Time-trap (reject < 2s submissions)
   - Cloudflare Turnstile integration
   - AJAX fetch submit (no page reload)
   - Loading / success / error states
   - Graceful degradation (noscript native POST)
   - Year auto-update in footer
===================================================== */
'use strict';

// ---- Current year ----
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---- Page load time (for time-trap) ----
const loadTimeInput = document.getElementById('formLoadTime');
if (loadTimeInput) loadTimeInput.value = Date.now().toString();

// ---- Mobile nav toggle ----
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen.toString());
  });
  // Close nav on link click
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ---- Smooth scroll for anchor links ----
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ---- Turnstile callback ----
window.onTurnstileSuccess = function(token) {
  const input = document.getElementById('turnstileToken');
  if (input) input.value = token;
};

// ---- Form handling ----
const form = document.getElementById('leadForm');
if (form) {
  const nameInput   = document.getElementById('name');
  const emailInput  = document.getElementById('email');
  const msgInput    = document.getElementById('message');
  const consentBox  = document.getElementById('consent');
  const submitBtn   = document.getElementById('submitBtn');
  const statusEl    = document.getElementById('formStatus');
  const btnText     = submitBtn?.querySelector('.btn-text');
  const btnLoading  = submitBtn?.querySelector('.btn-loading');

  // --- Helpers ---
  function showError(input, msgId, msg) {
    const el = document.getElementById(msgId);
    if (el) el.textContent = msg;
    if (input) input.classList.add('error');
  }

  function clearError(input, msgId) {
    const el = document.getElementById(msgId);
    if (el) el.textContent = '';
    if (input) input.classList.remove('error');
  }

  function clearAllErrors() {
    clearError(nameInput, 'name-error');
    clearError(emailInput, 'email-error');
    clearError(msgInput, 'message-error');
    clearError(null, 'consent-error');
    statusEl.textContent = '';
    statusEl.className = 'form-status';
  }

  function setStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.className = 'form-status ' + type;
    statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function setLoading(loading) {
    if (!submitBtn) return;
    submitBtn.disabled = loading;
    if (btnText) btnText.hidden = loading;
    if (btnLoading) btnLoading.hidden = !loading;
  }

  // --- Inline validation on blur ---
  nameInput?.addEventListener('blur', () => {
    const v = nameInput.value.trim();
    if (!v) showError(nameInput, 'name-error', 'Please enter your name.');
    else if (v.length > 100) showError(nameInput, 'name-error', 'Name must be 100 characters or fewer.');
    else clearError(nameInput, 'name-error');
  });

  emailInput?.addEventListener('blur', () => {
    const v = emailInput.value.trim();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!v) showError(emailInput, 'email-error', 'Please enter your email address.');
    else if (!emailRe.test(v)) showError(emailInput, 'email-error', 'Please enter a valid email address.');
    else clearError(emailInput, 'email-error');
  });

  consentBox?.addEventListener('change', () => {
    if (consentBox.checked) clearError(null, 'consent-error');
  });

  // --- Validate all fields, return bool ---
  function validate() {
    let valid = true;
    clearAllErrors();

    const name = nameInput?.value.trim() || '';
    const email = emailInput?.value.trim() || '';
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name) { showError(nameInput, 'name-error', 'Please enter your name.'); valid = false; }
    else if (name.length > 100) { showError(nameInput, 'name-error', 'Name must be 100 characters or fewer.'); valid = false; }

    if (!email) { showError(emailInput, 'email-error', 'Please enter your email address.'); valid = false; }
    else if (!emailRe.test(email)) { showError(emailInput, 'email-error', 'Please enter a valid email address.'); valid = false; }

    if (!consentBox?.checked) {
      showError(null, 'consent-error', 'Please confirm you agree to be contacted.');
      valid = false;
    }

    return valid;
  }

  // --- Submit ---
  form.addEventListener('submit', async e => {
    e.preventDefault();

    if (!validate()) {
      // Focus first error field
      const firstError = form.querySelector('.error');
      if (firstError) firstError.focus();
      return;
    }

    // ---- Honeypot check (client-side mirror; server also checks) ----
    const honeypot = document.getElementById('company');
    if (honeypot && honeypot.value.trim() !== '') {
      // Silently succeed for bots
      setStatus("Thanks — we'll be in touch!", 'success');
      form.reset();
      return;
    }

    // ---- Time trap ----
    const loadTime = parseInt(document.getElementById('formLoadTime')?.value || '0', 10);
    const elapsed = Date.now() - loadTime;
    if (elapsed < 2000) {
      // Too fast — silent success for bots
      setStatus("Thanks — we'll be in touch!", 'success');
      form.reset();
      return;
    }

    // ---- Check Turnstile token ----
    const turnstileToken = document.getElementById('turnstileToken')?.value;
    // In production: require turnstileToken to be non-empty
    // For local/dev testing we allow empty token

    // ---- Build payload ----
    const payload = {
      name: (nameInput?.value.trim() || '').substring(0, 100),
      email: (emailInput?.value.trim() || '').substring(0, 200),
      message: (msgInput?.value.trim() || '').substring(0, 2000),
      consent: consentBox?.checked ? 'yes' : 'no',
      'cf-turnstile-response': turnstileToken || '',
      honeypot: honeypot?.value || '',
      loadTime: loadTime.toString(),
    };

    setLoading(true);
    clearAllErrors();

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data;
      try { data = await res.json(); } catch (_) { data = {}; }

      if (res.ok && data.ok) {
        setStatus("Thanks — we'll be in touch very soon! 🎉", 'success');
        form.reset();
        // Reset Turnstile if available
        if (window.turnstile) window.turnstile.reset();
      } else if (res.status === 429) {
        setStatus('Too many attempts. Please wait a minute and try again.', 'error-msg');
      } else {
        const errMsg = data.error || 'Something went wrong. Please try again or email us directly at contact@qleaps.in';
        setStatus(errMsg, 'error-msg');
      }
    } catch (err) {
      setStatus('Unable to send — please check your connection and try again.', 'error-msg');
    } finally {
      setLoading(false);
    }
  });
}
