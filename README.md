# Quantum Leaps

A static, image-led hiring landing page on Netlify. Vanilla HTML, CSS and JavaScript; local fonts, existing photography and interactive Scout artwork. No build step, new paid service or animation dependency.

## Website
- Hiring / job-seeker tabs switch the relevant content on the same page.
- Original mixed-size specialism cards, photography, Scout poses and CV catcher are retained.
- Employers submit job requirements for review; only approved roles are listed.
- Candidates search approved roles and attach their profile and CV to a stable job ID, or submit a general application.
- The existing enquiry form remains available.
- Keyboard controls and reduced-motion preferences are supported.

## Google deployment — required for job posting
Replace the current Apps Script source with `google-apps-script/Code.gs`, run its setup helper once, then update the EXISTING deployment. Follow `google-apps-script/SETUP.md`.

The website detects v2 automatically. Until the script is deployed, job posting remains disabled, while enquiries and general CV applications use the existing webhook. The legacy webhook's opaque response cannot confirm receipt; the UI explicitly distinguishes processing from confirmed storage. V2 uses random-token receipts to confirm storage and display a reference without returning personal information.

The new script creates Jobs and Applications tabs, preserves existing Submissions data, validates roles before accepting applications, prevents cross-job deduplication, and keeps newly uploaded CVs private. Historical CV permissions are not changed automatically.

Public JSONP responses expose approved job fields and non-personal submission receipts only. The Netlify CSP allows Google ContentService's script hosts. The Google Sheet itself should remain private.

## Preview and checks
Run `python3 -m http.server 8000 --bind 127.0.0.1` and visit http://127.0.0.1:8000. Without the Google v2 deployment, the preview uses the same graceful unavailable state as production.

- `node --check script.js`
- `node --check < google-apps-script/Code.gs`
- `node tests/google-webhook.cjs` (offline Apps Script mocks; never contacts Google)
- `git diff --check`

The browser workflow was also checked against a local mock job/receipt service, including role selection, Scout's CV attachment interaction and confirmed application reference. End-to-end Google storage must be verified after the script deployment with authorised test data.

## Netlify
The repository is `LalitKulshrestha/QLeaps`; production branch is `main`, publish directory is the repository root. No build command is required. The existing Netlify Git integration deploys on push.

The legacy `main.js` and `netlify/functions/lead.js` are not used by the landing page. Netlify Forms is not enabled. Existing Netlify, Google Apps Script and Drive quotas apply.
