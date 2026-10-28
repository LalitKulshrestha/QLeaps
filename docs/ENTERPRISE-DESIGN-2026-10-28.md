# Quantum Leaps — founder-focused enterprise iteration

Local implementation, 28 October 2026. Not committed or deployed.

## Research and what we took from it

- [Korn Ferry capabilities](https://www.kornferry.com/uk/capabilities) leads with the business challenge and connects talent with organisational needs. Applied as problem-first founder copy and clear pathways into a brief. We did not borrow its statistics, scale claims, product capabilities or visual identity.
- [Mercer workforce and organisation transformation](https://www.mercer.com/solutions/transformation/workforce-and-organization-transformation/) relates people work to business priorities and distinguishes the areas of support. Applied as service engagement boundaries: who it is for, where work starts and what can be reviewed.
- [NN/g corporate information research](https://www.nngroup.com/reports/about-us-presenting-company-information/) emphasises authentic, transparent company information. Applied as useful working samples and explicit delivery boundaries, without manufacturing biographies, clients or testimonials. Only the public report summary was consulted; no claim is made to have reviewed its paid research.
- [Google's people-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) favours content that helps its intended audience. Applied as original, crawlable starter materials rather than more generic SEO copy.

These sources informed the decisions; premium positioning and conversion improvements are design hypotheses to test, not measured outcomes.

## Design decisions implemented

1. **A founder-specific opening.** Full-screen film retained. The headline connects business building with people; the supporting copy names recruitment, HR foundations and founder communications for growing companies, brands and agencies in India. The primary route is company support, a secondary route starts the HR check, and candidates have their own entry.
2. **A working-brief section, not another service grid.** Three questions frame the engagement around the outcome, the definition of good work and the client's control. The detailed services remain off the homepage, as requested.
3. **Separate candidate journey.** `/for-candidates/` distinguishes vacancies, CV submission and optional paid preparation. Buying Career Prep is not a condition for submitting a CV. The ₹3,999 package, reference price ₹5,999 and limited-period wording remain; no lifetime promise or payment flow was introduced.
4. **A shorter HR check.** Progressive one-question-at-a-time interaction, Back/Next, answer validation, reset, view-all mode and a final recommendations state. All questions remain in the HTML for a readable fallback. No answers are sent, placed in the URL or stored. The enquiry link still passes only the service category.
5. **Proof of the work.** `/working-examples/` provides four original starter templates: interview scorecard, onboarding checklist, people health check brief and founder voice brief. Each has a readable HTML page and an editable plain-text file. Samples are labelled illustrative, not represented as client work or validated professional/legal instruments.
6. **Clearer service engagements.** Each non-recruitment service page now states fit, starting point and reviewable output. The existing scope lists and confidentiality boundaries remain. Recruitment retains its established page, workflows, shortlist, dossier and distinct interview film.
7. **Shared enterprise visual language.** Blue, white, navy, restrained rules, editorial hierarchy, consistent spacing and subtle motion. No icon confetti, new gradient effects, invented trust badges, fabricated performance metrics or additional animation framework.

## Architecture and cost

Astro continues to generate static files. The sample downloads are generated at build time, not served by an application backend. No new paid service, analytics collector, payment processor or hosting runtime was added. Existing Google Apps Script is unchanged. Build output now has 29 HTML pages plus four small text templates; total `_astro` output is approximately 208 KB across all pages, not per-page download weight.

Existing Netlify quotas still apply to a future production deployment. Local builds do not trigger Netlify builds.

## Verification

- Static build, formatter, Google handler regression suite, HR recommendation logic and publication contracts.
- All generated pages retain resource/anchor, canonical, JSON-LD, H1 and sitemap checks. New templates are checked for publication and sample labelling.
- Guided HR check: empty-answer validation, all four answers, final result and view-all mode exercised in the browser. Existing no-data-transfer behaviour retained.
- All 29 HTML routes checked at 320, 820 and 1440 px: 87 checks without horizontal page overflow. Screenshots recorded during this iteration. No Google test records created.
- Download files are present and linked correctly in the static build. The in-app browser's automated download-event check timed out; no end-user download completion is claimed from that tool. The interview-scorecard text target was opened directly in the browser and its content verified; the full sample is also readable as HTML.

## Remaining business decisions

Confirm scope/revision limits, delivery arrangements, refund/tax information and a real offer deadline before taking payment. Confirm named delivery expertise and obtain permission for real proof as engagements complete. These are intentionally not invented in the website copy.

A discreet motion setting remains recommended for accessibility, but the previously rejected pause control has not been reintroduced. This iteration does not claim a WCAG certification, production Core Web Vitals score or improved search ranking.
