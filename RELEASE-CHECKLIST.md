# Quantum Leaps — HR ecosystem release checklist

This is a **local rebuild pending review**, not a deployed release. It expands the homepage to five service lines and retains recruitment at `/recruitment/`. No new server, checkout or paid runtime has been introduced.

## Decisions before publishing

- Review the five service pages and confirm the scope can be delivered, including specialist assessments and POSH support. Confirm qualified delivery partners and engagement-specific legal review where necessary.
- Confirm the ₹3,999 one-time Career Prep offer and what taxes, if any, need stating before collecting payment. Add-on mock interview pricing remains unconfirmed; no payment flow is offered.
- Confirm the enquiry inbox/Sheet owner, job approval owner, candidate follow-up process and actual availability. The site makes no invented response-time promise.
- Approve or replace the existing handshake footage used in the full-screen homepage hero. No new video was commissioned for this iteration.
- Keep employee data in client-managed infrastructure. The initial HR enquiry must remain non-confidential and attachment-free; recruitment retains its separate, consent-based CV/JD workflow.
- No AI capabilities, testimonials, client logos or placement statistics should be added until supported by actual operations and approved facts.

## Local verification

```sh
npm ci
npm run format:check
npm run build
npm test
git diff --check
npm run preview
```

Open http://127.0.0.1:4321/. Check homepage service switching and reduced-motion behaviour; phone/tablet navigation; all five service pages; knowledge/blog search; recruitment shortlist and collision lightning; fictional sample modal and Escape/focus restoration; enquiry category preselection; CV/JD workflows.

Use `python3 tests/preview-server.py` on port 8081 for disposable local form submissions. It never writes to Google. Mock receipts validate frontend behaviour, not production storage or permissions.

## Verified locally — 27 October 2026

- Static build, formatter check, Google backend regression suite and built-site contracts pass.
- All 23 generated pages pass local resource/anchor, canonical, JSON-LD, form-contract and sitemap checks. Internal source and backend files remain outside the publish directory.
- Browser checks found no horizontal page overflow on the reviewed content pages at 390 px. Representative homepage, recruitment, enquiry, service and article-index layouts also fit at 320 px and 820 px; desktop reviewed at 1280 px.
- Service switching, enquiry-category preselection, blog search, recruitment mobile navigation, fictional dossier dismissal and focus restoration work in the browser.
- Synthetic local enquiry and job-linked CV submissions received confirmed mock receipts. The captured CV retained its Job ID, attachment, experience, notice period, LinkedIn and current title. No Google records were created.
- Earlier page-style leakage into recruitment was fixed by isolating page styles. Existing recruitment collision lightning is retained without a cooldown.

## Google and confidentiality

This frontend rebuild requires **no Apps Script source/schema change**. New enquiries use the existing Contact Inquiry handler and include the service category in the message. Keep the workbook and upload folders Restricted, with named collaborators only. The publicly callable web-app endpoint does not require public Sheet/folder sharing.

Before a production release, verify the existing endpoint still advertises `version: 2`, `candidate_details: true` and `jd_attachments: true`. With authorised disposable data, verify a JD saves privately, Pending jobs stay hidden, Approved jobs publish, a CV links to its Job ID and all candidate fields reach their columns. Check enquiries and editorial feedback in Submissions. Keep Submissions, Jobs and Applications; none is an unnecessary template tab.

If the Google deployment needs repair, use [the existing setup instructions](google-apps-script/SETUP.md), preserving the deployment URL and append-only column layout. Do not recreate the workbook or delete existing records. Maintain a real retention/deletion process; the website does not automate historical data deletion.

## Future deployment

1. Obtain approval for this local version. No deployment is authorised by the rebuild request.
2. Confirm repository Git author and committer are LalitKulshrestha before a later authorised commit/push; Netlify deploys from that repository.
3. Netlify: Node 22, build `node scripts/build.cjs`, publish `dist`; remove any dashboard publish-directory override pointing at `.`. No Netlify function is needed.
4. Check the live homepage, `/recruitment/`, canonical redirects, a genuinely missing URL returning 404, security headers, forms and social previews.
5. Submit the updated `https://qleaps.in/sitemap.xml` in Search Console. Metadata and structured data help discovery; rankings and enquiries are not guaranteed.
6. If desired, switch off the Powered by Netlify badge in Project configuration → General. This dashboard setting does not require a rebuild.

## Architecture safeguards

Astro emits plain HTML/CSS/JS. Browser modules load by page capability; no frontend framework runtime is shipped. Content comes from one service catalogue; shared layout and isolated page styles prevent earlier migration conflicts. Fingerprinted bundles get immutable caching. The build excludes backend source, tests, notes, old exports and the heavyweight original video.
