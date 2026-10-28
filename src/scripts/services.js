import { roadmapItems } from '../data/hr-check.mjs';
import { motionPaused, reducedMotion } from './motion.js';
export function initServiceExplorer() {
  const explorer = document.querySelector('[data-service-explorer]');
  if (!explorer) return;
  const buttons = [...explorer.querySelectorAll('[data-service-choice]')],
    panels = [...explorer.querySelectorAll('[data-service-panel]')];
  buttons.forEach((button) =>
    button.addEventListener('click', () => {
      buttons.forEach((other) =>
        other.setAttribute('aria-pressed', String(other === button)),
      );
      panels.forEach((panel) => {
        panel.hidden =
          panel.dataset.servicePanel !== button.dataset.serviceChoice;
        if (!panel.hidden && !reducedMotion && !motionPaused)
          panel.animate(
            [
              { opacity: 0.35, transform: 'translateY(9px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            { duration: 300, easing: 'ease-out' },
          );
      });
    }),
  );
}
export function initServiceEnquiry() {
  const select = document.querySelector('select[name="service"]');
  if (!select) return;

  const placeholders = {
    recruitment:
      'E.g., We are looking to hire a Lead Backend Engineer (Golang/Kubernetes) and a Head of Growth. Expected timeline within 4–6 weeks.',
    'people-setup':
      'E.g., We are a team of 35 looking to set up our POSH Internal Committee, review our employee handbook, and formalize our leave policy.',
    'hiring-support':
      'E.g., We need third-party technical SME assessment panels and standardized interview scorecards for senior engineering hires.',
    'founder-voice':
      'E.g., We want to build founder LinkedIn thought leadership and elevate our company employer branding to attract senior operators.',
    'career-prep':
      'E.g., I have 7 years of product management experience and want a CV and LinkedIn rework and a mock interview simulation for VP Product roles.',
  };

  const textarea = document.querySelector('textarea[name="text"]');
  function updatePlaceholder(val) {
    if (textarea && placeholders[val]) {
      textarea.placeholder = placeholders[val];
    }
  }

  const params = new URLSearchParams(location.search);
  const requested = params.get('service');
  if (
    requested &&
    [...select.options].some((option) => option.value === requested)
  ) {
    select.value = requested;
    updatePlaceholder(requested);
  }

  const roadmapCodes = [...new Set((params.get('roadmap') || '').split(','))];
  const roadmap = roadmapCodes
    .filter((code) => Object.hasOwn(roadmapItems, code))
    .slice(0, 5);
  if (
    roadmap.length &&
    textarea &&
    !textarea.value &&
    ['people-setup', 'hiring-support'].includes(requested)
  ) {
    textarea.value =
      'I would like to discuss this recommended setup scope:\n\n' +
      roadmap.map((code) => '- ' + roadmapItems[code].title).join('\n') +
      '\n\nPlease help us agree the scope, access and next steps.';
  }

  select.addEventListener('change', () => {
    updatePlaceholder(select.value);
  });
}
