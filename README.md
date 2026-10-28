# Quantum Leaps

Static HR services website built with Astro. Five service lines share one catalogue: Recruitment, People Setup, Hiring Support, Founder Voice and Career Prep. The first four serve companies; Career Prep is a ₹3,999 one-time candidate package (limited-period offer). No application server or paid animation service is required.

## Local development

Use Node 22.12 or newer in the Node 22 line.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4321/. For a production-equivalent preview, stop the development server, run `npm run build`, then `npm run preview`. Generated `dist` is ignored by Git. The preserved `/privacy.html` URL is written by the production build; use the built preview for exact production URL checks. Do not run a root-directory Python server: source pages now live under `src/pages`.

```sh
npm run format:check
npm run build
npm test
git diff --check
```

The build publishes 29 static pages and fingerprinted browser bundles. Netlify uses `node scripts/build.cjs`, publishes `dist`, and needs no function or application server. Its existing quotas still apply. Building locally does not trigger a Netlify deployment.

## Source map

- `src/pages/index.astro`: the umbrella homepage, video introduction and five-service explorer.
- `src/pages/recruitment.astro`: the retained specialist-hiring landing page, collision lightning, shortlist and fictional dossier.
- `src/pages/[service].astro`: People Setup, Hiring Support, Founder Voice and Career Prep pages, generated from `src/data/services.js`.
- `src/pages/services.astro` and `knowledge.astro`: service and editorial discovery. Existing blog URLs remain available.
- `src/components` and `src/layouts`: shared navigation, footer, SEO and homepage sections.
- `src/scripts`: small behaviour modules; recruitment, forms, articles and audio load only where needed.
- `src/styles`: shared foundation, retained recruitment/form styles and isolated page styles.
- `assets`: local fonts, imagery and video. `public/assets` links to this directory for Astro publication.
- `google-apps-script`: existing private-upload/job/enquiry backend, separately deployed to Google.

The earlier root HTML/CSS/JS entry points were replaced by these sources. The old `Quantum Leaps Website (3).html` export, `main.js` prototype and Netlify function source remain reference material only and are excluded from publication. Internal notes and tests are never copied into `dist`.

## Confidentiality and forms

HR consulting runs inside the client's infrastructure and agreed access. The service enquiry accepts only contact details, a service category and a non-confidential brief. It has no attachment control. Do not request employee records, payroll, appraisal files or confidential documents through this form.

Recruitment is a separate, explicitly labelled workflow: CV/JD uploads, approved jobs and applications remain connected to the existing Google Apps Script. Service enquiries reuse its Contact Inquiry flow, with the chosen service in the saved message; **no Apps Script update is needed for this frontend rebuild**. Enquiries and feedback reach Submissions; Jobs holds employer briefs; Applications holds CVs and job references. Keep all three tabs private.

CV submission still requires a handler advertising `candidate_details: true`. Files remain limited to 5 MB. [Google setup](google-apps-script/SETUP.md) describes the existing append-only schema. Real deployed permissions, persistence and Google quotas need an authorised end-to-end check before release.

For isolated synthetic browser tests, build first, then run `python3 tests/preview-server.py` and open http://127.0.0.1:8081/. This substitutes the Google endpoint only in served browser bundles, captures test payloads in `/tmp`, and makes no Google writes. `/tmp/qleaps-fixture-state` supports `normal`, `empty`, `error` and `legacy`.

## Content and release boundaries

No AI matching capability, client endorsements, invented vacancies or performance figures are claimed. Sample candidate dossiers are fictional and labelled accordingly. Career Prep is preparation, not a placement guarantee; add-on mock interview pricing is not yet set. Policy/POSH service scope must be confirmed for the individual engagement rather than presented as automatic legal certification.

Videos and ambient animations respect reduced motion, tab visibility and viewport visibility. The homepage keeps full-screen handshake footage with a centred HR-services message and links to all five service lines. Both landing pages omit the visible pause control; reduced-motion and offscreen playback safeguards remain. Optional synthesized piano/shore/bird ambience stays available on the homepage and recruitment page and off by default. Scout remains removed. Recruitment collision lightning has no cooldown. Recruitment uses a separate local interview clip; its source and usage record are in [docs/media-sources.md](docs/media-sources.md).

See [RELEASE-CHECKLIST.md](RELEASE-CHECKLIST.md) before a future release. This rebuild is local and has not been committed, pushed or deployed. The Powered by Netlify badge is controlled in the Netlify dashboard; changing it requires no rebuild.

## Restored interactive features

The homepage and Services page include the four-input HR maturity diagnostic and clearly illustrative work scenarios. Service scope expands on the Services page. The self-check is a local conversation aid, never a compliance certificate: answers are not sent or stored, and its enquiry link carries only a service category. See [the system audit](docs/SYSTEM-AUDIT-2026-10-28.md) for prioritised product, conversion, accessibility and SEO recommendations.

## Founder-focused enterprise iteration

The company path now includes a founder briefing section, guided HR self-check and explicit engagement boundaries. `/for-candidates/` separates recruitment, CV submission and optional paid preparation. `/working-examples/` publishes four original starter templates as HTML and editable text files, generated statically at build time. [Research and implementation notes](docs/ENTERPRISE-DESIGN-2026-10-28.md) document the rationale and remaining owner decisions. No additional backend or paid runtime is introduced.

The HR maturity diagnostic is discoverable on Home, Services, People Setup and Hiring Support. Its roadmap link carries only recommended workstream codes to an enquiry draft for review. See [SEO and diagnostic notes](docs/SEO-DIAGNOSTIC-AND-MOTION-2026-10-28.md).
