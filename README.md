# Queensland Water Rules

Practice for the knowledge side of the Queensland recreational marine
driver licence (RMDL) and personal watercraft licence (PWCL): visual
scenario questions with animated give-way encounters, marked channels,
night lights identification and safety equipment cards. Every question
cites the rule it tests - the Transport Operations (Marine Safety)
Regulation 2016, the COLREGS, or Maritime Safety Queensland guidance.

Sibling project of
[queensland-road-rules](https://github.com/xariov/queensland-road-rules)
and built on the same architecture: no framework, no backend, a pure
SVG renderer, and a practice queue with mastery tracking. Includes a
mock test mode shaped like the real BoatSafe assessment: 50 questions
across all subject areas, no feedback until the end, then a full review
of anything missed.

**This is an unofficial study aid, not legal advice, and not affiliated
with the Queensland Government, Maritime Safety Queensland, or any
BoatSafe training provider.** Only an accredited BoatSafe provider can
assess you for a licence. Rules change: the in-force legislation and MSQ
guidance always take precedence. Content was verified against the
in-force regulation in July 2026; `docs/rule-corrections.md` records
where current law differs from older workbook material (notably the
lifejacket wear laws that commenced 1 December 2024).

## Development

```
npm install
npm run dev      # the app
npm test         # vitest: renderer, engine and bank validation
npm run build    # type check + static bundle in dist/
```

`demo.html` renders the scene gallery for eyeballing the renderer.

## Content pipeline

Questions live in `src/quiz/bank/`: hand-authored exemplars plus
generated batches. New batches are validated and trial-rendered by
`node scripts/integrate-generated.ts <batch.json>`; anything failing
structural validation or scene rendering is dropped. See
`docs/authoring-guide.md` for the authoring contract and
`docs/knowledge-base.md` for the digested source facts.

Sources: the official BoatSafe workbook, RMDL/PWCL competency standards
and MSQ factsheets (not distributed in this repo), the in-force
Transport Operations (Marine Safety) Regulation 2016 on
legislation.qld.gov.au, and msq.qld.gov.au guidance pages.

## Deploying

Pushes to `main` run tests, build, and deploy to GitHub Pages via
`.github/workflows/deploy.yml`.
