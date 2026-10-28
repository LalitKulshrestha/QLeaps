# Quantum Leaps — system and conversion audit

28 October 2026. Local source and static build review; responsive browser checks. This is not a production performance measurement, legal review, penetration test or Google storage verification.

## Verdict

The static Astro + Netlify architecture fits this stage. Keep it. The website can explain the five services, engage visitors with an HR self-check, publish useful guides and take enquiries without another server. It is a marketing and enquiry website, not yet an HR platform, payment system or lifetime membership product.

The largest opportunity is commercial clarity and evidence. More animation will not compensate for an ambiguous offer or unsupported results. Keep one interaction per visitor goal: HR self-check for companies, clearly defined Career Prep for candidates, and live vacancies for job seekers.

## Restored in this iteration

- HR evaluation on Home and Services, using four questions with no default answers. Ownership, process consistency, workplace-policy review and hiring structure each get independent recommendations. A strong answer cannot cancel out a gap elsewhere.
- A clear result state, answered count, native keyboard-accessible radios, live summary, reset and contextually routed enquiry link. No invented compliance percentage or claim of certification.
- Answers remain in page memory; nothing is stored or submitted. The enquiry URL passes only the service category. The page explicitly explains this.
- The three operational example components, now labelled illustrative scenarios. They retain challenge, approach and deliverable structure, without presenting invented completion dates, placements or statutory guarantees as client results.
- Expandable full scope in the five-service explorer, retained on Services. The homepage still omits the detailed service catalogue as requested.
- Blue/white/navy styling, responsive result card and scenario layouts. Existing videos, recruitment workflows, music, articles and pricing remain.

## Priority 1 — resolve before taking payment or making the next production release

### 1. Define “₹999 / lifetime” in plain language

Current gap: the public offer says lifetime, while the listed work is a profile review, CV/LinkedIn rework, first-shortlist tailoring and one mock interview. No payment, membership account, entitlement ledger or refund flow exists.

Decision needed: whose lifetime, which benefits continue, how many revisions are included, turnaround, how to book, when the limited offer ends and what happens to existing buyers afterwards. Keep the included mock count explicit; do not imply unlimited coaching. Do not add a countdown until a real end date is agreed. Define applicable pricing/tax/refund information before accepting money.

Best next implementation: a short “What you receive / What happens next / What lifetime includes” panel and a manual enquiry/booking process. No new server is necessary for a manually delivered service.

### 2. Add tangible proof without invented clients

The scenarios demonstrate thinking, not evidence of completed projects. Keep the distinction visible. Add one genuinely usable, downloadable example per company service: a role scorecard, onboarding checklist, sample handbook contents and founder voice brief. Mark samples as samples and remove real company/employee details.

This is a stronger early-stage trust signal than generic enterprise labels or fabricated percentages. Add named delivery biographies only after approved facts are supplied. Collect permission for real testimonials/results as work is completed.

### 3. Make the enquiry handoff operationally reliable

The forms have local validation, receipt references and regression coverage. That does not verify the deployed Google endpoint, permissions, delivery latency or owner follow-up.

Before release, conduct authorised disposable tests against Google: service enquiry in Submissions, private JD/CV storage, Pending jobs hidden, Approved roles visible and candidate Job ID retained. Assign a primary owner and backup for triage, job approval, deletion requests and failed submissions. Keep spreadsheet/folders Restricted.

Recommendation: define an internal response target you can actually meet. Publish it only once the process supports it. No automatic response or booking promise should precede the operation.

## Priority 2 — strongest conversion and experience improvements

### 4. Promote the HR self-check as the entry product

Now restored with a direct hero link. It should lead to a scoped people health check, not a sales score that declares the organisation unsafe or compliant. The current four questions are transparent prompts, not a validated assessment.

Next improvement: test a one-question-at-a-time presentation on mobile, with visible progress, Back/Next and a final summary. Keep all questions crawlable and usable without the wizard. Consider a local print/download summary only if visitors ask; do not collect answers just to create a lead.

Success measures: self-check start/completion, relevant enquiry clicks, enquiry completion and qualified conversations. Avoid treating all website traffic as success. Measurement must not capture CV contents, employee records or self-check answers.

### 5. Give each company service a tangible buying boundary

The lists explain scope, but buyers still need to understand their commitment. Add: ideal starting situation, what is delivered, inputs required, client responsibilities and how scope is agreed. People Setup should lead with the people health check; Hiring Support should distinguish assessment support from recruitment/search.

Do not invent a universal turnaround. Publish a range only after delivery capacity supports it. Explain that client-system access and any specialist workplace-policy review are agreed separately.

### 6. Restore user control over ongoing motion without the old text button

The user requested removal of “Pause ambient motion”; it remains removed. Reduced motion and offscreen/tab pause safeguards are present, but they are not equivalent to a visible pause mechanism for people who want to stop ongoing motion.

Recommend a small, clearly named icon control, or a single “Reduce motion” setting placed discreetly in the header/footer. It should control video and decorative animation together. Do not silently bring back the rejected text button. Review recruitment collision flashes as part of an accessibility pass; this audit did not measure flash frequency/luminance or certify WCAG conformance.

Reference: https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide

### 7. Make the homepage an intentional sequence

Recommended sequence is now: promise + full-screen film → HR self-check → illustrative work scenarios → confidentiality → founder/candidate context → useful guides → enquiry. The service catalogue stays on Services.

The restored content increases page length. Prefer spacing and selective disclosure over adding more panels. On mobile the self-check is the longest interaction; its result should be reachable without a long return scroll. If one section must be shortened next, shorten repeated introductory copy before removing useful tools or guides.

## Priority 3 — SEO, performance and maintainability

### 8. Build search depth around actual buyer questions

Canonicals, crawlable HTML, sitemap, internal links, metadata and structured data pass static checks. They are a foundation, not a ranking guarantee. Current guides are weighted toward hiring/candidates; the expanded HR services need equally specific, practitioner-reviewed content.

Suggested next guides: “What should a growing team review in a people health check?”, “How to build an interview scorecard for a tech lead” and “What to prepare before writing an employee handbook”. Include approved authors/reviewers and useful examples. Avoid mass-producing location pages or broad legal summaries without expertise.

After release, verify Search Console ownership, sitemap indexing, canonical selection and real queries. Only add JobPosting schema for actual current jobs with accurate details, closing status and a usable application journey. The current dynamic feed is not a replacement for crawlable role-detail pages; consider that separately with Netlify build-credit costs in mind.

Reference: https://developers.google.com/search/docs/fundamentals/creating-helpful-content

### 9. Measure the video experience before adding richer media

The build has roughly 196 KB of combined hashed CSS/JS across the site and approximately 5.8 MB of local assets; these are directory totals, not per-page transfer sizes or Core Web Vitals. The homepage film is approximately 745 KB and the recruitment interview film approximately 397 KB. Both have posters and no audio track; media is local.

Run mobile Lighthouse and production PageSpeed/field measurements after release, documenting LCP, INP and CLS rather than guessing a score. Check slow-network video/poster behaviour. The next low-risk asset improvement is WOFF2 fonts and appropriately sized responsive images; preserve visual comparison screenshots. Do not add WebGL just to appear modern.

### 10. Make content and style regressions difficult

Keep approved service data in one catalogue, shared shell styles separate from page styles, and archived prototypes outside publication. Keep visual checkpoints for home, service, contact, candidate, article and privacy pages. Existing tests cover static contracts and Google handler logic; new tests cover the self-check branches.

Next engineering investment: a repeatable responsive browser smoke suite and checks for duplicate IDs, missing resources, links, metadata, restricted files and empty form results. Avoid replacing this small static site with an application backend until a concrete workflow requires it.

## Boundaries and outstanding owner decisions

- Confirm lifetime offer terms, real offer end date if any, delivery capacity, add-on pricing and refund/booking rules.
- Provide approved biographies and publishable work examples; no real-client performance figures were supplied for this audit.
- Choose whether a discreet motion control is acceptable. No pause control was reintroduced in this iteration.
- Confirm live Google handling and response ownership before release; no production records were created for these tests.
- No analytics, payment service, server, automated legal advice or AI matching claim was added. No commit, push or deployment performed.

## Verification of the reinstatement

Static build, formatter, Google handler regression tests, self-check logic tests and 23-page publication/link/metadata contracts pass. Home and Services were checked at 320, 820 and 1440 px without horizontal page overflow. Browser checks confirmed incomplete state, all-reviewed state, an independently flagged workplace-review gap, reset, category-only enquiry URLs and expandable service scope. Screenshots are saved in the local blue-white repair preview folder. Actual production speed, enquiry conversion and Google persistence remain unmeasured in this local audit.
