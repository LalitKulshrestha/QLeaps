// Indicative planning logic. No benchmark, legal conclusion or validated compliance score.
export const hrQuestions = [
  {
    id: 'team',
    title: 'Team size',
    hint: 'Choose a band, not an employee count or employee information.',
    options: [
      { value: '1-9', label: '1–9 people' },
      { value: '10-49', label: '10–49 people' },
      { value: '50-149', label: '50–149 people' },
      { value: '150-plus', label: '150+ people' },
    ],
  },
  {
    id: 'owner',
    title: 'Current HR owner',
    hint: 'Who takes responsibility for policies and people processes?',
    options: [
      { value: 'none', label: 'No clear owner' },
      { value: 'founder', label: 'Founder' },
      { value: 'admin', label: 'Admin / payroll' },
      { value: 'generalist', label: 'HR generalist' },
      { value: 'lead', label: 'Senior HR / People lead' },
    ],
  },
  {
    id: 'posh',
    title: 'POSH committee & review status',
    hint: 'Your reported status; applicability and requirements need a qualified review.',
    options: [
      { value: 'not-set-up', label: 'Not set up' },
      { value: 'incomplete', label: 'Incomplete / actions pending' },
      { value: 'unsure', label: 'Not sure / applicability unclear' },
      { value: 'reviewed', label: 'Reviewed, actions tracked' },
    ],
  },
  {
    id: 'drop',
    title: 'Offer-to-joining dropouts',
    hint: 'Of accepted offers, roughly how many did not result in joining?',
    options: [
      { value: 'unknown', label: 'Not tracked / not enough offers' },
      { value: 'low', label: 'Under 10%' },
      { value: 'moderate', label: '10–24%' },
      { value: 'high', label: '25% or more' },
    ],
  },
];
export const roadmapItems = {
  health: {
    title: 'People health check',
    text: 'Map current ownership, processes and the priorities for your team.',
    service: 'people-setup',
  },
  handbook: {
    title: 'Handbook & people-process handover',
    text: 'Agree practical onboarding, leave, appraisal and exit steps with named owners.',
    service: 'people-setup',
  },
  workplace: {
    title: 'Workplace policy & POSH review',
    text: 'Confirm applicable requirements, committee composition and open training or reporting actions with a qualified specialist.',
    service: 'people-setup',
  },
  hiring: {
    title: 'Interview scorecards & joining follow-up',
    text: 'Align role outcomes, assessment criteria, expectations and offer-to-joining conversations.',
    service: 'hiring-support',
  },
  maintain: {
    title: 'Focused process review',
    text: 'Review what is working, track changes and agree any specific hiring or people support needed.',
    service: 'people-setup',
  },
};
export function evaluateHR(answers) {
  const valid = Object.fromEntries(
    hrQuestions.map((q) => [
      q.id,
      q.options.find((o) => o.value === answers[q.id])?.value,
    ]),
  );
  const answered = Object.values(valid).filter(Boolean).length;
  if (answered !== 4)
    return { answered, stage: null, roadmap: [], service: 'people-setup' };
  const foundations = ['none', 'founder', 'admin'].includes(valid.owner);
  const workplaceGap = valid.posh !== 'reviewed';
  const hiringGap = valid.drop !== 'low';
  const codes = [];
  if (foundations) codes.push('health', 'handbook');
  if (workplaceGap) codes.push('workplace');
  if (hiringGap) codes.push('hiring');
  if (!codes.length) codes.push('maintain');
  const stage =
    valid.owner === 'none'
      ? 1
      : foundations || workplaceGap || hiringGap
        ? 2
        : 3;
  const stageLabel =
    stage === 1
      ? 'Build the foundations'
      : stage === 2
        ? 'Strengthen the setup'
        : 'Maintain and review';
  const signals = [];
  if (foundations)
    signals.push('People-process ownership needs a closer look.');
  if (workplaceGap)
    signals.push(
      'Your reported POSH status needs clarification or follow-up; this tool cannot determine compliance.',
    );
  if (valid.drop === 'unknown')
    signals.push(
      'Track accepted offers and joins before estimating a dropout rate.',
    );
  else if (hiringGap)
    signals.push(
      'Reported offer-to-joining dropouts deserve a focused process review.',
    );
  if (!signals.length)
    signals.push(
      'Your answers describe an owned and reviewed setup. Documents, legal requirements and outcomes have not been independently verified.',
    );
  return {
    answered,
    stage,
    stageLabel,
    signals,
    codes,
    roadmap: codes.map((code) => ({ code, ...roadmapItems[code] })),
    service:
      foundations || workplaceGap
        ? 'people-setup'
        : hiringGap
          ? 'hiring-support'
          : 'people-setup',
    context: ['50-149', '150-plus'].includes(valid.team)
      ? 'For a larger team, agree owners and access across functions and locations.'
      : 'For a smaller team, start with a focused scope and clear ownership.',
  };
}

// Site-defined planning rubric. A full score is not a compliance certificate.
export function readinessHR(answers) {
  const weights = {
    owner: { none: 0, founder: 10, admin: 10, generalist: 25, lead: 40 },
    posh: { 'not-set-up': 0, incomplete: 10, unsure: 0, reviewed: 30 },
    drop: { unknown: 0, low: 30, moderate: 15, high: 0 },
  };
  const answered = hrQuestions.filter((q) =>
    q.options.some((o) => o.value === answers[q.id]),
  ).length;
  const score = Object.entries(weights).reduce(
    (sum, [key, values]) =>
      sum + (Object.hasOwn(values, answers[key]) ? values[answers[key]] : 0),
    0,
  );
  return {
    score,
    answered,
    band:
      answered === 0
        ? 'neutral'
        : score < 40
          ? 'red'
          : score < 75
            ? 'amber'
            : 'green',
  };
}
