# Pre-deployment audit — 28 October 2026

Verdict: the production build and tested journeys work, but I recommend addressing the diagnostic content and mobile feedback placement before release. This is a targeted release hold, not a recommendation for another redesign.

## Findings, in priority order

### P1 — Unsupported protection and independence claims

Locations: `src/components/HRDiagnostic.astro:95`, `src/scripts/hr-check.js:35`, `src/data/hr-check.mjs:123`.

The diagnostic says “100% protection”, “Complete 100% risk insulation and compliance”, and that independent governance provides the remaining 15%. Four self-reported inputs cannot establish these claims. The fixed 85% ceiling is a site-defined rubric, not an established limitation of in-house HR. The callout also guarantees intact personal relationships and says internal personnel cannot legally provide the documentation alone; that is too broad.

Recommended copy: “Independent support can bring a fresh perspective, clarify responsibilities and help review specific governance gaps. Scope and applicable requirements are agreed for your organisation. No assessment or provider can eliminate every risk.” Explain any retained 85-point scoring ceiling as this tool’s design choice, without promising that buying a service earns the remaining points.

The POSH Act does specify committee composition, including an external member under section 4(2)(c). That specific requirement should not be expanded into a blanket outsourcing requirement or a 100% compliance promise. Primary reference: https://www.indiacode.nic.in/bitstream/123456789/15239/1/sexual_harassment_act_2013.pdf

### P2 — Gauge is not visible while answering on mobile

Location: `src/components/HRDiagnostic.astro:28`, `:95`, `:828`.

At 390 × 844, after interacting with the fourth choice, the fourth input was at y≈1076 and the gauge at y≈1888 in the same viewport measurement. The form and the long governance callout precede the score when the layout becomes one column. The working live update is therefore hard to experience on a phone.

Recommendation: a compact sticky readiness summary while this section is visible, with the detailed roadmap below. Move explanatory governance content after the result. Keep all four questions available without introducing a wizard again.

### P2 — The gauge introduces an unreachable fourth category

Locations: `src/components/HRDiagnostic.astro:161`, `:501`; `src/data/hr-check.mjs:145`.

The rubric sums to at most 85, but the legend includes “86–100 · With Quantum Leaps” and the dial adds a fourth blue segment. No selection can reach it. This also differs from the requested red/amber/green system. Use three consistent bands and transparent thresholds. Do not represent an unmeasured service outcome as a score.

### P3 — Automated tests do not cover the new percentage rubric

Location: `tests/hr-check.cjs`.

The existing tests cover maturity stages and roadmap logic, but do not import `readinessHR`. An additional audit run exercised all 320 valid answer combinations successfully: finite scores, bounds 0–85, four recognised answers and all three returned bands. Add permanent threshold, reset/partial-answer and non-scoring-team-size coverage after agreeing the final rubric.

### P3 — Tighten time and offer wording

The Services entry calls this a practical roadmap in four inputs; individual service links call it a 60-second diagnostic, while the card says “4-Minute Interactive Audit”. Use one description such as “Four-question self-check”. Calling it an audit is stronger than the tool actually provides.

Career Prep consistently shows ₹3,999, previously ₹5,999, one-time, limited-period. No lifetime wording remains. Before publishing, ensure the previous-price claim is accurate and define the offer period and applicable tax/payment terms in the agreed purchase process. Add-on mock interviews are clearly marked price to be confirmed; an enquiry can still proceed.

## Checks completed

- Fresh production build: PASS, 29 static HTML pages.
- Existing webhook, HR-stage and site contract test suites: PASS.
- Prettier check and tracked diff whitespace check: PASS.
- Static contracts: local assets and links, anchors, H1s, canonical/meta/JSON data, sitemap, form fields, publication boundary and Services-only diagnostic placement: PASS.
- Independent scan: no duplicate titles or descriptions.
- All 19 built raster image instances: alt attributes present and dimension aspect ratios correct. Social preview asset matches its declared 1200 × 630 size.
- Browser geometry scan of all 29 routes at 390 px and 768 px: no horizontal page overflow or broken loaded images detected. Decorative motion paths extend within clipped containers; they did not cause page overflow.
- Main five destinations checked at desktop 1440 px and landscape 1024 px: no horizontal overflow. Home, Services, Recruitment, Contact and Submit CV checked at 320 px: no horizontal overflow. Service-detail and form pages additionally reviewed at the browser’s desktop sizing.
- Mobile menu opens, updates aria-expanded and closes with Escape: PASS.
- Optional music switch changes on/off state: PASS. This is a control check, not an audio quality or Safari autoplay certification.
- Services selector switches to People Setup and shows its correct content/link: PASS.
- Readiness selections update percentage, band and roadmap; red, amber and green states observed. Reset returns to 0 / 0 of 4 answered: PASS.
- Recruitment radar/film card remained 526.80 px high before/after switching at the tested desktop size. New local Indian office video decoded (readyState 4) and played: PASS.
- Diagnostic handoff correctly prefills only recommended workstream titles in the enquiry. Local enquiry and employer job posting both returned confirmed local receipts. Role filtering correctly showed a no-matches message.
- Read-only check against the configured Google jobs service returned a valid empty-state message, with no console errors captured in that check. No production submissions were made.

## Content and SEO assessment

The five-service structure, company/candidate distinction, confidentiality message, separate CV/JD path and preparation-without-job-guarantee wording are coherent. Illustrative scenarios are labelled as examples rather than client case studies. New image assets have correct dimensions and no missing local references were found.

Technical SEO foundations are present: indexable static pages, unique titles/descriptions, production canonicals, social metadata, organization/site/page structured data and a sitemap. These are eligibility foundations, not a ranking guarantee. There was no Search Console ownership/indexing, real-user Core Web Vitals or search-performance audit in this run.

## Limits and deployment checks still needed

This is a local Chromium/browser-viewport audit, not physical iPhone/iPad/Android testing or independent Safari/Firefox coverage. Two larger browser batches timed out; their unreturned results are not counted as completed. Not every page received a full manual visual review at every possible size.

Google handler regression tests passed, and local enquiry/posting flows were exercised, but actual deployed Google Sheet writes, Drive CV/JD uploads, permissions and email delivery were not tested with new production records. A production smoke test with clearly labelled disposable data remains necessary for full end-to-end sign-off. Netlify redirects and security headers were reviewed in configuration, not verified on a new deployed build. Real network performance and accessibility conformance have not been certified.

No application source was modified during this audit. No commit, push or deployment was performed.
