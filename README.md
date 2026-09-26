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
Researcher previews or publishes experiment
    ↓
Participant opens minimal distraction-free runtime (/run or /preview)
    ↓
High-resolution performance.now() measures reaction latency & response
    ↓
Trials serialize to typed API repository / reactive mock telemetry store
    ↓
Live research dashboard, psychometric analytics, & performance leaderboard
```

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

## ⏱️ High-Resolution Reaction-Time Measurement

Browser-based psychophysics captures latency using `window.performance.now()`.
```ts
trialStart = performance.now();
// on response
reactionTimeMs = performance.now() - trialStart;
```
### Timing Safeguards
- **Zero Decorative Animation during Active Stimulus Presentation**: To avoid frame rendering delays and thread contention, stimulus components render directly to the DOM without Framer Motion delays.
- **Hardware Latency Documentation**: Accounts for V-Sync display refresh intervals (60Hz–144Hz, ~7–16ms) and USB keyboard polling rates (125Hz–1000Hz).
- **Keyboard & Touch Accessibility**: Supports keys `1`, `2`, `3`, `4` (or `R`, `G`, `B`, `Y`) as well as accessible on-screen buttons.

---

## 🧭 Routes & Features

| Route | Purpose | Key Capabilities |
|---|---|---|
| `/` | **Public Landing Page** | Interactive neural canvas hero, live RT sparkline, 4-stage pipeline, builder preview, architecture. |
| `/dashboard` | **Researcher Dashboard** | 5 KPI metric cards with sparklines, central Reaction Time line chart, accuracy bar chart, distribution histogram, live telemetry feed. |
| `/builder` | **No-Code Experiment Builder** | React Flow node graph, draggable library (Flow, Stimulus, Timing, Response, Measurement, Data), real-time node inspector, undo/redo, syntax-highlighted JSON viewer, publish flow. |
| `/preview/:id` | **Experiment Preview** | Instant preview using the same runtime engine as live trials. |
| `/run/:expId/:sessId` | **Participant Runtime** | Minimal, distraction-free, centered, high-contrast; 10-trial Color Response Study with consent, instructions, fixation cross, and completion summary. |
| `/analytics` | **Deep Research Analytics** | 7 psychometric hero metrics, RT over trials with Text/Color/Image series toggles, latency histogram, stimulus comparison, computed research insights, CSV/JSON export. |
| `/participants` | **Participant Directory** | Cohort management, status badges, average RT, accuracy, and consistency index. |
| `/participants/:id` | **Individual Profile** | Subject performance timeline, stimulus comparisons, and trial-by-trial millisecond logs. |
| `/leaderboard` | **Performance Leaderboard** | Top 3 glowing podium cards, multi-stimulus progression chart, cross-participant comparison module, and full cohort standings table. |
| `/library` | **Research Template Library** | Peer-reviewed cognitive paradigms (Stroop, Visual Search, RSVP, Choice Reaction, Flanker) with "Clone into Builder". |
| `/settings` | **Platform & API Settings** | Mock Mode toggle, remote API URL configuration, network latency simulation, backend health ping, and factory reset. |
| `/login` / `/signup` | **Auth Screens** | Dark cinematic login, institutional signup, and password recovery. |

---

## 🔌 API Layer & Mock Mode

CognitiveLab is **frontend-first** and fully functional in mock mode without requiring a backend server.

- **Toggle via Environment**:
  ```env
  NEXT_PUBLIC_USE_MOCK_DATA=true
  NEXT_PUBLIC_API_BASE_URL=https://api.cognitivelab.internal/v1
  ```
- **Reactive Persistence**: Any completed trial in the participant runner immediately serializes to the local telemetry store, updating `/dashboard`, `/analytics`, `/participants`, and `/leaderboard` in real time.
- **Typed Services**:
  - `experimentService`: `getAll`, `getById`, `save`, `publish`, `archive`, `duplicate`
  - `participantService`: `getAll`, `getById`
  - `analyticsService`: `getSummary`, `getInsights`
  - `leaderboardService`: `getLeaderboard`
  - `trialService`: `getTrials`, `submitTrialRun`

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
