# Queensland Water Rules

## Pitch

A free practice app for the knowledge side of the Queensland recreational
marine driver licence (RMDL) and personal watercraft licence (PWCL):
visual scenario questions in the style of the queensland-road-rules app,
built from the official BoatSafe workbook, competency standards and
factsheets, corrected against the in-force legislation. The goal is that
someone who can consistently clear the mock test walks into a BoatSafe
course knowing the theory cold, and comes out a safer skipper for small
to medium boats.

## Problem

The BoatSafe knowledge test (the Common Assessment Tool) is closed book,
in person, and effectively requires 100 percent: every wrong answer is
retrained and retested on the day. The official study material is a long
PDF workbook; there is no official practice environment, and the workbook
itself now lags the law (lifejacket wear rules changed December 2024, the
old PFD types stopped being legal September 2025). Third-party practice
quizzes are behind paywalls, small, or unsourced.

## Approach

Clone the proven queensland-road-rules architecture: a zero-dependency
Vite/TypeScript app, a declarative scene model rendered to SVG, a
practice queue with spaced repetition, tags, awards and progress, all
static and hosted on GitHub Pages. Replace the road domain with a water
domain: open water encounters, marked channels, night lights views and
equipment pictogram cards. Every question cites the actual rule (TOMSR
section, COLREGS rule, or MSQ guidance) and current law overrides the
workbook wherever they differ (docs/rule-corrections.md).

## Scope

- Question bank covering all CAT theory domains: licensing, registration,
  safe operation, safety equipment, water limits, give way, buoyage,
  lights and sounds, anchoring, weather and tides, planning and
  emergencies, PWC and towing.
- Animated give-way scenes (the give-way vessel visibly passes astern).
- Mock test mode shaped like the real assessment: 50 questions drawn
  across areas, no feedback until the end, review of misses.
- Practice mode with mastery tracking, tag browsing, mistakes replay,
  awards; per-question share links and flag-an-issue links.
- Installable PWA, offline capable, phone-first.

## Non-goals

- The practical (on-water) assessment: out of scope beyond a doc note.
- Interstate licensing, commercial licensing, international rules beyond
  what the QLD test needs.
- Accounts, sync, servers: progress is on-device only.
- Duplicating or distributing the copyrighted source PDFs.

## Done means

- `npm test` green, including bank validation (every question renders,
  cites a source, covers every topic at least twice, 220+ questions).
- `npm run build` produces a working static bundle.
- Deployed on GitHub Pages from xariov/queensland-water-rules with the
  same workflow as queensland-road-rules.
- A person can: open the site on a phone, practice with animated
  scenarios, run a 50-question mock test, and review their misses with
  rule citations.
