# Research — DataForge (working name): SQL + Python for Data Engineering

Learner profile: front-end developer, zero SQL/Python, visits daily, self-paced.
Date: 2026-11-06

---

## 1. WHAT to teach (curriculum)

### Consensus from 2026 data-engineering roadmaps
- **SQL first, then Python.** Weak SQL slows beginners more than weak Python in early DE roles. Postgres-flavoured SQL is the recommended practice dialect.
- Order: SQL + Python → Git/terminal → data modeling + warehousing → ETL/ELT + dbt → orchestration (Airflow) → Spark/streaming only if a target role needs it.
- **Defer** Kafka, Kubernetes, Terraform, Spark for a beginner path.
- dbt is described as "non-negotiable" in 2026 (SQL transforms + version control + tests + docs).
- Realistic timeline: 6–9 months at 10–15 h/week to job-ready. **This platform covers the first ~12 weeks: SQL + Python foundations + DE concepts + a capstone pipeline.**
- Two real pipelines beat "knowing" ten tools on paper → the course ends in a capstone pipeline.

### Python topics that recur in DE interviews/work
Generators (streaming large files), decorators, dataclasses, context managers, error handling + retries + logging, `requests` + pagination, pandas (most common), Polars (bonus signal), SQLAlchemy / DB-API, pytest, Pydantic validation, Airflow DAGs are plain Python.

### Resulting curriculum (3 tracks, 26 modules)
**SQL track (S0–S10)**
| # | Module | Key concepts |
|---|---|---|
| S0 | Databases & the DE big picture | tables/rows/columns, OLTP vs OLAP, where SQL sits in a pipeline |
| S1 | Reading data | SELECT, WHERE, ORDER BY, LIMIT, DISTINCT, aliases |
| S2 | Expressions | CASE, string/date functions, NULL semantics, COALESCE, CAST |
| S3 | Aggregation | GROUP BY, HAVING, COUNT/SUM/AVG/MIN/MAX, COUNT(DISTINCT) |
| S4 | Joins | INNER/LEFT/FULL/CROSS/self, anti-join, join fan-out pitfalls |
| S5 | Subqueries & CTEs | scalar/IN/EXISTS subqueries, WITH, recursive CTE (intro) |
| S6 | Window functions | ROW_NUMBER/RANK/DENSE_RANK, LAG/LEAD, running totals, frames, dedup pattern |
| S7 | Writing data | DDL, constraints, INSERT/UPDATE/DELETE, upsert/MERGE, transactions |
| S8 | Data modeling | normalization, grain, star schema, facts/dims, SCD Type 2 |
| S9 | Performance | indexes, EXPLAIN, columnar storage, partitioning |
| S10 | DE SQL patterns | gaps & islands, sessionization, pivot, funnels, cohorts, incremental loads |

**Python track (P0–P8)**
| # | Module | Key concepts |
|---|---|---|
| P0 | Python for JS devs | syntax map (JS ↔ Py), types, list/dict/set/tuple, truthiness |
| P1 | Control flow & functions | loops, comprehensions, args/kwargs, scope |
| P2 | Files & environment | pathlib, CSV/JSON, venv/uv, pip, modules |
| P3 | Robust code | exceptions, logging, type hints, dataclasses |
| P4 | Pythonic power tools | iterators, generators, context managers, decorators |
| P5 | Talking to APIs | requests, pagination, retries/backoff, rate limits |
| P6 | DataFrames | pandas core ops, then Polars & DuckDB-from-Python |
| P7 | Python + databases | DB-API, parameterized queries, SQLAlchemy Core, bulk loads |
| P8 | Quality | pytest, Pydantic validation, data contracts |

**DE bridge track (D1–D6)**
| # | Module |
|---|---|
| D1 | ETL vs ELT, batch vs streaming, idempotency, backfills |
| D2 | File formats: CSV, JSON, Parquet; partitioned layouts |
| D3 | Data quality: tests, contracts, freshness |
| D4 | dbt concepts: models, refs, tests, materializations |
| D5 | Orchestration: DAGs, scheduling, retries (Airflow concepts) |
| D6 | **Capstone**: API → raw → staged → mart pipeline, run in-browser (Pyodide + DuckDB) |

### External practice (linked per module, difficulty-tagged)
- **SQLBolt**: a gentle interactive intro (S1–S4).
- **pgexercises.com**: Postgres-native exercises grouped by topic (S1–S7).
- **LeetCode SQL 50**: 50 problems (32 easy, 17 medium, 1 hard). Needs an account (S3–S6, S10).
- **DataLemur**: real interview questions on real Postgres. The free tier is limited (S4–S6, S10).
- **StrataScratch**: SQL and Python interview questions with a free tier (S6, S10, P6).
- **SQLZoo**: older site with a steeper ramp (supplementary).
- **Exercism Python track**: free, with mentors, for P0–P4.
- These still need checking with a link checker during the build. No unchecked URL ships.

---

## 2. HOW to teach (evidence)

| Technique | Evidence | How the platform uses it |
|---|---|---|
| **Retrieval practice** (practice testing) | Dunlosky et al. 2013: "high utility" | Every lesson starts with a 2-minute recall warm-up and ends with a quiz. No rereading as a study method |
| **Spaced practice** | Dunlosky: "high utility". Cepeda meta-analysis: strongest at long retention intervals | Quiz items and concept cards become FSRS cards (`ts-fsrs`, MIT, FSRS v6). FSRS needs fewer reviews than SM-2 for the same retention |
| **Successive relearning** (retrieval × spacing) | The combined effect is stronger than either alone | Mastery means recalling correctly on 3 or more spaced occasions, not just reaching the end of the page |
| **Interleaving** | Moderate utility; helps learners tell *which* tool fits a problem | Daily review mixes topics ("is this a JOIN or a window problem?") |
| **Worked → faded examples** | Cognitive-load research (Morrison et al. 2007; Sweller) | Each concept goes full worked example → partly blanked → independent |
| **Parsons / faded Parsons problems** | Lower cognitive load and more active than reading worked examples (ICER 2022); learners see them as a "desirable difficulty" | Drag-to-order SQL clauses / Python lines |
| **PRIMM** (Predict-Run-Investigate-Modify-Make) | Widely used in CS teaching; its link to fading is conceptual, not tested | "Predict the output" before every Run button press |
| **Elaboration / analogies to prior knowledge** | Dunlosky: moderate | Every concept bridged to JS: `filter`≈WHERE, `map`≈SELECT, `reduce`≈GROUP BY, generators≈JS generators |
| Low utility: highlighting, rereading, summarising | Dunlosky: low | Not used as learning activities |

Caveats: cognitive-load theory has been criticised as hard to falsify, and the Parsons and fading studies are small. Retrieval and spacing have the strongest evidence, so the design relies on them most.

---

## 3. UI — Awwwards reference analysis

Tools: awwwards MCP `search_sites`, `get_site_details`, `create_design_brief`, plus live headless captures (Playwright, captured 2026-11-06): `get_motion_dna`, `analyze_hover_census`, `analyze_scroll_map`, `analyze_page_structure`, `export_design_tokens`. Section 3.1 has the measurements and section 3.2 has the design decisions taken from them.

References (all SOTD + Developer Award unless noted):
- **Grids** (grids-1, Obys, score 7.63): *educational* interactive experiments; typography-led, black/white, GSAP + Locomotive, grid hover and loading entrance. → Lesson pages as interactive experiments on a strict grid.
- **DeepBook**: data visualization, clean, `#1E6EF3` signal blue on near-black, scroll and hover interactions, animated illustrations. → Data-as-light motif.
- **Cerebrium**: app-style tech product with microinteractions and a WebGL hero, `#172B76` / `#902177`. Awwwards lists GSAP and Lottie, but the live capture found Lenis + Swiper + Three.js and no GSAP. → App-style shell polish and microinteractions.
- **AI in Design Report 2026**: data-viz storytelling with an editorial layout. → Progress and log pages as an editorial "report on yourself".
- Krackerz Learning (Honorable Mention, 2026): a learning-platform reference.

Shared signals from the brief: data visualization (3 of 4), web & interactive (3 of 4), GSAP (2 of 4), clean (2 of 4), storytelling (2 of 4), hover microinteractions.

**Direction: "Data observatory".** A near-black ink canvas with data drawn as light and editorial type. The curriculum *is* a pipeline DAG that lights up as you learn. The big visual effects stay on the map, home page and celebrations; lessons stay calm, high-contrast and readable.

### 3.1 Live capture results (measured)

All captures used a 1440×900 desktop viewport. The token extractor stops after 800 DOM nodes, so every token list below is **partial**.

**Motion stack and scroll** (`get_motion_dna`, `analyze_scroll_map`)
| Site | Libraries / render | Scroll model | ScrollTriggers | Easing vocab (uses) | Durations |
|---|---|---|---|---|---|
| DeepBook | GSAP + ScrollTrigger + Lenis, WebGL | Lenis | **16, all scrubbed, 0 pinned**. Most run `top bottom → top 30%`; a 4-step story runs 0→20→40→60→80% | `power3.out` (27), `expo` (6), `power2.in` (2), `power2.out` (2) | p25 250 ms, median 500 ms, p75 500 ms |
| Cerebrium | Lenis + Swiper, Three.js/WebGL (**no GSAP** found, despite the Awwwards tag) | Lenis | 0; 5 CSS keyframe animations | — | 1000 ms |
| Krackerz | Lenis, WebGL | Lenis | 0; 27 CSS keyframe animations, all `linear` (marquee/loop style) | `cubic-bezier(0,0,1,1)` (26) | — |
| AI in Design Report | Framer, no animation library found | native | 0, and 0 animations after settling | — | — |
| Grids (Obys) | **Not capturable.** The server returns `403 Forbidden` to headless browsers, so its listed stack (GSAP + Locomotive) is still unverified | — | — | — | — |

**Hover microinteractions** (`analyze_hover_census`)
- AI Report: 50 `:hover` rules. In every sampled case **only `color` changes**, over **200 ms** with `cubic-bezier(0.44, 0, 0.56, 1)` (a symmetric ease-in-out).
- Cerebrium has 63 hover rules and DeepBook has 5, but the sampler couldn't trigger any of them (the elements are probably JS-driven or hidden behind overlays). The rule counts are reliable; the hover properties are unknown.

**Page structure** (`analyze_page_structure`)
- The AI Report is one long editorial page (11,209 px). A white intro is followed by **full-bleed colour bands used as section breaks** (`#F0FF1C` acid yellow, then `#FE7141` orange), then white data sections, and finally a black 1,657 px closing band with a CTA and downloads.

**Design tokens** (`export_design_tokens`, most frequent first)
| Site | Colours | Type | Radii |
|---|---|---|---|
| DeepBook | `#FFFFFF`, `#EFEFEB` (warm off-white), `#6A7681` (muted), **`#1E6EF3`** (signal), `#1B1B1B`/`#000` (ink), white at 10–30% alpha for lines | TWK Everett 400/500. Display 81/48/40 px with −2% to −3% tracking; body 16 px; Inter 9 px for labels | 2–8 px (mostly 4) |
| Cerebrium | `#172B76` navy, `#101421` ink, `#FF488B`/`#F6186A` pink accent, `#EEF2F5` | Suisse Int'l 300–500 (body 16), **Suisse Int'l Mono 13 px** for labels, ABC Favorit for display at 72–144 px | **7 px** used everywhere (177 uses) |
| AI Report | `#000`, `#FFF`, `#CDABFE` lavender, `#FE7141` orange, `#F0FF1C` acid, `#99EEFF` cyan | Beausite Classic 500. Display up to 120 px with tracking around −0.06em (−7.2 px at 120 px); body 16–20; **Geist Mono 13 px** | none (square) |
| Krackerz | `#000`, `#161616`, `#F7F6F0` warm paper, **`#C8FF2E` lime** accent, rust reds `#A52207`–`#F8330B` | Highway Motel Sans for display at 40–80 px; **Geist 14–20** for body/UI | 8 / 12 / 16 / 24 px; pills at 62 px |

Measurement artefacts we ignored: `#0000EE` (the browser's default link colour on hidden Framer anchors) and the large count of 12 px `sans-serif` nodes (Framer's hidden internals).

**Patterns shared across the references**
1. **Display grotesk + monospace labels**: 3 of 4 measured sites use a mono face for small labels (Suisse Mono, Geist Mono).
2. **Body text is always 16 px**. Display sizes jump straight to 40–144 px with negative tracking, with no middle steps.
3. **Dark or near-black ink with a single saturated accent** (DeepBook blue, Krackerz lime, Cerebrium pink).
4. **Small radii**: 4–8 px on controls. Only Krackerz goes larger, on cards.
5. **Scroll motion is scrubbed, not pinned**: DeepBook has 16 scrub triggers and 0 pins, and no other site uses ScrollTrigger at all.
6. **Lenis smooth scroll appears in 3 of 4 capturable sites.** For us it would conflict with CodeMirror and result-grid scroll containers, so we're leaving it out (see 3.2).
7. Hover feedback is **short and simple**: 200 ms colour shifts, not transforms.

### 3.2 UI spec derived from the evidence (decisions)

**Colour tokens (dark theme by default; contrast measured against `--ink`)**
| Token | Value | Source / reason |
|---|---|---|
| `--ink` | `#0B0D10` | Near-black, like DeepBook `#1B1B1B` and Cerebrium `#101421` |
| `--surface` | `#15181D` | Cards, editor background |
| `--line` | `rgba(255,255,255,.10)` | DeepBook's 10% white rules |
| `--text` | `#EFEFEB` | DeepBook's warm off-white (≈17:1) |
| `--muted` | `#8A96A1` | DeepBook's `#6A7681` only reaches ≈4.2:1 on ink, which fails AA. Lightened to ≈6.4:1 |
| `--sql` | fill `#1E6EF3`, text `#5B95F7` | DeepBook's signal blue. `#1E6EF3` is only ≈4.2:1 as text, so text uses `#5B95F7` (≈6.6:1) |
| `--py` | `#CDABFE` | AI Report lavender |
| `--de` | `#FE7141` | AI Report orange |
| `--mastery` | `#C8FF2E` | Krackerz lime. Used only for "mastered", streak and celebration states |
| `--error` | `#FF5C5C` | Distinct from `--de`. Always paired with an icon and text, never colour alone |

A light theme (for lessons in daylight) inverts to `#F7F6F0` paper (Krackerz) with `#161616` text. Track colours are darkened until they pass AA on paper.

**Type**
- **Geist** (UI/body) + **Geist Mono** (code, labels, numbers). Both are free (OFL), and Geist Mono is already in the measured set (AI Report, Krackerz).
- Scale: 13 (mono labels) · 16 (body; lesson prose at 18 with 1.6 leading) · 22 · 40 · 64 · 96 (home/map display only). Tracking is −0.02em at 40 px and −0.04em at 64 px and up.

**Shape**: `--radius-sm 4px` (chips, inputs), `--radius 7px` (buttons, editor, cards, as in Cerebrium), `--radius-lg 16px` (modals, celebration panels).

**Motion tokens**
| Token | Value | Source |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.165, 0.84, 0.44, 1)` (`power3.out`) | DeepBook's top easing (27 uses) |
| `--ease-inout` | `cubic-bezier(0.44, 0, 0.56, 1)` | AI Report hover easing |
| `--dur-hover` | 200 ms | AI Report hovers |
| `--dur-ui` | 250 ms | DeepBook p25 |
| `--dur-enter` | 500 ms | DeepBook median |
| `--dur-story` | 1000 ms | Cerebrium; used only for celebrations and the map's light-up |

**Motion rules**
- **Lessons**: nothing moves unless the learner triggers it. Run results fade and slide in over 250 ms. Hovers change colour or border only.
- **Home and Pipeline Map**: GSAP ScrollTrigger, **scrubbed reveals only, no pinning**. Start at `top bottom` and end at `top 30%`, matching DeepBook. The map's DAG edges draw in as the learner scrolls.
- **No Lenis**: native scroll keeps the editor, result grids and accessibility tools working.
- **`prefers-reduced-motion`**: scrubbing turns off, `--dur-*` values become 0 (except a 150 ms cross-fade), and WebGL/particles show a static frame.

**Layout patterns borrowed**
- **Weekly "report on yourself"** follows the AI Report structure: an editorial long page, a full-bleed track-colour band as each section break (SQL, Python, DE), big-number stats in display type with mono captions, and a dark closing band with export and download.
- **Mono uppercase labels** (13 px, +0.04em) for metadata: module codes (`S6`), timers, row counts, FSRS due counts.
- **One accent per screen**: a lesson page uses only its own track colour, and `--mastery` lime appears only when something is earned.

**Still unverified**: Grids (blocked to headless browsers) and the actual hover properties on Cerebrium and DeepBook. Checking those needs a manual look in a real browser. They aren't blockers, because the spec above doesn't depend on them.

## Sources
- https://www.educative.io/blog/data-engineer-roadmap
- https://dev.to/gowthampotureddi/data-engineering-roadmap-for-freshers-2026-a-13-step-beginners-guide-from-sql-to-your-first-4b51
- https://dataengineeracademy.com/blog/fastest-path-to-become-a-data-engineer-a-focused-6-month-roadmap-that-gets-you-job-ready/
- https://datavidhya.com/blog/data-engineering-roadmap-2026/
- https://datadriven.io/python-interview-questions
- https://datavidhya.com/blog/python-data-engineering-interview-questions/
- https://firth.substack.com/p/jonathan-firth-s-memory-metacognition-updates-15-dunlosky-et-al-s-list-of-strategies-1347143
- https://www.retrievalpractice.org/archive/2018/successive-relearning
- https://guides.atsu.edu/library-med/studytips
- https://web.eecs.umich.edu/~xwanghci/papers/ICER22.pdf
- https://unpaywall.org/10.1145%2F1288580.1288594 (Morrison et al. 2007, faded worked examples)
- https://arxiv.org/pdf/2512.22407 (Faded Parsons)
- https://swcarpentry.github.io/swc-releases/2016.06/instructor-training/11-load
- https://www.boot.dev/blog/backend/best-sql-practice-sites
- https://www.interviewquery.com/p/platforms-to-practice-sql
- https://docs.ankiweb.net/faqs/what-spaced-repetition-algorithm
- https://open-spaced-repetition.github.io/ts-fsrs
- https://duckdb.org/2024/10/02/pyodide
- https://motherduck.com/blog/duckdb-wasm-in-browser/
- https://dlthub.com/docs/tutorial/playground
- Awwwards: grids-1, deepbook, cerebrium, ai-in-design-report-2026, krackerz-learning
