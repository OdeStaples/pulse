# Handoff

## 1. Goal
Two features in Pulse (personal sleep/recovery/strain app, Next.js + SQLite):
1. A sleep stage graph. 2. A resting vs active calorie breakup.
The user has no coding experience: explain steps in plain, short language.

## 2. Done so far
- Setup: cloned https://github.com/ODeStaples/pulse, installed pnpm 11.17.0 and the Visual Studio C++
  Build Tools (needed to compile `better-sqlite3`). `.env` is demo mode and git-ignored.
- Calories (branch `calorie-breakup`, pushed to origin, commit 42b34d5): the Strain page "Calories burned"
  card (`TrendChart` with new `weekNav` prop) now has prev/next arrows, a "Week 40" label, Monday-Sunday
  weeks (`?wk=`), weekday-over-date bar labels, and stops at the earliest week with data. Calories data
  window is 182 days (was 30) via `calorieSplit(..., 182)` in `src/server/queries/strain.ts`. Tests added.
- Sleep (branch `sleep-graph`, no code yet): the API gives per-stage segments (start, end, stage) when
  `stagesStatus` is SUCCEEDED (`src/server/sources/google/map.ts`), stored in `sleep_segments`. A hypnogram
  already shows on the Sleep page (`SleepStages` > `Hypnogram`). Unclear what the user wants changed.
- The API has no resting-calorie figure; resting = total minus active (capped at 0).

## 3. In progress
- The user is checking the calorie card by eye. Not yet seen in a browser: whether two-line weekday/date
  labels fit at phone width, and how the arrows look. Chrome extension was not connected.
- `HANDOFF.md` edits are uncommitted. Next: fix whatever the user reports, then open a pull request
  `calorie-breakup` -> `main` (CONTRIBUTING.md: `main` is protected). Then ask what the sleep graph should change.

## 4. How to run and test
- `pnpm dev`, then http://localhost:3000 (demo sign-in; /strain for calories, /sleep for sleep). Health: /healthz
- `pnpm lint`, `pnpm typecheck` pass. `pnpm test`: 7 tests fail, but they fail on the untouched code too.
- Demo data: 180 days (`SEED_DAYS` in `src/server/sources/seed/scenario.ts`). Left alone on purpose: ~37 files
  and a golden-value test depend on it. The existing `data/demo.db` is not back-filled.

## 5. Decisions and gotchas
- Known Windows-only test failures: `auth.contract.test.ts` (6), `config.test.ts` (1, path `C:\tmp`), and
  15 files fail at cleanup with EBUSY (temp db locked). Not caused by our changes.
- `pnpm install` failures: no prebuilt `better-sqlite3`; fixed by the Build Tools. An EPERM rename error
  appears if a shell sits inside `node_modules\.pnpm\better-sqlite3...`; run from the project root.
- `CLAUDE.md` (untracked, leave it out of commits): never install system software without asking first
  (give name, size, reason); prefer prebuilt packages; no new dependencies without approval; stay inside
  this folder. The Build Tools were installed before this was read. Offer to uninstall if asked.
- Pushing needs the user: run `! git push -u origin <branch>` (Git Credential Manager signs in). `gh` is not installed.
- PowerShell 5.1: double quotes inside a `@'...'@` commit message broke the command. Use `git commit -F file`.
- The dev server was killed once for low memory. Restart it only when asked.
- Commit trailer: Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
