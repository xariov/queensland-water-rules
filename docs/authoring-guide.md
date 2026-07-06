# Question authoring guide

How to write question batches for the generation pipeline
(`scripts/integrate-generated.ts`). Every question is validated and its
scene trial-rendered; anything that fails is dropped, so follow this file
exactly.

## Sources of truth

1. `docs/rule-corrections.md` - current law. ALWAYS wins.
2. `docs/knowledge-base.md` - the digested BoatSafe corpus, organized by topic.
3. Exemplars in `src/quiz/bank/exemplars.ts` - the style to match.

## Batch file shape

```json
{
  "slice": "gw",
  "questions": [
    {
      "id": "gw-overtaking-any-vessel",
      "topicId": "give-way-power",
      "question": "You are overtaking a slower vessel. Who must keep clear?",
      "options": [
        "You must keep clear until you are finally past and clear.",
        "The slower vessel must speed up or move aside.",
        "Whichever vessel is smaller must keep clear.",
        "The overtaken vessel must stop."
      ],
      "explanation": "Any vessel overtaking another keeps out of the way until finally past and clear, and this overrides every other give-way rule, even sail versus power.",
      "citations": [
        { "colregs": ["13", "overtaking"] }
      ],
      "scene": { }
    }
  ]
}
```

Rules:
- The CORRECT answer is always FIRST in `options` (the app shuffles display order). Do not set `correctIndex`.
- 3 or 4 options. Every option ends with `.`, `?` or `!`. Options must not start with a bare vessel label like "Vessel A - ...".
- Distractors must be plausible: common misconceptions, the number from a neighbouring rule (30 m vs 60 m, 6 kn vs 10 kn), the old pre-2024 rule.
- `id`: `<slice>-<kebab-slug>`, unique across the whole bank. Check the exemplar ids in `src/quiz/bank/exemplars.ts` to avoid collisions.
- `question`: one clear scenario or fact question, second person where natural.
- `explanation`: 1 to 3 sentences that teach the why, not just restate the answer. Mention traps where useful.
- Citation shorthands: `{"tomsr": ["81", "title"]}`, `{"colregs": ["15", "title"]}`, `{"msq": "lifejackets|speedLimits|pwc|safetyEquipment|buoyage|waterLimits"}`, or a full `{"reference": "...", "url": "https://..."}`.
- House style: never use em dashes or en dashes anywhere; use hyphens. Australian English. Exact numbers from the sources.

## Scenes

Every question needs a `scene` (omit its `id`; the pipeline sets it).
Four layouts exist. WHEN IN DOUBT USE A CARD - a wrong coordinate fails
the whole question.

### Card (safest; knowledge questions)

```json
{
  "title": "Lifejacket wear rules at night",
  "layout": { "kind": "card", "icon": "lifejacket", "label": "Open boat under 4.8 m at night", "badge": "4.8 m" },
  "vessels": []
}
```

Icons: lifejacket, epirb, flare, vSheet, fireExtinguisher, anchor, radio,
fuel, firstAid, torch, chart, divingFlag, skiFlag, checklist, weather,
bar, licence, registration, alcohol, pwc, killSwitch, lifebuoy, mayday,
signalMirror. `label` max 44 chars; `badge` max ~5 chars. Both optional.

NO GIVEAWAYS: nothing visible in the scene may reveal facts that appear
only in the answer. Labels and badges may restate facts the QUESTION
already gives, or name the topic neutrally ("After a capsize", "Marine
radio") - never the tested fact ("Stay with the boat", badge "CH 16" on
a which-channel question). The same applies to distance ring labels (a
ring labelled "30 m" is fine when the question says "within 30 metres"
and asks the speed; wrong when the question asks the distance), to
lightsView silhouettes on identify-the-vessel questions (use "none"),
and to icons whose art contains answer text (the mayday icon spells
MAYDAY - use the radio icon when asking which call to make).

### Open water (encounters, distance rules, anchoring)

Coordinates: x east, y south, origin at frame center. Headings compass
degrees, 0 = north, 90 = east, range [0, 360). Keep all positions within
plus or minus (width/2, height/2). Width and height 30 to 400 (typical 110
to 170). Vessels are ~6 m long; keep encounters 40 to 80 m apart.

```json
{
  "title": "Crossing: B approaches from A's starboard side",
  "layout": { "kind": "openWater", "width": 130, "height": 110 },
  "vessels": [
    { "id": "A", "x": -32, "y": 8, "heading": 90, "movement": { "kind": "asternOf", "vessel": "B" } },
    { "id": "B", "x": 18, "y": 38, "heading": 0, "movement": { "kind": "straight", "distance": 55 } }
  ]
}
```

- Vessel ids: single capital letters.
- `vesselKind`: powerboat (default) | sailboat | pwc | ship | fishingVessel | paddlecraft.
- Sailboat: add `"sails": "up"` (sailing) or `"down"` (motoring). Only sailboats.
- `"trawling": true` only on fishingVessel. `"towing": "skier"|"tube"` only on powerboat or pwc.
- `"anchored": true` or `"moored": true` never combine with `movement`.
- Movements: `{"kind":"straight","distance":40}` | `{"kind":"turnTo","heading":45}` | `{"kind":"asternOf","vessel":"B"}` (the give-way maneuver).
- `"holding": true` shows the intent arrow without moving (use with `"animate": false` on the scene for static questions).
- Night scenes: `"night": true` on the scene; vessels then show correct navigation lights automatically.
- Shores: `"shores": [{"side":"south","depth":26,"kind":"beach"}]` (kind: beach|rocks|built). Jetty/boatRamp features require a shore on their side.
- Features: marks `{"kind":"mark","id":"m1","markType":"lateralPort","x":-20,"y":0}` (markTypes: lateralPort, lateralStarboard, cardinalNorth/East/South/West, isolatedDanger, safeWater, special; add `"structure":"pile"` on laterals only); `{"kind":"shallows","id":"s","x":0,"y":0,"radius":15}`; `{"kind":"swimArea","id":"sa","x":-48,"y":36,"width":42,"height":22}`; `{"kind":"jetty","id":"j","side":"south","at":40,"length":22}`; `{"kind":"boatRamp","id":"r","side":"south","at":70}`; distance rings `{"kind":"distanceRing","id":"ring","around":"A","radius":30,"label":"30 m"}` (`around` = vessel id, feature id, or `{"x":..,"y":..}`).
- Swimmers: `"swimmers": [{"x":22,"y":18}]` on the scene.

### Channel (buoyage, keep starboard, shipping)

South-to-north fairway. `upstream` says which way "returning from
seaward" points. Vessels within about plus or minus channelWidth/2 in x.

```json
{
  "title": "Travelling up a marked channel",
  "layout": {
    "kind": "channel", "length": 150, "channelWidth": 40, "upstream": "north",
    "features": [
      { "kind": "mark", "id": "p1", "markType": "lateralPort", "x": -20, "y": 48 },
      { "kind": "mark", "id": "s1", "markType": "lateralStarboard", "x": 20, "y": 48 }
    ]
  },
  "vessels": [ { "id": "A", "x": 11, "y": 30, "heading": 0, "movement": { "kind": "straight", "distance": 62 } } ]
}
```

Length 40-400, channelWidth 10-120. Put lateral marks ON the channel
edges (x = plus or minus channelWidth/2), 2 or 3 pairs down the length.

### Lights view (night identification questions)

What the skipper sees ahead. Panel is 100 wide by 60 tall, horizon at
y = 38; put lights between y 18 and 34, centered near x 50. Vessels array
MUST be empty.

```json
{
  "title": "Masthead light over both sidelights, dead ahead",
  "layout": {
    "kind": "lightsView",
    "silhouette": "powerboat",
    "lights": [
      { "color": "white", "x": 50, "y": 22, "size": "small" },
      { "color": "green", "x": 44, "y": 31 },
      { "color": "red", "x": 56, "y": 31 }
    ]
  },
  "vessels": []
}
```

Colors: red, green, white, yellow. Silhouette: powerboat | sailboat |
ship | none.

Light geometry cheat sheet (you are the viewer, the other vessel is
ahead). Mirror effect: a vessel bow-on to you shows its port (red) light
on YOUR RIGHT and its starboard (green) light on YOUR LEFT.
- Head-on power vessel: green at x 44, red at x 56, white masthead above
  center (add a second, higher white light for a large vessel).
- Crossing from your left to your right: GREEN only (you see its
  starboard side). It must give way to you.
- Crossing from your right to your left: RED only (you see its port
  side). You must give way.
- Sailing vessel: sidelights but NO masthead light.
- Stern view (you are overtaking): a single white light, low.
- Anchored under 50 m: a single all-round white light.
- Trawling: green over white above the sidelights; fishing (not
  trawling): red over white.

## Verifying your batch

Run, from the project root:

```
node scripts/integrate-generated.ts --check /path/to/your-batch.json
```

Iterate until it reports 0 dropped. Do NOT run the script without
--check; the final integration runs once, centrally.
