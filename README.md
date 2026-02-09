# [WIP] Interview PWA

A lightweight, local-first interview preparation tool designed to help rehearse clear, structured answers for technical and behavioural interviews.

This project focuses on articulation, reflection, and confidence-building rather than scoring or memorisation. It is intentionally calm, minimal, and offline-first.

---

## Purpose

The goal of this PWA is to support deliberate interview practice by:

- Breaking questions into clear cognitive shapes (process, narrative, system, judgment, conceptual).
- Guiding structured thinking without over-prescribing answers.
- Encouraging rehearsal and reflection rather than correctness.
- Keeping all data local and private to the user.

The tool is designed to feel more like a quiet notebook than a quiz platform.

---

## Features

- Question dashboard with categories, difficulty, and progress state.
- Guided question detail view with step-through prompts.
- Plain, Structured, and Polished writing modes.
- Autosave with manual save support.
- Local-first persistence using IndexedDB with localStorage fallback.
- Lightweight schematic diagrams to support thinking.
- Keyboard-first navigation and accessibility considerations.
- Theme and style selection at runtime.

---

## Architecture

- **Framework:** Vanilla JavaScript (no heavy frameworks)
- **Build tool:** Vite
- **Styling:** Tailwind CSS with custom component styles
- **Data model:** Declarative question schema (`schemaVersion: 1.0`)
- **Persistence:** IndexedDB (primary) with localStorage fallback
- **Rendering:** Modular components with minimal shared state

Diagrams are rendered from declarative hints rather than authored directly, allowing future renderer changes without modifying content.

---

## Data and storage

- Question definitions live in `src/data/questions.json`.
- User notes and progress are stored locally per question.
- No external services are required for data storage; Google Fonts are loaded from fonts.googleapis.com unless self-hosted or pre-cached.
- No analytics, tracking, or scoring is implemented.

All data remains on the user’s device.

---

## Development

### Quick start

```bash
npm install
npm run dev
```

### PWA preview

Service worker registration happens only in production builds.

```bash
npm run build
npm run preview
```

### Tests

```bash
npm test
```

---

## Project structure
- `src/pages` — Page-level renderers
- `src/components` — Reusable UI components
- `src/lib` — Storage and utility modules
- `src/data` — Question definitions
- `src/styles` — Base styles and theme support

---

## Design principles
- Calm, focused UI over feature density
- Words first, diagrams second
- Local-first and private by default
- Minimal abstractions with clear contracts
- Accessibility and keyboard navigation as first-class concerns

---

## Status
This project is under active development and is being used as a personal interview preparation tool. The current focus is validating the core rehearsal loop across different question types before expanding functionality.

---

 ## License
Private project. No license specified.