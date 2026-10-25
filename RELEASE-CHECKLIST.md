# Quantum Leaps — release handoff (25 October 2026)

The site is prepared for **specialist hiring across seniority levels**, including leadership search, for brands and agencies. It remains a static Netlify website. No new paid service, animation dependency or application server was added. This document records the release configuration and verification requirements.

## Google deployment and release operations

1. Back up the current Google Apps Script source. Replace **the existing Code.gs** with [google-apps-script/Code.gs](google-apps-script/Code.gs). Do not keep two copies of doGet/doPost.
2. Save and run **setupQuantumLeaps** in the editor. Existing rows/columns are retained. Applications gets five append-only columns: **Q LinkedIn, R Current title / organisation, S Notice period, T Relocation, U Target CTC**. Experience stays in K. Do not delete/recreate the workbook or rearrange these columns.
3. Update the **existing web-app deployment** to a new version, preserving its current `/exec` URL. Keep execution as the owning account and the existing public endpoint access. This does not require making the Sheet or CV folders public.
4. Open the existing endpoint with `?action=jobs`. It should return `version: 2`, **`candidate_details: true`** and `jd_attachments: true`. The website deliberately prevents CV submission to an older handler that would discard the new fields.
5. With authorised disposable data, confirm a hiring brief and JD save privately, a Pending job is not listed, an Approved job is listed, a CV links to the correct Job ID, all new fields appear in their columns, enquiries/feedback reach Submissions, and a Closed job rejects further applications. Local mocked tests do not establish Google's deployed permissions or quotas.
6. In Netlify, use the repository's updated configuration: **build `node scripts/build.cjs`; publish `dist`**. Remove any dashboard override that still publishes `.`. The build excludes Apps Script, tests, internal notes and old exports. The existing static workflow needs no Netlify function.
7. After the one reviewed release: verify a nonexistent path returns HTTP 404, inspect social previews and submit `https://qleaps.in/sitemap.xml` in Google Search Console. Verify ownership there yourself if it is not already set up.

## Recommended operating decisions

- Confirm who monitors contact@qleaps.in, the listed phone number, job approvals and saved applications. Set an internal response target that you can sustain; the public copy no longer invents a 24-hour promise.
- Keep the workbook, resume folder and JD folder Restricted, sharing with named colleagues only. The public Apps Script endpoint handles visitor submissions.
- Decide and maintain a real retention/deletion routine. The website does not automatically expire uploaded CVs or historical submissions. Its policy now describes manual management rather than claiming an automated two-year deletion feature.
- Internal team roles are presented as expressions of interest, not invented funded vacancies. Confirm actual openings before calling them live jobs.
- AI matching is not marketed on the launch website. Add factual wording only when the implementation and operating process exist.
- Partner biographies, client logos, testimonials and success metrics are intentionally absent until approved facts are available. Nothing needs to be invented to launch this venture credibly.
- `Submissions` is the enquiry/editorial-feedback and legacy-record tab. `Jobs` holds employer briefs and approval status. `Applications` holds current CVs and their job references. Keep all three.

## Completed locally

- Employer form identity, required experience, JD, status binding and payload contract repaired.
- Cross-page application by stable job ID; approved role prefilled; closed/unavailable role requires an explicit general-application choice.
- Candidate metadata saved separately; append-only schema; cached older clients do not erase newer optional details.
- Editorial feedback captures message, topic and role. Category and search filters apply together.
- 5 MB limit aligned across UI, JS and Apps Script. Safer filename rendering; keyboard-accessible native file controls.
- Mobile hiring CTA stays visible; accessible menu disclosure, Escape and focus behaviour.
- Dossier labelled fictional on every profile view; modal focus containment/restoration and background inerting.
- Honest positioning, broader buyer context, placeholder vacancies and unverified outcome figures removed.
- Six standalone practical guide pages with canonicals and article metadata; full sitemap; real 404; branded share image.
- Pausable/reduced-motion/offscreen-aware canvas and video; poster fallback and lighter video encode.
- Allowlisted static publication directory and cache updates. No additional runtime service.

## Reproducible checks

```sh
node --check script.js
node --check < google-apps-script/Code.gs
node tests/google-webhook.cjs
node scripts/build.cjs
python3 tests/site-contracts.py
git diff --check
```

`tests/preview-server.py` runs an isolated loopback fixture on port 8081. It substitutes the Google URL **only in the served test copy**, captures synthetic payloads in `/tmp`, and never writes to Google. Fixture state can be normal/empty/error/legacy via `/tmp/qleaps-fixture-state`. It is excluded from the publish directory.

Browser checks exercised employer/CV/feedback confirmed receipts, correct role linking and metadata, closed/empty states, article filters, 320/375 px navigation, modal focus and representative small-screen layouts. Mock receipts confirm the frontend journey, not Google persistence. Real production storage remains gated by the Google steps above.


## Visual refinement — 25 October 2026

Returners feature rebuilt in the shared navy/blue/neutral palette with an editorial image, readable supporting copy and one clear action. Primary link/button shapes and shadows aligned; homepage scope is explicit near the headline, and a closing conversation CTA explains the human value of the service. Ambient collisions use short branching lightning at contact. No matching engine or paid dependency was added. The public Google endpoint was checked read-only and now advertises both candidate_details and jd_attachments as true; a real storage round trip remains a separate release check.

## Final design and SEO pass

The updated Google deployment has already been reported complete and its capabilities verified read-only. No further Apps Script change was made in this final design pass. Retain the real storage round-trip check.

Restored clear audience destinations and the photo-led agency story. Scout was subsequently removed at the owner’s request. Improved touch targets, mobile form typography, visible labels, category choices, text contrast, contact FAQs, share metadata and breadcrumbs. Removed AI marketing and Scout imagery. The final responsive sweep passed 48 combinations: eight main routes at 320, 390, 768, 820, 1024 and 1440 pixels, with no horizontal overflow. Production release is performed by pushing the audited commit to the linked GitHub repository.

## Final pre-push audit

- Latest GitHub main matched the local base before committing. Commit author/committer: LalitKulshrestha, using the configured GitHub noreply address.
- Build, JavaScript/Apps Script syntax, backend regression suite, 16-page static contracts and whitespace checks pass.
- Final browser sweep: eight main routes at 320, 390, 768, 820, 1024 and 1440px; all 48 checks pass without horizontal page overflow. One H1 per route, no dog images, music switch on the homepage only.
- Mobile sample dossier opens and Escape restores focus to its trigger. Prior local fixture tests cover hiring brief, private upload receipts and linked CV journeys; final read-only production webhook check returns success/version 2 with candidate_details and jd_attachments true. No real applicant or employer submission was created for this release audit.
- Audio is opt-in and homepage-only. Blogs, article schema, canonicals, social metadata and sitemap remain in the static build.
- The Netlify badge requires the owner’s dashboard setting; this release does not change that account setting.
- The existing Google deployment is already updated; do not redeploy it just for the frontend design release. Continue the normal private-storage and job-approval operating checks.
