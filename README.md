# Quantum Leaps

Static specialist recruitment website for brands and agencies across India, from individual contributors to leadership search. Vanilla HTML, CSS and JS, local fonts/media, an image-led agency story and interactive hiring scenarios. No paid runtime or animation dependency.

## Preview

Run `python3 -m http.server 8080 --bind 127.0.0.1` from this folder and open http://127.0.0.1:8080/. The source preview reads the public Google job feed. Avoid test submissions there; use `python3 tests/preview-server.py` on port 8081 for isolated synthetic form tests.

## Build and checks

```sh
node --check script.js
node --check < google-apps-script/Code.gs
node tests/google-webhook.cjs
node scripts/build.cjs
python3 tests/site-contracts.py
git diff --check
```

Netlify reads `netlify.toml`: Node 22, build `node scripts/build.cjs`, publish `dist`. The allowlist includes only public pages, assets, CSS, JS, sitemap and robots file. Unknown paths use the published `404.html`; there is no SPA fallback. Generated `dist` is ignored by Git.

## Forms and data

Google Apps Script handles enquiries, editorial feedback, private CV/JD uploads, job approval and non-personal receipt lookups. The workbook does not need public sharing. Jobs publish only when Approved and not expired. Each application retains its stable job reference; general applications have a blank Job ID.

The current handler advertises `candidate_details: true`; CV submissions are blocked against an older handler to prevent silent data loss. The existing deployment has been updated and its capabilities checked read-only. [Release checklist](RELEASE-CHECKLIST.md) and [Google setup instructions](google-apps-script/SETUP.md) describe the safe append-only migration.

The sample dossier uses fictional data. AI matching is not marketed on the launch site; matching and introductions are handled by people. Guides are practical editorial material, not proprietary research or salary surveys. Actual vacancies, metrics and testimonials require verified business records.

The legacy export, main.js and Netlify function source remain in the repository for reference but are not published or used by the current site. Existing Netlify/Google quotas apply.

## Current release behaviour

Scout is removed. The homepage keeps the circle collision lightning, interactive shortlist and hiring scenarios, and a subtle animated closing invitation. Optional synthesized piano/shore/bird ambience is homepage-only, off by default, with a note-icon switch at the bottom-left. No track downloads or external audio service are used.

The Powered by Netlify badge is a hosting-dashboard setting, not a source-code component: Project configuration → General → Powered by Netlify badge → Off → Save. It does not require a rebuild.
