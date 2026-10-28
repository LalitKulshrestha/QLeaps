import { initMotion, initReveals } from './motion.js';
import { initNavigation } from './navigation.js';
import { initServiceExplorer, initServiceEnquiry } from './services.js';
import { resolveLegacyLinks } from './legacy-links.js';

initMotion();
initNavigation();
initReveals();
initServiceExplorer();
initServiceEnquiry();
resolveLegacyLinks();
if (
  document.querySelector(
    '#cvForm,#jobForm,#msgForm,#feedbackForm,#serviceForm,#rolesList,#activeMandatesStatus',
  )
)
  import('./forms.js').then((module) => module.initForms());
if (document.querySelector('#blogSearch'))
  import('./knowledge.js').then((module) => module.initKnowledge());
if (document.querySelector('.open-dossier-btn,[data-open-dossier]'))
  import('./dossier.js').then((module) => module.initDossierModal());
if (document.querySelector('#qlFit'))
  import('./recruitment-interactions.js').then((module) =>
    module.initRecruitmentInteractions(),
  );
if (document.querySelector('#heroCanvas'))
  import('./recruitment-canvas.js').then((module) =>
    module.initHeroClashCanvas(),
  );
if (
  ['/', '/index.html', '/recruitment/', '/recruitment'].includes(
    location.pathname,
  )
)
  import('./audio.js').then((module) => module.initBackgroundMusic());
