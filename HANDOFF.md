# Handoff

## 1. Goal
Build two features in Pulse (a personal sleep/recovery/strain app, Next.js + SQLite):
1. A sleep stage graph.
2. A calorie breakup into resting vs active.
Note: the goal text comes from the user's handoff request. No design or code for it exists yet.

## 2. Done so far
- Cloned https://github.com/ODeStaples/pulse into `C:\Users\USER\Documents\projects\pulse`.
- Installed pnpm 11.17.0 (Node 22.17.0 and git were already there).
- Installed Microsoft Visual Studio 2022 C++ Build Tools (needed to compile `better-sqlite3`).
- Created `.env` from `.env.example` (demo mode, `GOOGLE_OAUTH_ENABLED=false`). It is git-ignored.
- Branch: `main`. No app source files changed. The demo app runs.

## 3. In progress
- Nothing started on the features. We stopped right after the app first ran.
- Next step: open the demo at the URL below, find where sleep and calories are shown
  (look under `src/`, see `AGENTS.md` and `docs/plans/`), then plan the sleep stage graph.
- Create a feature branch first (see gotchas). Do the sleep graph before the calorie split.

## 4. How to run and test
Run from the project root:
- `pnpm install` (only if `node_modules` is missing)
- `pnpm dev` starts the app. Open http://localhost:3000 (health check: /healthz)
- `pnpm test` unit tests, `pnpm lint`, `pnpm typecheck`, `pnpm e2e` (Playwright)
- Demo data is made up and lives in `data/demo.db`. No Google account is needed.

## 5. Decisions and gotchas
- `pnpm install` first failed: `better-sqlite3` has no prebuilt Windows binary for Node 22.17,
  so it compiles from source and needs the C++ Build Tools. Now installed; don't remove them.
- A second install failed with `EPERM ... rename` because a shell was sitting inside
  `node_modules\.pnpm\better-sqlite3...`. Fix: run from the project root, delete that folder, reinstall.
- Installs were slow (low bandwidth); expect warnings about slow downloads.
- `CONTRIBUTING.md` says `main` is protected and every change is a pull request.
  Work on a branch, not directly on `main`.
- There is an untracked `CLAUDE.md` in the root that was not made in this session. It was left
  uncommitted on purpose. Check it before deciding what to do with it.
- The user has no coding experience: explain steps in plain, short language.
- pnpm says a newer version exists (12.x). Ignore it; the project pins 11.17.0.
