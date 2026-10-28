# Website audit — first impressions and site-wide experience

28 October 2026. Local browser inspection and static-source review. No deployment or production form submission.

## Verdict

The main weakness in Services, Knowledge and For Candidates was the opening hierarchy: large, abstract headlines and long introductory space delayed useful content. Services also introduced the offering twice. Those issues are repaired. The remaining site-wide priorities are evidence, delivery clarity and accessibility, rather than another visual rebuild.

## Fixed

| Finding | Impact | Change |
|---|---|---|
| Three hub pages inherited a 78 px headline treatment | Informational pages behaved like campaign heroes, with little useful content on the first screen | Dedicated hub opening, 36–52 px desktop range and 34 px mobile heading, tighter breadcrumbs and spacing |
| Services repeated its headline/introduction inside the explorer | Visitors scrolled through two introductions before choosing a service | Removed the duplicate introduction on Services; kept a short “Choose your starting point” label |
| Services offered no immediate help deciding | Broad service range felt like a list without guidance | HR self-check entry and sample-deliverable link in the opening |
| Knowledge began with general copy and another promotional block | Actual guides were pushed down | Featured guide, company/candidate jump links and working-example navigation; sample invitation retained further down |
| Candidate actions appeared after a long introduction | Job seekers had to scan for the relevant action | Open roles and CV submission immediately available, with paid preparation visibly optional |
| Typography was consistent but page purpose was not apparent | The three hubs felt interchangeable | Shared opening framework with distinct utility areas: service guidance, editorial feature and candidate actions |

At a 1280 × 800 desktop viewport, the first service choice now starts at approximately y=559, visible on the initial screen. The previous view showed no service choice in its first 720 px. These are layout observations, not conversion or performance measurements.

## Site-wide findings and next priorities

### P1 — Clarify delivery before taking payment

Career Prep now correctly says ₹3,999 one-time package, previously ₹5,999, with no lifetime wording. Scope is listed, but turnaround, revision limits, booking, refund/tax details and a genuine offer deadline still need owner decisions. Do not invent these to fill a page. Provide the exact terms before payment is offered.

### P1 — Add real operating proof as it becomes available

Working samples and illustrative scenarios are correctly distinguished from client results. They are useful early-stage proof of approach. Add approved delivery-team introductions and real testimonials only when substantiated. Avoid placing generated/stock people imagery where it could imply they are actual team members.

### P1 — Motion accessibility remains a known gap

Visible pause controls were removed at the user's request. Reduced-motion and offscreen playback safeguards remain, but do not provide the same control to every visitor. A discreet, clearly named motion setting is still recommended, controlling video and decorative animation together. It has not been reintroduced in this iteration. Collision flashes have not been instrumentally measured; this audit is not WCAG certification.

Reference: https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide

### P1 — Verify the deployed enquiry operation before release

Regression tests cover payload contracts and Google handler behaviour locally; they do not confirm production Google storage permissions, quotas or response ownership. Before deployment, use authorised disposable data to verify enquiry receipts, private uploads, job approval and stable application references. Confirm the primary owner and backup for follow-up and deletion requests.

### P2 — Reduce repeated persuasion as real proof is added

The homepage retains the founder brief, HR check, illustrative scenarios, confidentiality, Founder Voice, Career Prep, guides and closing enquiry as requested. This is a long journey, especially on mobile. Keep the useful interactions; shorten repeated introductory and confidentiality copy before adding more sections. As real work examples appear, use them to replace generic persuasion rather than stacking more panels.

### P2 — Expand Knowledge around the new company services

Existing guides are weighted toward recruitment and careers. Prioritise specific, practitioner-reviewed People Setup and Hiring Support material, linking to appropriate services and samples. Keep author/reviewer attribution factual. Do not mass-produce legal or location content to simulate authority.

Reference: https://developers.google.com/search/docs/fundamentals/creating-helpful-content

### P2 — Measure actual loading and enquiry quality after release

The site remains static with local media and page-specific JS imports. That is appropriate for the budget. No production LCP, INP, CLS, conversion or search-ranking measurements were taken. Next: record mobile performance on the deployed site and review Search Console indexing/query data. If analytics are introduced, avoid capturing CVs, messages or self-check answers.

### P3 — Keep this opening pattern for future hubs

Use a compact introduction with an immediate task or useful feature. Reserve the full-screen video treatment for the main landing page. Do not let page-local styles affect shared navigation/footer. Keep content samples, pricing and routes tested in the build.

## Verification and boundaries

- Build, formatter and regression suites pass. Static checks cover all 29 HTML pages, metadata, JSON-LD, sitemap, local resources/anchors, candidate/employer forms and template files.
- Services, Knowledge and For Candidates inspected at 320, 390, 820 and 1440 px. No horizontal page overflow or duplicate H1s in these 12 checks.
- Immediate role/CV links, knowledge category anchors, service selection and HR-check navigation reviewed in the browser.
- Site-wide route sweep performed on mobile; shared header/navigation retained. No backend, form schema, payment or external service changes.
- No production submissions, Git commit, push or Netlify deployment.
