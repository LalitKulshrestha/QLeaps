import { evaluateHR, readinessHR, hrQuestions } from '../data/hr-check.mjs';
export function initHRCheck() {
  document.querySelectorAll('[data-hr-check]').forEach((root) => {
    const form = root.querySelector('form');
    form.reset();
    const action = root.querySelector('[data-check-action]');
    function update() {
      const answers = Object.fromEntries(new FormData(form));
      const result = evaluateHR(answers);
      const readiness = readinessHR(answers);
      root.dataset.readiness = readiness.band;
      const gauge = root.querySelector('[data-readiness-gauge]');
      gauge.style.setProperty('--readiness', readiness.score);
      gauge.setAttribute('aria-valuenow', String(readiness.score));
      gauge.setAttribute(
        'aria-valuetext',
        `${readiness.score}% self-reported readiness. ${readiness.answered} of 4 answered.`,
      );
      root.querySelectorAll('[data-readiness-value]').forEach((el) => {
        el.textContent = String(readiness.score);
      });
      root.querySelectorAll('[data-readiness-label]').forEach((el) => {
        el.textContent =
          readiness.answered === 0
            ? 'Your starting point'
            : readiness.band === 'red'
              ? 'Foundations need attention'
              : readiness.band === 'amber'
                ? 'Progress, with gaps to close'
                : 'Stronger foundations reported';
      });
      root.querySelector('[data-gauge-rating]').textContent =
        readiness.answered === 0
          ? 'Not started'
          : readiness.band === 'red'
            ? 'Needs attention'
            : readiness.band === 'amber'
              ? 'Building readiness'
              : 'Good foundations';
      root.querySelector('[data-readiness-status]').textContent =
        readiness.answered < 4
          ? 'Provisional · unanswered inputs earn no points'
          : 'All four inputs selected · self-reported readiness';
      root.querySelector('[data-mobile-progress]').textContent =
        `${readiness.answered}/4 answered`;
      root.querySelector('[data-check-progress]').textContent =
        `${readiness.score}% readiness · ${result.answered} of 4 answered`;
      const complete = result.answered === 4;
      root.querySelector('[data-check-title]').textContent = complete
        ? `Stage ${result.stage} · ${result.stageLabel}`
        : 'Your roadmap takes shape here';
      root.querySelector('[data-check-summary]').textContent = complete
        ? 'Your priorities, based on your answers. A full score does not establish legal compliance or remove individual risks.'
        : 'Change any answer to see your readiness move. Complete all four for your recommended priorities.';
      const signals = root.querySelector('[data-check-signals]'),
        roadmap = root.querySelector('[data-check-roadmap]');
      signals.replaceChildren();
      roadmap.replaceChildren();
      if (complete) {
        result.signals.forEach((text) => {
          const li = document.createElement('li');
          li.textContent = text;
          signals.appendChild(li);
        });
        result.roadmap.forEach((item) => {
          const li = document.createElement('li'),
            title = document.createElement('strong'),
            copy = document.createElement('p');
          title.textContent = item.title;
          copy.textContent = item.text;
          li.append(title, copy);
          roadmap.appendChild(li);
        });
      }
      root.querySelector('[data-check-context]').textContent = complete
        ? result.context || ''
        : '';
      action.firstChild.textContent = complete
        ? 'Request this custom setup scope '
        : 'Discuss your HR setup ';
      action.href = complete
        ? `/contact/?service=${result.service}&roadmap=${result.codes.join(',')}#service-enquiry`
        : '/contact/?service=people-setup#service-enquiry';
    }
    hrQuestions.forEach((question) => {
      const slider = root.querySelector(`[data-hr-slider="${question.id}"]`),
        select = form.elements.namedItem(question.id);
      slider.addEventListener('input', () => {
        select.value = question.options[Number(slider.value)].value;
        slider.setAttribute(
          'aria-valuetext',
          question.options[Number(slider.value)].label,
        );
        update();
      });
      select.addEventListener('change', () => {
        const index = question.options.findIndex(
          (option) => option.value === select.value,
        );
        slider.value = String(Math.max(0, index));
        slider.setAttribute(
          'aria-valuetext',
          index < 0 ? 'Not selected.' : question.options[index].label,
        );
        update();
      });
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
    });
    form.addEventListener('reset', () =>
      setTimeout(() => {
        root
          .querySelectorAll('[data-hr-slider]')
          .forEach((slider) =>
            slider.setAttribute(
              'aria-valuetext',
              'Not selected. Move the slider or choose a value below.',
            ),
          );
        update();
      }, 0),
    );
    update();
  });
}
