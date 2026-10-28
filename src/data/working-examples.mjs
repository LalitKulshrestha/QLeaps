export const workingExamples = [
  {
    slug: 'interview-scorecard',
    name: 'Interview scorecard',
    category: 'Hiring Support',
    service: 'hiring-support',
    description:
      'Align interviewers around outcomes and evidence before anyone meets a candidate.',
    intro:
      'A starter brief for a senior engineering hire. Adapt the criteria to the actual role; this is not a validated test or automated selection system.',
    sections: [
      {
        title: '01 / Set the mandate',
        items: [
          'Role and reporting line: [complete]',
          'Three outcomes expected in the first six months: [complete]',
          'Working arrangement, budget and decision owner: [agree before search]',
        ],
      },
      {
        title: '02 / Agree what good looks like',
        items: [
          'Technical judgement: explain a design decision, alternatives and trade-offs.',
          'Delivery: describe ownership of an outcome, constraints and what changed.',
          'Collaboration: show how disagreement, feedback and cross-functional decisions were handled.',
        ],
      },
      {
        title: '03 / Record evidence, not impressions',
        items: [
          'For each criterion record the question, relevant example, individual contribution and open questions.',
          'Use a shared scale: evidence missing / partly demonstrated / demonstrated. Keep “not assessed” separate.',
          'Give interviewers the same criteria; agree role-relevant accommodations and avoid unrelated personal information.',
        ],
      },
      {
        title: '04 / Debrief and decide',
        items: [
          'Compare independent notes before group discussion.',
          'Resolve missing evidence with a focused follow-up; do not treat missing evidence as a fact about ability.',
          'Record the decision owner, rationale and agreed candidate communication.',
        ],
      },
    ],
  },
  {
    slug: 'onboarding-checklist',
    name: 'Onboarding checklist',
    category: 'People Setup',
    service: 'people-setup',
    description:
      'Make the first month clear for the new joiner, their manager and the team.',
    intro:
      'A starter checklist for the people responsible for a new joiner. Keep personal details and employment documents inside your own approved systems.',
    sections: [
      {
        title: '01 / Before the first day',
        items: [
          'Manager: agree role outcomes and the first-week schedule.',
          'Operations: confirm approved equipment and system access with the right owners.',
          'People owner: share joining information through the approved channel; nominate a buddy.',
        ],
      },
      {
        title: '02 / First day',
        items: [
          'Explain the business, team responsibilities and where to ask for help.',
          'Walk through the applicable handbook and workplace processes.',
          'Confirm access works; explain confidential information and acceptable handling.',
        ],
      },
      {
        title: '03 / First week',
        items: [
          'Manager and joiner: agree the 30-60-90 day plan and feedback rhythm.',
          'Buddy: introduce key colleagues and day-to-day ways of working.',
          'People owner: check for unresolved questions and access issues.',
        ],
      },
      {
        title: '04 / First-month review',
        items: [
          'Discuss progress against agreed outcomes and identify support needed.',
          'Ask what was confusing in onboarding and improve the checklist.',
          'Record owner, due date and completion evidence for outstanding actions.',
        ],
      },
    ],
  },
  {
    slug: 'people-health-check',
    name: 'People health check brief',
    category: 'People Setup',
    service: 'people-setup',
    description:
      'Agree what to review, who owns it and what a useful handover should contain.',
    intro:
      'A scoping sheet for an initial people health check. It is not a legal audit or certification; specialist requirements and access are agreed for each engagement.',
    sections: [
      {
        title: '01 / Establish the priority',
        items: [
          'What has changed in the team, and what is difficult today?',
          'Which processes need attention: onboarding, leave, appraisals, exits or policy review?',
          'Who sponsors the work and who will use the output?',
        ],
      },
      {
        title: '02 / Agree access and boundaries',
        items: [
          'Name the client-managed systems and authorised access owners.',
          'Agree the minimum access needed, review steps and how access ends.',
          'Do not send employee records, payroll or appraisal histories through an initial website enquiry.',
        ],
      },
      {
        title: '03 / Review the working process',
        items: [
          'Compare the documented process with the way the team actually works.',
          'Record gaps, unclear responsibilities and specialist advice that may be needed.',
          'Prioritise actions by business need and agree owners rather than inventing a compliance score.',
        ],
      },
      {
        title: '04 / Make the handover usable',
        items: [
          'Agree a prioritised action list with owners and review dates.',
          'Identify the templates, induction material or training needed.',
          'Confirm what is included now, what is outside scope and what requires a separate specialist review.',
        ],
      },
    ],
  },
  {
    slug: 'founder-voice-brief',
    name: 'Founder voice brief',
    category: 'Founder Voice',
    service: 'founder-voice',
    description:
      'Turn a founder’s own thinking into a clear, reviewable content brief.',
    intro:
      'A starting point for LinkedIn posts, newsletters and an employer story. Use approved, non-confidential inputs; retain the founder’s judgement and review.',
    sections: [
      {
        title: '01 / Start with the audience',
        items: [
          'Who should this reach: prospective hires, clients, peers or partners?',
          'What do they misunderstand or need to know?',
          'What useful action or conversation should the piece enable?',
        ],
      },
      {
        title: '02 / Find the point of view',
        items: [
          'What do you believe about this topic, and why?',
          'Which first-hand example can you share with permission?',
          'What trade-off, lesson or disagreement gives the piece substance?',
        ],
      },
      {
        title: '03 / Keep the voice recognisable',
        items: [
          'Capture phrases the founder naturally uses and language they avoid.',
          'Choose one clear idea, one concrete example and a useful ending.',
          'Remove invented quotations, confidential references and unsupported outcome claims.',
        ],
      },
      {
        title: '04 / Review before publication',
        items: [
          'Founder: confirm accuracy and whether it sounds like you.',
          'Business owner: confirm permissions, attribution and information boundaries.',
          'Agree the final version and channel; publication happens only after approval.',
        ],
      },
    ],
  },
];
function toCleanAscii(text) {
  return text
    .replace(/[—–]/g, ' -- ')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");
}

export function exampleText(example) {
  const lines = [
    'QUANTUM LEAPS -- STARTER TEMPLATE',
    example.name,
    'Illustrative working sample. Adapt to your context; not a client deliverable or legal advice.',
    '',
    example.intro,
    '',
    ...example.sections.flatMap((section) => [
      section.title,
      ...section.items.map((item) => '- ' + item),
      '',
    ]),
    'Next: https://qleaps.in/' + example.service + '/',
    'Please keep confidential information within your own approved systems.',
  ];
  return lines.map(toCleanAscii).join('\n') + '\n';
}
