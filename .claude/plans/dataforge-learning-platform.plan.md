# Plan: DataForge — SQL + Python for Data Engineering learning platform

**Source**: free-form request + `docs/research.md`
**Complexity**: Large
**Status**: REVISION 2. Codex review applied (see "Revision 2" at the end; where it conflicts with earlier sections, **it wins**). Awaiting user confirmation. No code written yet.

## Summary
A personal, static learning web app that works offline and teaches SQL and Python for data engineering to a front-end developer starting from zero. Every lesson runs real code in the browser (DuckDB-WASM for SQL, Pyodide for Python), checks answers automatically, ends in a quiz, links to curated outside practice and adds cards to an FSRS spaced-repetition queue. A daily **Today** page answers "what do I do now?" and "what have I learned?". The UI follows an Awwwards-grade "data observatory" direction: big visual effects on the map and home page, calm and readable lessons.

## Requirements restatement
1. Curriculum researched and written by us: SQL (S0–S10), Python (P0–P8) and a DE bridge track (D1–D6, including a capstone). See research §1.
2. Proven teaching methods built into the product, not just the content: retrieval, spacing, interleaving, worked → faded examples, Parsons problems, predict-before-run and JS analogies.
3. A quiz for every lesson plus a checkpoint quiz for every module.
4. Outside practice links for every module, checked and tagged by difficulty.
5. Daily use: a Today page, streaks, a review queue and a "learned log" of what was learned when.
6. Single user, no backend, no account. Progress is kept in browser storage with export/import backup.
7. Awwwards-worthy, interactive and beautiful, while staying accessible and safe with reduced motion.

## Patterns to mirror
The project folder is empty, so there are **no existing patterns**. This plan sets them (see Conventions).

## Tech stack (decisions)
| Concern | Choice | Why |
|---|---|---|
| Framework | **Vite + React 19 + TypeScript (strict)** | The user is a FE dev and can read and change it; an SPA fits the heavy client-side state |
| Routing | React Router (data router) | Simple and works on static hosts (hash or SPA fallback) |
| Content | **MDX** lessons plus typed TS/YAML for quizzes and exercises, validated with **zod** | Interactive components inside the prose; the schema catches bad content |
| SQL engine | **DuckDB-WASM** in a Web Worker | Postgres-like dialect with window functions and CTEs; reads CSV/Parquet/JSON. A good fit for DE |
| Python engine | **Pyodide** in a Web Worker (pandas, plus the `duckdb` wheel for the capstone) | Real CPython, loaded only when needed |
| Editor | **CodeMirror 6** (`@codemirror/lang-sql`, `lang-python`) | About 10× lighter than Monaco, with strong accessibility and keybindings |
| Storage | **Dexie (IndexedDB)** + JSON export/import | Durable and queryable; the backup protects against wiped browser data |
| Spaced repetition | **ts-fsrs** (MIT, FSRS v6) | Needs fewer reviews than SM-2 for the same retention |
| Motion | **GSAP** (+ ScrollTrigger on map/home only), View Transitions API for route changes | DeepBook was measured using GSAP + ScrollTrigger (scrub only). Cerebrium, Krackerz and DeepBook use Lenis, but we skip it (see R9) |
| Visuals | SVG + Canvas 2D (no WebGL in the MVP) | Better performance and accessibility; a WebGL hero is a stretch goal |
| Styling | CSS Modules + CSS custom-property tokens (no Tailwind) | Full control for award-level craft |
| Tests | Vitest + Testing Library, Playwright e2e and a content-validation script | |
| Deploy | Netlify or Vercel static + PWA (vite-plugin-pwa) for offline use | Caches the WASM after the first load |

## Conventions (established by this plan)
- Files: `kebab-case.tsx` components in `src/components/<area>/`, hooks named `use-*.ts`, content in `content/<track>/<module>/`.
- IDs: `sql.s4.left-join`, `py.p4.generators`. IDs are stable and used as keys in storage and SRS cards. Never rename an ID; add an alias map if needed.
- Errors: engines return `Result<{rows|stdout}, {kind, message, line?}>` and never throw across the worker boundary. A user-facing error panel turns DuckDB and Python errors into beginner hints.
- No `console.log` in shipped code. A tiny `logger` util only logs when `import.meta.env.DEV` is set.

## Information architecture
| Route | Purpose |
|---|---|
| `/` **Today** | Streak, number of reviews due, "Continue: next lesson", one practice problem and a 7-day plan. Target is 30–45 min a day |
| `/map` | The curriculum as an interactive **pipeline DAG**: modules are nodes and prerequisites are edges. Mastered nodes glow and "data" flows along completed edges |
| `/learn/:track/:module/:lesson` | Lesson player (see the loop below) |
| `/review` | FSRS session that mixes topics |
| `/practice` | All outside problems, filterable by module, difficulty and site; mark them done |
| `/playground` | Free SQL with sample datasets, plus a Python scratchpad |
| `/log` | "What I've learned": a timeline by day, concept mastery and a 365-day heatmap |
| `/settings` | Daily goal, export/import progress, reset, motion preference override |
| Cmd/Ctrl-K | Command palette that jumps to any lesson or concept |

## The lesson loop (pedagogy → product)
Every lesson (about 15–25 min) follows the same rhythm, so the learner's working memory goes to the content instead of the navigation:
1. **Warm-up recall** (2 min at most): 2–3 due cards from *earlier* modules.
2. **Why it matters**: a one-paragraph DE scenario plus a **JS bridge**, for example `rows.filter(r => r.country === 'IN')` ↔ `WHERE country = 'IN'`.
3. **Worked example (Predict → Run → Investigate)**: the learner must commit to a prediction (multiple choice or typed) before Run unlocks.
4. **Faded example**: the same pattern with blanks, or a Parsons drag-to-order exercise.
5. **Make it**: an independent exercise in the editor, checked automatically, with 3 levels of hints (nudge → concept → partial solution). The solution only appears after an attempt.
6. **Quiz**: 5–8 items of mixed types; every wrong option comes with an explanation.
7. **Practice out there**: 1–3 curated outside problems.
8. **Cards created**: key concepts and missed quiz items go into FSRS.

A lesson counts as mastered when the quiz score is at least 80% **and** its cards are later recalled correctly (successive relearning). Map nodes show three states: started → passed → mastered.

### Question/exercise types
`mcq`, `multi-select`, `predict-output`, `parsons` (order lines or clauses), `fill-blank`, `sql-exercise` (result-set compare), `py-exercise` (hidden asserts), `spot-the-bug`, `which-tool` (an interleaving drill: JOIN vs window vs GROUP BY).

### Auto-checking
- **SQL**: run the learner's query and the reference query against the same seeded DuckDB database, then compare column count, types and rows. Rows are compared as a multiset, order-insensitive unless `orderMatters: true`, with a tolerance for floats. A diff view shows missing and extra rows.
- **Python**: run the learner's code, then hidden `assert`-based tests, in a fresh Pyodide namespace. Code that runs past 5 s is stopped by terminating the worker.

### Datasets (seeded, small, realistic, DE-flavoured)
`shop` (customers, orders, order_items and products: e-commerce OLTP), `events` (web clickstream for sessions and funnels), `rides` (time series for window functions) and `hr` (self-joins and hierarchies), plus raw CSV/JSON/Parquet files for the capstone. A seed script generates them deterministically and they are committed as Parquet.

## Visual & interaction design ("Data observatory")
Based on the Awwwards references Grids (educational, typographic, grid), DeepBook (data viz, signal blue on ink), Cerebrium (app-style microinteractions) and AI in Design Report 2026 (data storytelling). See `docs/research.md` §3.
- **Palette tokens** (measured, see research §3.2): ink `#0B0D10`, surface `#15181D`, line `rgba(255,255,255,.10)`, text `#EFEFEB`, muted `#8A96A1`. **SQL = `#1E6EF3` fill / `#5B95F7` text**, **Python = lavender `#CDABFE`**, **DE = orange `#FE7141`**, **mastery = lime `#C8FF2E`**, error `#FF5C5C`. The light theme uses `#F7F6F0` paper with `#161616` text.
- **Type**: *Geist* for UI/body/display and *Geist Mono* for code and 13 px uppercase labels. Scale: 13 · 16 (prose at 18) · 22 · 40 · 64 · 96, with negative tracking at display sizes. Radii are 4 / 7 / 16 px.
- **Grid**: 12 columns with a visible hairline grid on the map and home page (a nod to Grids), hidden in lessons.
- **Signature interactions** (the "award moments"):
  1. **Pipeline Map**: an SVG DAG of all 26 modules. Particles flow along mastered edges (Canvas 2D), hovering a node shows a module preview card and the first visit has a scroll-scrubbed intro.
  2. **SQL Execution Lens**: animates a query's *logical* order (FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT) on real rows. Rows fade out at WHERE, collapse into groups, and so on. This is the most useful single teaching visual for SQL.
  3. **Join Visualizer**: two tables where matching keys draw connecting lines. LEFT JOIN shows rows padded with NULLs, and duplicates from fan-out are highlighted.
  4. **Window Frame scrubber**: drag a frame across a partition to watch running totals being computed.
  5. **Python Step-through** for generators and iterators: yield points light up, with a memory meter compared against a list.
  6. **Streak heatmap and mastery rings**. Passing a lesson sends a subtle "light pulse" across the map instead of confetti.
- **Motion rules** (measured, see research §3.2): hover 200 ms `cubic-bezier(0.44,0,0.56,1)` (colour/border only); UI 250 ms and entrances 500 ms with `power3.out` `cubic-bezier(0.165,0.84,0.44,1)`; story moments 1000 ms. ScrollTrigger is scrub-only with no pins (`top bottom → top 30%`). Inside a lesson nothing animates unless the learner triggered it. With `prefers-reduced-motion`, only cross-fades remain, particles stay still and scroll-scrubbing is off.
- **Accessibility**: WCAG 2.2 AA contrast in both themes and a full keyboard path (Run = Ctrl/Cmd-Enter, hint = H, next = N). Every visualization has a text equivalent (a table diff), and focus-visible styling is designed rather than left at browser defaults.

## Files to create (top level)
| Path | Purpose |
|---|---|
| `package.json`, `vite.config.ts`, `tsconfig.json` | Scaffold |
| `src/styles/tokens.css`, `src/styles/global.css` | Design tokens, themes |
| `src/app/routes/*` | Route components above |
| `src/components/shell/*` | Nav, command palette, theme/motion toggles |
| `src/components/editor/code-editor.tsx` | CodeMirror wrapper |
| `src/engines/sql/{worker.ts,client.ts,checker.ts}` | DuckDB-WASM |
| `src/engines/python/{worker.ts,client.ts,checker.ts}` | Pyodide |
| `src/components/quiz/*` | One component per question type |
| `src/components/viz/{pipeline-map,execution-lens,join-viz,window-scrubber,py-stepper,heatmap}.tsx` | Signature visuals |
| `src/learning/{store.ts,srs.ts,mastery.ts,today-planner.ts,streak.ts}` | Learning engine |
| `src/content/schema.ts` | zod schemas for lesson/quiz/exercise/practice-link |
| `content/sql/s0..s10/*.mdx`, `content/python/p0..p8/*.mdx`, `content/de/d1..d6/*.mdx` | Lessons |
| `content/**/quiz.yaml`, `content/**/exercises.yaml`, `content/practice-links.yaml` | Assessments + links |
| `data/seed/*.ts` → `public/datasets/*.parquet` | Deterministic datasets |
| `scripts/validate-content.ts` | Schema check + runs every reference solution through its checker |
| `scripts/check-links.ts` | Verifies every external practice URL |
| `tests/unit/**`, `tests/e2e/**` | Vitest + Playwright |

## Phases & tasks

### Phase 0: Foundations (S)
- Scaffold Vite/React/TS in strict mode with ESLint, Prettier, Vitest and Playwright.
- **Validate**: `npm run build && npm test` pass on the empty app.

### Phase 1: Design system & shell (M)
- Tokens (dark/light), type scale, grid, motion primitives (`useReducedMotion`, GSAP context hooks), layout shell, nav, command palette, route stubs and View Transitions.
- **Validate**: a "kitchen sink" route `/dev/ui` (instead of Storybook) renders every primitive; the axe check passes; the reduced-motion toggle works.

### Phase 2: Code engines (M/H). Highest technical risk, so it comes early
- DuckDB-WASM worker: start up, load Parquet datasets, run queries, enforce a timeout and reset the database for each exercise.
- Pyodide worker: lazy load, capture stdout/stderr, enforce a timeout by terminating and respawning the worker, and preload pandas when needed.
- Checkers (SQL result-set compare, Python asserts) plus friendly error translation.
- Editor component with keybindings.
- **Validate**: unit tests for checker edge cases (NULLs, float tolerance, ordering, duplicate rows). E2E: running a query renders a table, and a Python infinite loop shows a timeout message.

### Phase 3: Content system (M)
- zod schemas, an MDX pipeline with embedded components (`<Worked>`, `<Predict>`, `<Faded>`, `<Exercise>`, `<JsBridge>`, `<Quiz>`), a content loader and the `validate-content` script in CI.
- **Validate**: the script fails on a deliberately broken fixture and passes on a valid one.

### Phase 4: Learning engine (M)
- Dexie schema (attempts, lesson states, cards, review logs, daily log), FSRS scheduling, mastery rules and streaks. Streaks get 1 "freeze" per week to avoid streak anxiety. The Today planner puts reviews first, then a new lesson, with a daily cap on new cards. JSON export/import.
- **Validate**: unit tests with a fake clock for streaks and scheduling, plus an export → wipe → import round-trip test.

### Phase 5: Vertical slice (M). ✅ Checkpoint with the user
- Fully write **S1 (Reading data)** and **P0 (Python for JS devs)** through the whole loop, with Today, Review and Log working on real data.
- **Checkpoint**: the user uses it for 2–3 days, then we adjust pacing, tone and UI before writing the bulk of the content.

### Phase 6: Signature visuals (H)
- Pipeline Map, SQL Execution Lens, Join Visualizer, Window scrubber, Python stepper and heatmap, each with a reduced-motion and text fallback.
- **Validate**: Playwright screenshots on desktop and mobile; Lighthouse performance ≥90 on `/` and lesson routes (WASM lazy-loaded).

### Phase 7: Content wave 1 (H)
- S0 and S2–S6; P1–P4. Quizzes, exercises and practice links.
- **Validate**: `validate-content` (every reference solution passes its own checker) and `check-links`.

### Phase 8: Content wave 2 + capstone (H)
- S7–S10, P5–P8 and D1–D6. D4 (dbt) and D5 (Airflow) can't run in a browser, so they're taught with in-browser simulators plus guided "do this locally" labs. The capstone runs fully in the browser: fetch fixture "API" JSON → load it into a raw DuckDB table with Python → SQL staging → mart → data tests.
- **Validate**: the same checks as Phase 7, plus a capstone e2e test.

### Phase 9: Polish & ship (M)
- PWA/offline caching of the WASM and datasets, an accessibility audit (axe plus manual keyboard testing), a performance budget, deployment and a README on how to add lessons.
- **Validate**: Lighthouse accessibility 100 and performance ≥90; reloading offline works; the e2e suite passes.

## Content production approach
- Claude writes the lessons from the researched curriculum. Each lesson file has front-matter: `id, title, prereqs, objectives[], estMinutes, jsBridge`.
- `validate-content` runs every SQL and Python reference solution, so **no unverified answer ships**.
- Quiz wrong answers are built from common misconceptions: `WHERE` on aggregates, `COUNT(col)` vs `COUNT(*)` with NULLs, a LEFT JOIN turned into an INNER JOIN by a WHERE filter, mutable default arguments.
- Volume estimate: about 26 modules × 3 lessons ≈ 80 lessons, with about 600 quiz items and 250 exercises.

## Dependencies
DuckDB-WASM, Pyodide (CDN or self-hosted), CodeMirror 6, Dexie, ts-fsrs, GSAP, zod, MDX, vite-plugin-pwa. No backend, no API keys.

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| WASM download size (Pyodide ~10 MB, DuckDB ~7 MB) slows the first load | High | M | Lazy-load per route and track, preload in workers when idle, PWA cache, skeleton UIs |
| DuckDB's SQL dialect differs from the Postgres used on outside practice sites | M | M | Teach portable SQL; add "dialect notes" callouts where DuckDB and Postgres differ |
| Content correctness (written by an LLM) | M | H | Run every solution in validation, get a Codex review, and add a "report issue" button that saves to a local file for later fixes |
| Content volume is the real bottleneck | High | H | Vertical slice first, release tracks one at a time, show "coming soon" nodes on the map |
| Visual spectacle competes with readability | M | M | Motion rules keep lessons calm; CI enforces performance and accessibility budgets |
| Progress lost when browser data is cleared | M | H | Request persistent storage (`navigator.storage.persist`) and remind weekly to export |
| Outside links break or go behind paywalls | M | L | Link checker, prefer free resources, tag "account required" |
| dbt/Airflow can't run in a browser | Certain | L | Simulators plus local guided labs; neither is core to SQL/Python mastery |
| Streak anxiety leads to quitting | M | M | Streak freezes, and a "minimum viable day" of 10 reviews |

## Open questions (defaults assumed)
1. Daily time budget: default 30–45 min.
2. Deploy host: default Netlify (it can also stay local-only).
3. OS for the "do this locally" labs: default Linux (the user is on CachyOS).
4. Name: "DataForge" for now.

## Acceptance
- [ ] All 10 phases (0–9) complete, with the vertical slice approved by the user at Phase 5
- [ ] `npm run build`, `npm test`, `npm run validate:content`, `npm run check:links` and the Playwright e2e suite all pass
- [ ] Lighthouse accessibility 100 and performance ≥90 on Today and on a lesson route
- [ ] Reduced-motion and keyboard-only paths work end to end
- [ ] Progress survives export → clear → import

---

# Revision 2: changes after Codex review (2026-11-06)

Codex (GPT, read-only) reviewed this plan and `docs/research.md` and returned 20 issues (11 High, 9 Med). Accepted ones are folded in below. **This section overrides anything above that conflicts with it.**

## R1. Curriculum changes
- **Add F0, Dev foundations (early and skippable):** terminal basics, Git, VS Code, installing Python with `uv`, running `psql`/`duckdb` locally. Done as **local labs** with checklists, not in-browser.
- **Add D0, Cloud basics (late):** object storage (S3/GCS), IAM and secrets, warehouse basics (BigQuery/Snowflake concepts) and cost awareness. Concepts only; actual paid cloud work stays optional.
- **Reorder:**
  - Keys, cardinality (1:1, 1:N, N:M) and **grain** move into S3.5 *before* joins (S4). S8 keeps star schemas and SCD2.
  - Basic `assert` testing is taught in P1 alongside functions. P8 keeps pytest and Pydantic.
  - File formats (CSV/JSON/Parquet basics) move to P2 alongside file processing. D2 keeps partitioned layouts.
- **Mark as optional "extension" lessons:** recursive CTEs, decorators, Polars and the advanced S10 patterns (gaps & islands, cohorts).
- **One recommended daily path** that interleaves the tracks (e.g. S0 → P0 → S1 → P1 → S2 …) with explicit cross-track prerequisites in front-matter.
- **Each lesson is labelled by where it runs**: 🌐 browser or 💻 local lab. Real HTTP and auth, real PostgreSQL connections, venv/pip and dbt/Airflow are **local labs**. Browser API lessons use fixture-backed fake APIs.

## R2. Honest time budget
80 lessons × 15–25 min is already 20–33 h before reviews, practice and projects, while 12 weeks × 30–45 min a day is about 42–63 h. So:
- The **core path** is about 45 lessons. Extensions are on top of that.
- The calendar is not fixed. The Today page projects a finish date from the *observed* completion times.
- Each lesson's `estMinutes` covers the whole session (lesson + quiz + practice), and is adjusted from logged time.

## R3. Auto-checking contract (replaces "Auto-checking" above)
**SQL**
- Every exercise runs against **2–4 isolated fixture variants**: the main one plus edge-case fixtures with NULLs, duplicates, unmatched keys, empty tables and ties. This catches hard-coded answers and wrong joins that happen to match one dataset.
- The learner query and the reference query run in **separate fresh DB instances** (re-created from Parquet), so a learner's mutation can't contaminate the oracle.
- Read exercises only accept `SELECT`/`WITH`, checked by a statement-type check before running.
- Each exercise has a comparison contract: `orderMatters` (verified with an ORDER BY check plus a tie policy), `columnNames: strict|ignore`, type *families* (int-like, decimal-like with tolerance, text, date/timestamp, bool), normalising BigInt and Decimal, and `NULL = NULL` for comparison.
- **DDL/DML exercises** are graded by inspecting the final table state, constraints and transaction outcome, not result sets.

**Python**
- Exercises define a **function contract** (name, inputs → outputs) and run against multiple held-out inputs, with explicit grading for mutation, raised exceptions and DataFrame equality (`pandas.testing`).
- Runtime state is reset between runs: user modules are purged from `sys.modules`, the virtual FS is cleared and the worker is respawned when in doubt.
- The tests are described as **feedback, not tamper-proof assessment**. It's a single-user app, and hidden tests can be inspected.

**Both**
- **Separate timers** for engine/package loading (generous, with a progress UI) and execution (5 s).
- **Output and result caps** (e.g. 1,000 rows, 200 KB stdout), a **Cancel** button and run IDs, so replies from an old run are ignored. After a cancel or a crash, the worker is terminated, respawned and reseeded.
- Tests cover **recovery** (running again after a cancel works), not just the timeout message.

## R4. Content validation (replaces "no unverified answer ships")
For each exercise, `validate-content` requires:
1. The reference solution passes.
2. **At least 2 known-wrong solutions fail** (e.g. an INNER join where LEFT is needed, or a missing NULL handling).
3. **At least 1 alternate correct solution passes** (e.g. a CTE version and a subquery version).

On top of that, each lesson batch gets an independent review against primary docs (DuckDB/Postgres/Python docs) by a second model (Codex) before release, and quiz explanations are checked in that pass.

## R5. Mastery and FSRS specification
- **Ratings mapping:** wrong → Again; correct after a hint or a slow answer → Hard; correct → Good; correct and fast on a recall card → Easy (only for self-graded flashcards).
- **Settings:** target retention 0.9, `ts-fsrs` pinned to an exact version, at most 10 new cards a day, and the full review log persisted (so it can be re-optimised later).
- **Backlog:** when overdue cards pile up, the most-overdue cards are shown first with a daily cap, and the UI shows the backlog honestly.
- **Mastery is separate from FSRS:** a lesson counts as mastered after **3 successful retrievals on different days** using parallel retest items (not the same question again) **and** 1 delayed independent coding task. Moving on to new lessons is never blocked by mastery.

## R6. Pedagogy softened
- Predict-before-Run is required **only on selected worked examples**. The scratchpad and exercise editors run freely.
- Lessons stay available as **reference material** (re-reading is allowed; it just isn't treated as the main study method).
- JS bridges include an **"Where the analogy breaks"** note (SQL works on bags not arrays, NULL is three-valued logic, Python mutability and default arguments).

## R7. MVP-first phasing (replaces "Phases & tasks" above)
| Phase | Deliverable | Gate |
|---|---|---|
| **A: Spike (S)** | Throwaway proof: DuckDB-WASM worker + Pyodide worker. **Capstone data hand-off**: Python (Pyodide DuckDB) writes Parquet to a shared in-memory file → the DuckDB-WASM worker reads it → Python verifies. Measure load times and memory. | Go/no-go on the stack, and the choice of capstone DB owner |
| **B: MVP (M)** | Scaffold, tokens, shell, **one SQL checker + one Python checker**, Today, Dexie progress + versioned export/import, a simple module list (not the Pipeline Map yet). Content: **F0, S0, S1, P0**. | **Daily use starts here.** Use it for 3–5 days, then adjust |
| **C: Learning engine (M)** | FSRS reviews, mastery, streak with freezes, Log page + heatmap | Fake-clock tests pass |
| **D: Content waves (H, repeated)** | One module pair per wave (e.g. S2 + P1), each through R4 validation plus Codex review | Each wave ships independently |
| **E: Signature visuals (H, incremental)** | Pipeline Map first, then Join Visualizer (alongside S4), Window scrubber (alongside S6) and generator stepper (alongside P4). **Visuals are curated, tested examples** labelled "logical order", not tracers for arbitrary queries | Each visual has a text/table fallback and keyboard access |
| **F: Capstone (H)** | D6 pipeline that must survive **reruns (idempotency), duplicate input, partial failure, schema drift (a new column) and late/timezone data**, with reconciliation (counts, freshness, quality checks) | Capstone e2e passes all failure scenarios |
| **G: Offline + ship (M)** | **Opt-in versioned offline packs** (SQL pack, Python+pandas pack) showing download size, handling quota and doing safe upgrades. Workbox config for large assets. Deploy | Offline Python + pandas works after a browser restart |

The MVP's acceptance is separate from the full roadmap's acceptance.

## R8. Storage and versioning
- Dexie DB schema versioned with migrations, a versioned export format, and imports **validated with zod before** a transactional replace.
- Editor drafts are persisted per exercise. Progress records the **content version** each lesson was completed on, and edited lessons get a "content updated" badge.
- Upgrade test: open an old DB fixture with the new code and check that progress survives.

## R9. Tech and UI scope trims
- **MDX is compiled at build time** (it's trusted content) with an **allowlisted component vocabulary**, which a lint rule enforces.
- **Lenis is deferred** (it's not needed). GSAP is used only on the Map, home and celebrations; route changes use the View Transitions API alone.
- Accessibility: every hover preview also opens on focus and click, Parsons exercises can be reordered by keyboard (move up/down buttons plus arrow keys), and single-key shortcuts (H/N) are disabled while an input or editor has focus. axe and Lighthouse are treated as **partial checks**, followed by a manual keyboard and screen-reader pass.

## R10. Research honesty and practice links
- `research.md` will separate **evidence** (Dunlosky 2013 original, Cepeda 2006, the Parsons/fading papers) from **editorial choices** (the curriculum order, "dbt matters"). Primary sources replace the secondary summaries where possible.
- Practice links become **problem-level mappings**: `{url, site, title, module, difficulty, dialect, accountRequired, free, estMinutes, lastChecked}`. They're curated per lesson and checked by `check-links`.

## Codex points not adopted as-is
- None rejected outright. Two were **scaled down**: (a) the "independent review against primary docs" is done per *batch* by Codex plus the executable checks, not by hand for every lesson; (b) offline packs are opt-in but start as two packs (SQL, Python) rather than a fine-grained per-module system.
