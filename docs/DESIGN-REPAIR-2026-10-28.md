# Blue-and-white restoration — 28 October 2026

## Findings and fixes

1. The recolour mixed token replacements with content changes. The service explorer had been replaced with dense institutional copy, practice codes and unsupported shortlist/offer metrics. Restored the earlier five-service explorer, practical headings, approved service scope and ₹999 lifetime limited-period offer.
2. Two added homepage prototypes claimed case-study results and a compliance score without supporting evidence. Set them aside under `docs/archived-components`, outside published output. Removed their imports and the diagnostic enquiry-prefill path. Originals also backed up at `/tmp/qleaps-before-repair-20261028/src` before repair.
3. Privacy-page CSS reset all elements and styled `body`, links, headings and footer globally. Restricted page styles to `main`, restored its centred 800 px reading column, and kept shared navigation/footer styles independent. Applied the same containment rule to all nine page stylesheets.
4. Green surface, text, border, animation and video-overlay colours remained inside scoped components after the initial token changes. Replaced them with blue, pale blue, navy, white and slate. Shared colour tokens now use blue names instead of green aliases. Status colours and the existing coral recruitment accent remain intentional.
5. Added minimum-width/long-heading guards, responsive menu height limits and consistent service-grid sizing. Restored the approved fullscreen hero, five-service navigation and two distinct videos. Recruitment lightning and optional music remain.

## Verification

- Browser inspected all 23 generated pages at 1280 px and 390 px; checked every route at 320 px and 820 px as well. No horizontal document overflow. Shared header heights remain 80 px on desktop and 70 px on mobile/tablet.
- No missing images found in the desktop route pass. One H1 per page.
- Checked mobile menu open/Escape, all five service panels, shortlist Volume/Fit, fictional dossier opening/dismissal, recruitment music control visibility, contact service preselection and article search.
- Existing backend regression tests and static publication contracts pass. Canonicals, structured data, resources, anchors, form contracts and sitemap remain valid.
- Added regression checks against broad page-style selectors, green theme aliases and the unverified prototype blocks appearing in public pages.
- No production records submitted. Google backend unchanged. No commit, push or deployment performed.

## Scope retained

Recruitment uploads, JD workflow, enquiry and editorial forms, six blog articles, five service pages, privacy page, pricing, reduced-motion behaviour and current local media remain. This was a repair, not a platform replacement.
