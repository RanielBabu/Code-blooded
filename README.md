# CognitiveLab — Cognitive & Behavioral Experimentation Platform

A modern research platform for cognitive and behavioral psychophysics. Build behavioral experiments without writing code, publish and run trials with participants, capture millisecond-precision reaction times and accuracy data, and explore live psychometric analytics.

---

## 🔬 Architectural Overview

```
RESEARCHER
    ↓
Creates experiment in visual no-code builder (@xyflow/react)
    ↓
Graph compiles to structured JSON schema (Zod validated)
    ↓
Researcher publishes experiment
    ↓
Experiment must be published for participant access (gate check)
    ↓
Participant opens minimal distraction-free runtime (/run or /preview)
    ↓
High-resolution performance.now() measures reaction latency & response
    ↓
Trials serialize to typed API repository / reactive mock telemetry store
    ↓
Live research dashboard, psychometric analytics, & performance leaderboard
```

### Key Safeguards
- **Publish Gate**: Experiments that are not explicitly `published` are blocked from participants with a clear "This study is currently unavailable" screen. This prevents accidental data collection on draft or archived experiments.
- **Capture-Time Validity**: Premature responses, omissions, and outliers are evaluated at capture time and recorded on the trial (`valid`, `rejection`, `rejectionDetail`, `omission`) rather than silently filtered out of aggregates.

---

## 🎨 Design Philosophy: "Neural Lab / Research Intelligence"

CognitiveLab synthesizes:
1. **Reference A (Dark Crypto Analytics Dashboard)**: Dense data hierarchy, layered panels, glowing data visualizations, high information density, metric cards with sparklines, central time-series analytics, and top podium rankings.
2. **Reference B (Cinematic Motion / AI Interface)**: Interactive 60fps canvas particle network representing cognitive pathways and synaptic firings, ambient radial lighting, restrained cyan/blue/violet glows, and glass surfaces.

### Color Palette
- **Primary Environment**: `#05060A` (Near-Black)
- **Secondary Background**: `#0A0D14`
- **Panel Surface**: `#10141D`
- **Elevated Glass Panel**: `#151A24`
- **Electric Blue (Primary Accent)**: `#4F8CFF`
- **Violet (Secondary Accent)**: `#8B5CF6`
- **Cyan (Data / Psychometrics)**: `#22D3EE`
- **Positive / Success**: `#22C55E`
- **Warning / Jitter**: `#F59E0B`
- **Error / Conflict**: `#EF4444`

---

## ⏱️ Reaction-Time Measurement & Its Error Budget

A reaction time is only meaningful relative to a defined event. CognitiveLab defines:

```
RT = t(response) − t(stimulus onset)
```

`t(stimulus onset)` is the hard part, and timestamping it at the moment application code *requests* the stimulus is wrong. `setStage("trial")` only enqueues a React update; the DOM has not rendered, committed, or painted when that call returns. Measuring there made every trial look **faster than it was** by a full render+paint cycle (5–20ms), with enough variance to also inflate the reported standard deviation.

Onset is therefore timestamped by the **browser**, via a two-pass `requestAnimationFrame`:

```ts
requestAnimationFrame((frameStartMs) => {   // frame that will paint the stimulus
  pendingOnsetMs = frameStartMs;
  requestAnimationFrame(() => {             // that frame is now committed
    timer.start(pendingOnsetMs);            // anchor to the EARLIER frame time
    openResponseWindow();
  });
});
```

Anchoring to the first frame's timestamp while only *accepting responses* after the second means the participant has physically seen the stimulus before any reaction can be recorded.

### The honest accuracy ceiling

Browser JavaScript cannot achieve sub-millisecond stimulus onset. JS runs on the main thread; photon emission happens later on the compositor, and neither is observable to the other. The achievable budget is:

| Source | Uncertainty |
|---|---|
| Stimulus onset (V-Sync quantization) | **±1 frame** — 6.9ms @144Hz … 16.7ms @60Hz |
| Clock resolution, cross-origin isolated | 0.005ms |
| Clock resolution, default (**clamped**) | 0.100ms |
| Input hardware latency | 1–8ms wired, 8–15ms Bluetooth |

Laboratory-grade onset measurement requires a photodiode. The runtime footer reports the *measured* clock configuration rather than an assumed one.

### Cross-origin isolation

`performance.now()` is **clamped to 100µs** unless the page is cross-origin isolated; isolation drops the clamp to 5µs. `next.config.ts` sets `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: credentialless`.

`credentialless` rather than `require-corp` because the image stimulus mode renders a researcher-supplied `stimulus.imageUrl` as an `<img src>`, which `require-corp` would silently block. Set `CROSS_ORIGIN_ISOLATION=false` to disable, at the cost of the clamp. `measureClockResolution()` probes the live value rather than trusting the config.

### Capture-time validity rules

`minValidMs`, `timeoutMs` and `filterOutliers` are authored on the graph's `measurementNode` and `responseNode`, and are now **enforced** — previously they were persisted and displayed but never read by the runtime.

- **Premature** — response below the `minValidMs` floor. Human simple reaction times bottom out near 150–200ms; anything faster indicates an anticipatory press, not a fast response.
- **Timeout / omission** — no response inside the window. Recorded explicitly so trial counts stay reconcilable against the protocol.
- **Outlier** — robust z-score (median absolute deviation, Iglewicz–Hoaglin σ=3.5) against the participant's own accepted history. MAD rather than standard deviation, because a single anticipatory press inflates a mean-based estimator enough to hide itself.

Rejection happens at capture time and is **recorded on the trial** (`valid`, `rejection`, `rejectionDetail`, `omission`, `onsetSource`) rather than silently filtered out of an aggregate. A cleaned dataset is only interpretable if the reader knows what was removed. Storage aggregates (`getAnalyticsSummary`, `getLeaderboard`, participant metrics) exclude only trials explicitly marked `valid: false`, so pre-existing datasets keep their original meaning.

### Other timing safeguards
- **Response window is bounded.** Previously unbounded, so an inattentive participant could take arbitrarily long and the sample still entered the dataset.
- **Pointer capture uses `pointerdown`, not `click`.** A click is dispatched only after the full pointerdown→pointerup sequence, biasing button responses systematically slower than the keyboard path.
- **All pending timers are cancellable.** Fixation, feedback, onset frames and the omission timer are tracked and cleared on restart and unmount. Previously restarting inside the fixation window left a stale callback that started a trial the participant never saw.
- **Keyboard & Touch Accessibility**: keys `1`–`4` (or `R`, `G`, `B`, `Y`) plus on-screen buttons.

---

## 🧭 Routes & Features

| Route | Purpose | Key Capabilities |
|---|---|---|
| `/` | **Public Landing Page** | Isometric 3D hero tile, floating pill dock (5 Studies Live, Telemetry, Leaderboard), 4-stage pipeline, no-code builder showcase, 5 game capsules. |
| `/dashboard` | **Researcher Dashboard** | 5 KPI metric cards with sparklines, central Reaction Time line chart, accuracy bar chart, distribution histogram, live telemetry feed. |
| `/builder` | **No-Code Experiment Builder** | React Flow node graph, draggable library (Flow, Stimulus, Timing, Response, Measurement, Data), real-time node inspector, undo/redo, syntax-highlighted JSON viewer, publish flow. |
| `/preview/:id` | **Experiment Preview** | Instant preview using the same runtime engine as live trials. |
| `/run/:expId/:sessId` | **Participant Runtime** | Published-experience gate check, distraction-free centered runtime, 5 game capsules (Flash Count, Tone Detect, Visual Search, Color Word, Object Hunt), rAF-anchored stimulus onset, capture-time validity, omission trials. |
| `/analytics` | **Deep Research Analytics** | 7 psychometric hero metrics, RT over trials with Text/Color/Image series toggles, latency histogram, stimulus comparison, computed research insights, CSV/JSON export. |
| `/participants` | **Participant Directory** | Cohort management, status badges, average RT, accuracy, and consistency index. |
| `/participants/:id` | **Individual Profile** | Subject performance timeline, stimulus comparisons, and trial-by-trial millisecond logs. |
| `/leaderboard` | **Performance Leaderboard** | Top 3 glowing podium cards, multi-stimulus progression chart, cross-participant comparison module, and full cohort standings table. |
| `/library` | **Research Template Library** | Peer-reviewed cognitive paradigms (Stroop, Visual Search, RSVP, Choice Reaction, Flanker) with "Clone into Builder". |
| `/settings` | **Platform & API Settings** | Mock Mode toggle, remote API URL configuration, network latency simulation, backend health ping, and factory reset. |
| `/login` / `/signup` | **Auth Screens** | Dark cinematic login, institutional signup, and password recovery. |

---

## 🗄️ Data Layer

CognitiveLab persists to **PostgreSQL** via **Drizzle ORM**. The database is the source of truth: analytics are computed in SQL from raw trial rows, never in the browser.

### Getting started

```bash
docker compose up -d          # Postgres on :5433
cp .env.example .env.local
npm run db:migrate            # apply migrations
npm run db:seed               # load the fixtures from src/lib/mock/
npm run dev
```

Port 5433 is deliberate — 5432 is commonly claimed by another Postgres on the host, and CognitiveLab must not share a server with an unrelated project.

### Scripts

| Command | Purpose |
|---|---|
| `npm run db:migrate` | Apply pending migrations from `drizzle/` |
| `npm run db:generate` | Generate a migration after editing `src/lib/db/schema.ts` |
| `npm run db:seed` | Truncate and reload fixtures (idempotent) |
| `npm run db:studio` | Browse data in Drizzle Studio |
| `npm run db:verify` | Re-seed, then run the end-to-end smoke suite against a running dev server |
| `npm run typecheck` | `tsc --noEmit` |

### Schema

| Table | Purpose |
|---|---|
| `experiments` | Stable identity plus a pointer to the live revision. Holds no descriptive columns. |
| `experiment_versions` | Append-only revision history. A save inserts a new row; nothing is overwritten. |
| `participants` | One row per subject, with metrics derived from admissible trials at write time. |
| `trials` | The primary research record. Raw samples are never aggregated on write or discarded. |

`experiment_versions` being immutable is what makes a published paradigm traceable: a cohort's trial rows point at an experiment id, and every revision of that id is retained, so the exact node graph a cohort was run against can be recovered.

### Trial validity is a three-state field

`trials.valid` distinguishes `true` (assessed and passed), `false` (assessed and rejected), and `NULL` (not assessed — every historical record predating validity tracking). Aggregates exclude only `false`, expressed once in `src/lib/db/schema.ts` as:

```sql
valid IS DISTINCT FROM FALSE
```

Writing `WHERE valid` or `WHERE valid = true` instead would drop all historical rows and silently change previously published results. `getTrials` returns rejected samples by default so exclusions stay auditable; pass `admissibleOnly=true` to filter.

### Missing data is null, never zero

Every derived measurement is `number | null`. A missing value renders as an em dash or a gap in the chart; it is never replaced with `0`, an interpolated curve, or a plausible-looking estimate. This replaced an earlier behaviour that emitted ten trial-progression rows regardless of what was collected, filling the gaps with a synthetic `400 - trial * 6` ms practice curve and a flat 92% accuracy, and that derived per-modality latencies from `avgRt * 0.92 / 1.05 / 1.15` multipliers. Those charts looked complete while describing no measurement.

### Identifiers are server-allocated

Participant ids use `crypto.randomInt` over a 36-character alphabet. The previous `Date.now().toString().slice(-4)` scheme yields only 10,000 values and reuses them freely: two participants started in the same millisecond collide outright, and the value repeats roughly every 43 minutes, silently merging subjects. Client-supplied `id` and `participantId` on trial submission are discarded and replaced server-side.

---

## 🔌 API Layer

Route handlers under `src/app/api` implement the contract the browser client already calls. They are database-backed by default; the mock store remains available as a fallback.

- **Toggle via Environment**:
  ```env
  NEXT_PUBLIC_USE_MOCK_DATA=false   # default: use the database
  NEXT_PUBLIC_API_BASE_URL=         # default: same-origin
  ```
- **Typed Services** (unchanged call sites in `src/lib/api/services/`):
  - `experimentService`: `getAll`, `getById`, `save`, `publish`, `archive`, `duplicate`
  - `participantService`: `getAll`, `getById`
  - `analyticsService`: `getSummary`, `getInsights`
  - `leaderboardService`: `getLeaderboard`
  - `trialService`: `getTrials`, `submitTrialRun`

| Endpoint | Method | Notes |
|---|---|---|
| `/api/health` | GET | Real DB round-trip; 503 when unreachable |
| `/api/experiments` | GET | Current revision of each experiment |
| `/api/experiments/:id` | GET, PUT | PUT appends a revision; server allocates the version number |
| `/api/experiments/:id/publish` \| `/archive` \| `/duplicate` | POST | |
| `/api/experiments/:id/versions` | GET | Revision history, newest first |
| `/api/participants` \| `/api/participants/:id` | GET | |
| `/api/trials` | GET | Filter by experiment, participant, stimulus; `admissibleOnly=true` optional |
| `/api/trials/batch` | POST | Transactional session write; validates and rejects unknown experiments with 404 |
| `/api/analytics` \| `/api/analytics/insights` | GET | SQL aggregates |
| `/api/leaderboard` | GET | `metric=reactionTime\|accuracy\|consistency`, ranked in-database |

---

## 🚀 Running the Project

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build
```
Open [http://localhost:3000](http://localhost:3000) to view CognitiveLab.
