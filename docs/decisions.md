# Decisions

Running log of decisions made during the autonomous build. Candidates for
real ADRs if this graduates further.

## D1: Clone the road-rules architecture wholesale

The queensland-road-rules app already solved the hard problems (pure SVG
string renderer testable under Node, practice queue, progress, PWA,
Pages deploy). The domain-neutral spine was copied file-for-file; only
the scene model, renderers, taxonomy and content are new. This traded
novelty for a working, familiar app in one night.

## D2: Four scene layouts instead of road layouts

openWater (encounters, distance rules), channel (buoyage, shipping),
lightsView (a viewer-perspective night panel - the only way lights
questions make sense), and card (pictogram panels so knowledge questions
still get a visual). Card is the escape hatch that keeps "every question
has a scene" true without forcing fake on-water diagrams.

## D3: Current law beats the workbook

The BoatSafe workbook 6th edition predates the December 2024 lifejacket
wear laws, the September 2025 AS 4758 cutoff, and the June 2024 removal
of the level-flotation exemption. docs/rule-corrections.md records the
verified current rules (checked against the in-force TOMSR on
legislation.qld.gov.au) and question content follows it over the
workbook. Questions deliberately use the old rules as distractors.

## D4: Mock test mirrors the real CAT

Research showed the real assessment is ~50 multiple choice, closed book,
pass mark effectively 100 percent with same-day retraining on misses.
The mock test draws 50 questions stratified by subject area, gives no
feedback until the end, then reviews every miss with citations, and
states plainly that the real test requires every answer correct.

## D5: Generation pipeline with a hard validation gate

Question batches (agent-authored) enter through
scripts/integrate-generated.ts, which normalizes citations, validates
structure, trial-renders every scene, and drops anything that fails.
The committed bank is therefore always render-clean and cited. Same
pattern as road-rules' pipeline.

## D6: Source PDFs stay out of the repo

The BoatSafe workbook and factsheets are Queensland Government copyright.
They live in source-material/ (gitignored); the repo carries only
paraphrased facts (docs/knowledge-base.md) and questions written in our
own words, each citing official sources by reference and URL.

## D7: Lights views encode the mirror rule

A vessel seen bow-on shows its red (port) light on the viewer's RIGHT.
This is counterintuitive, was initially drawn wrong, and is now
documented in the authoring guide with per-aspect templates so every
generated lights question keeps the geometry honest.
