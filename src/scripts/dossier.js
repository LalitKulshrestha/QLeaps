import { $, $$ } from './dom.js';
import { reducedMotion } from './motion.js';
import { DOSSIER_CANDIDATES } from '../data/dossier.js';
export function initDossierModal() {
  var activeIdx = 0,
    previousFocus = null,
    previousOverflow = '',
    inertStates = [];

  function createModalDOM() {
    var existing = $('#dossierBackdrop');
    if (existing) return existing;
    var logoSrc = '/assets/logo/ql-logo-horizontal-rev.svg';
    var contactUrl = '/contact/#post-job';

    var b = document.createElement('div');
    b.id = 'dossierBackdrop';
    b.className = 'dossier-backdrop';
    b.setAttribute('role', 'dialog');
    b.setAttribute('aria-modal', 'true');
    b.setAttribute('aria-describedby', 'dossierSampleNote');
    b.setAttribute('aria-label', 'Calibrated Shortlist Dossier');

    b.innerHTML =
      '<div class="dossier-modal">' +
      '<div class="dossier-header">' +
      '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">' +
      '<img src="' +
      logoSrc +
      '" alt="Quantum Leaps" height="24">' +
      '<span style="font-family:\'Space Grotesk\',sans-serif;font-weight:700;font-size:15px;letter-spacing:-.01em">Calibrated Shortlist Dossier</span>' +
      '<span style="font-size:11px;font-weight:700;background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8;padding:3px 10px;border-radius:999px;letter-spacing:.05em;text-transform:uppercase">Executive Deliverable</span>' +
      '</div>' +
      '<button type="button" class="dossier-close-btn" id="dossierCloseBtn" aria-label="Close dossier">✕</button>' +
      '</div>' +
      '<p class="dossier-sample-note" id="dossierSampleNote">Illustrative sample deliverable · Fictional profiles and figures. No real candidate, placement or benchmark data. Scores demonstrate a layout, not a validated prediction.</p>' +
      '<div class="dossier-tabs" id="dossierTabs" role="group" aria-label="Example profiles"></div>' +
      '<div class="dossier-body" id="dossierBody"></div>' +
      '<div class="dossier-footer-cta">' +
      '<div style="display:flex;flex-direction:column;gap:2px">' +
      '<span style="font-family:\'Space Grotesk\',sans-serif;font-weight:700;font-size:15px;color:#0F172A">Ready for calibrated candidate dossiers on your next search?</span>' +
      '<span style="font-size:13px;color:#64748B">Discuss your brief, assessment criteria and a realistic shortlist timeline.</span>' +
      '</div>' +
      '<a href="' +
      contactUrl +
      '" class="header-cta" style="display:inline-flex;align-items:center;gap:6px;text-decoration:none;padding:10px 22px;border-radius:999px;background:#2563eb;color:#FFFFFF;font-family:\'Space Grotesk\',sans-serif;font-weight:700;font-size:14px;box-shadow:0 4px 14px rgba(37,99,235,0.25)">' +
      'Let’s talk hiring →' +
      '</a>' +
      '</div>' +
      '</div>';

    document.body.appendChild(b);

    b.addEventListener('click', function (e) {
      if (e.target === b) closeDossier();
    });

    var closeBtn = $('#dossierCloseBtn', b);
    if (closeBtn) closeBtn.addEventListener('click', closeDossier);

    return b;
  }

  function renderTabs(b) {
    var tabsContainer = $('#dossierTabs', b);
    if (!tabsContainer) return;
    tabsContainer.innerHTML = '';
    DOSSIER_CANDIDATES.forEach(function (cand, idx) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dossier-tab-btn' + (idx === activeIdx ? ' active' : '');
      btn.textContent = cand.tabTitle;
      btn.setAttribute('aria-pressed', String(idx === activeIdx));
      btn.addEventListener('click', function () {
        activeIdx = idx;
        renderTabs(b);
        renderCandidate(b, DOSSIER_CANDIDATES[activeIdx]);
        $$('.dossier-tab-btn', b)[activeIdx].focus();
      });
      tabsContainer.appendChild(btn);
    });
  }

  function renderCandidate(b, cand) {
    var body = $('#dossierBody', b);
    if (!body) return;

    var scoresHtml = cand.radarScores
      .map(function (s) {
        var parts = s.score.split('/');
        var num = parts[0].trim();
        var den = parts[1] ? '/' + parts[1].trim() : '';
        return (
          '<div class="dossier-score-card">' +
          '<div class="dossier-score-header">' +
          '<span class="dossier-score-label">' +
          s.label +
          '</span>' +
          '<span class="dossier-score-val">' +
          num +
          ' <span class="dossier-score-denom">' +
          den +
          '</span></span>' +
          '</div>' +
          '<div class="dossier-meter">' +
          '<div class="dossier-meter-fill" style="width:' +
          s.pct +
          '%"></div>' +
          '</div>' +
          '</div>'
        );
      })
      .join('');

    var preflightHtml = cand.preflight
      .map(function (p) {
        return (
          '<div class="dossier-preflight-item">' +
          '<span style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#64748B">' +
          p.kicker +
          '</span>' +
          '<span class="dossier-preflight-val">' +
          p.val +
          '</span>' +
          '</div>'
        );
      })
      .join('');

    var probesHtml = cand.diagnosticProbes
      .map(function (pr) {
        return '<li style="margin-bottom:6px">' + pr + '</li>';
      })
      .join('');

    body.innerHTML =
      '<div class="dossier-candidate-hero">' +
      '<div style="display:flex;flex-direction:column;gap:6px;max-width:580px">' +
      '<div style="display:flex;align-items:center;gap:8px">' +
      '<span style="font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#2563eb">Fictional candidate example</span>' +
      '<span style="width:6px;height:6px;border-radius:50%;background:#2563eb"></span>' +
      '<span style="font-size:12px;font-weight:700;color:#2563eb">Illustrative details</span>' +
      '</div>' +
      '<h2 style="margin:0;font-family:\'Space Grotesk\',sans-serif;font-weight:700;font-size:clamp(22px,2.8vw,28px);color:#0f172a">' +
      cand.codeName +
      '</h2>' +
      '<p style="margin:0;font-size:14.5px;color:#475569">' +
      cand.headline +
      '</p>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;align-items:flex-end;background:#F8FAFC;border:1px solid #E2E8F0;padding:10px 18px;border-radius:16px;gap:2px">' +
      '<div style="display:flex;align-items:baseline;gap:4px">' +
      '<span style="font-family:\'Space Grotesk\',sans-serif;font-weight:800;font-size:28px;color:#2563eb">' +
      cand.overallScore +
      '</span>' +
      '<span style="font-size:14px;color:#64748B;font-weight:600">/ 10</span>' +
      '</div>' +
      '<span style="font-size:11px;font-weight:700;color:#2563eb;letter-spacing:.04em;text-transform:uppercase">Example rubric only</span>' +
      '</div>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:12px">' +
      '<span style="font-family:\'Space Grotesk\',sans-serif;font-weight:700;font-size:12.5px;letter-spacing:.08em;text-transform:uppercase;color:#64748B">01 / Competency &amp; Radar Scorecard</span>' +
      '<div class="dossier-scorecard-grid">' +
      scoresHtml +
      '</div>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:12px">' +
      '<span style="font-family:\'Space Grotesk\',sans-serif;font-weight:700;font-size:12.5px;letter-spacing:.08em;text-transform:uppercase;color:#64748B">02 / India Pre-Flight Operational Verification</span>' +
      '<div class="dossier-preflight-box">' +
      preflightHtml +
      '</div>' +
      '</div>' +
      '<div class="dossier-commentary">' +
      '<span style="font-family:\'Space Grotesk\',sans-serif;font-weight:700;font-size:12.5px;letter-spacing:.08em;text-transform:uppercase;color:#2563eb">Quantum Leaps Partner Appraisal &amp; Context</span>' +
      '<p style="margin:0;font-size:14.5px;line-height:1.65;color:#1E293B">' +
      cand.partnerCommentary +
      '</p>' +
      '</div>' +
      '<div class="dossier-tradeoff">' +
      '<span style="font-family:\'Space Grotesk\',sans-serif;font-weight:700;font-size:12.5px;letter-spacing:.08em;text-transform:uppercase;color:#D97706">Candid Tradeoff &amp; Executive Watchout</span>' +
      '<p style="margin:0;font-size:14px;line-height:1.6;color:#78350F">' +
      cand.tradeoff +
      '</p>' +
      '</div>' +
      '<div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:18px;padding:20px 24px;display:flex;flex-direction:column;gap:10px">' +
      '<span style="font-family:\'Space Grotesk\',sans-serif;font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#475569">Round-1 Recommended Executive Probes (Tailored for CEO / Board Interview)</span>' +
      '<ul style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:8px;font-size:13.5px;color:#334155;line-height:1.55">' +
      probesHtml +
      '</ul>' +
      '</div>';
  }

  function openDossier() {
    previousFocus = document.activeElement;
    previousOverflow = document.body.style.overflow;
    var b = createModalDOM();
    inertStates = Array.from(document.body.children)
      .filter(function (el) {
        return el !== b;
      })
      .map(function (el) {
        var state = [el, el.inert];
        el.inert = true;
        return state;
      });
    renderTabs(b);
    renderCandidate(b, DOSSIER_CANDIDATES[activeIdx]);
    b.classList.add('active');
    document.body.style.overflow = 'hidden';
    $('#dossierCloseBtn', b).focus();
  }

  function closeDossier() {
    var b = $('#dossierBackdrop');
    if (b) {
      b.classList.remove('active');
      document.body.style.overflow = previousOverflow;
      inertStates.forEach(function (state) {
        state[0].inert = state[1];
      });
      inertStates = [];
      if (previousFocus && previousFocus.isConnected) previousFocus.focus();
    }
  }

  document.addEventListener('keydown', function (e) {
    var modal = $('#dossierBackdrop');
    if (!modal || !modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeDossier();
    if (e.key === 'Tab') {
      var focusable = $$(
        'button:not([disabled]),a[href],input:not([disabled]),[tabindex="0"]',
        modal,
      ).filter(function (el) {
        return el.getClientRects().length;
      });
      var first = focusable[0],
        last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('.open-dossier-btn, [data-open-dossier]');
    if (trigger) {
      e.preventDefault();
      openDossier();
    }
  });
}
