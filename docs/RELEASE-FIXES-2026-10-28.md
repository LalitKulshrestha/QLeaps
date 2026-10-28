# Release fixes — 28 October 2026

The application issues identified in PREDEPLOY-AUDIT-2026-10-28.md are resolved. This follow-up supersedes that report's recommendation to hold for diagnostic changes.

## Completed

- Removed absolute protection/compliance promises, the artificial internal-HR ceiling, and the unreachable vendor-only score band.
- Readiness now spans 0–100 using an explicit site-defined rubric: ownership up to 40, reported POSH status up to 30, joining outcomes up to 30. Team size remains contextual. Unknown and unanswered inputs earn zero.
- Kept three bands: red 0–39, amber 40–74, green 75–100. A full score is explicitly not proof of compliance or absence of risk. Independent gaps remain in the roadmap.
- Kept all four questions together and the diagnostic on Services only.
- Added a sticky compact score for phone/tablet layouts, synchronized with the main meter and answer count. It stops at the section boundary and respects the fixed navigation height.
- Moved the independent-support explanation after the results and shortened it to realistic service benefits.
- Standardized the introduction as a four-question self-check.
- Added percentage updates to the live status text for assistive technology, preserved keyboard sliders, readable non-colour state labels and reduced-motion behavior.
- Removed unused governance-pillar styles and added safe handling of unrecognized scoring keys.

## Verification

- Fresh production build: 29 pages, PASS.
- Webhook regressions, diagnostic tests and static site contracts: PASS.
- Permanent tests now cover all 320 combinations, bands, partial answers, empty state, full score, non-scoring team size and invalid/prototype keys.
- Prettier and git diff whitespace checks: PASS.
- Browser checks at 320, 390, 768, 1024 and 1440 px: four questions rendered, no page overflow, reachable 100% endpoint.
- Mobile compact score remains at y=78 px with the navigation ending at y=70 px while interacting with the fourth question.
- Keyboard POSH slider changed its dropdown to “Not sure / applicability unclear”, reduced the score from 100 to 70, and changed the band to amber.
- Reset cleared all four selections, both score displays, roadmap and enquiry parameters.
- Existing SEO, form and asset contracts passed after the changes. Backend source and Google deployment were not changed.

Screenshots: release-fixes-20261028/desktop.png and mobile.png in the task's visualization directory.

## Go-live scope

Frontend release fixes are complete and locally verified. No commit, push or deployment was performed. Existing production Google/Drive behavior is not certified by these frontend checks; confirm a clearly labelled CV/JD upload and receipt after release, together with deployed Netlify headers/redirects. Physical Safari/iOS and real-user Core Web Vitals remain outside this local Chromium viewport test.
