# Quantum Leaps

One static, employer-focused landing page for https://qleaps.in. Plain HTML, CSS and JavaScript. No build step, runtime framework, animation dependency or new paid service.

## Files
- `index.html`: employer story, interactive shortlist demonstration, hiring enquiry and collapsible candidate CV form.
- `styles.css`: local fonts, responsive layouts, CSS illustrations and reduced-motion handling.
- `script.js`: progressive reveals, shortlist controls and existing Google Apps Script submissions.
- `privacy.html`: disclosure of the current form integration.
- `netlify.toml`: static publishing and security headers.

## Preview
Run `python3 -m http.server 8000 --bind 127.0.0.1` and visit http://127.0.0.1:8000.

## Deployment
The configured origin is `https://github.com/LalitKulshrestha/QLeaps.git`. Netlify should publish the repository root from its configured production branch (`main`). No build command is required. A Git push triggers deployment only if the Netlify Git integration is enabled.

## Existing Google integration
The public Apps Script web-app URL is in `script.js` and both HTML form actions. This is an existing Apps Script handler, not a newly created Google Form.

Employer requests retain `form_type`, `name`, `email`, `message`; company and role are included in the message so the existing handler can store them. Candidate requests retain phone, city, role, link, message, file_data (base64), file_name and file_type. Both include consent.

No Netlify Forms backup is submitted or enabled, avoiding additional form-service usage. The legacy `main.js` and `netlify/functions/lead.js` are not used by this page.

Apps Script is called using `no-cors`. An opaque response cannot prove storage or delivery. The page says the request was sent for processing, preserves entered details, and provides an email fallback. Network errors, timeouts and unreadable/invalid CVs are reported without displaying a false receipt confirmation. A controlled production submission and confirmation in the Google destination are still needed to verify end-to-end delivery.

CVs must be non-empty PDF/Word files up to 5 MB. Extensions and size are checked in the browser; the Google handler must also validate files and handle retention and abuse prevention. Free Netlify and Google service quotas still apply.

## Content
The shortlist is explicitly illustrative. No invented client logos, placement metrics, testimonials or team biographies are published. Add verified proof when available. Candidate applications remain on the same page; static unverified job listings and unsourced market statistics have been removed.
