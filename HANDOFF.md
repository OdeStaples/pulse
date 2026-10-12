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
- The calorie card was checked in the browser by the user and works: week arrows, totals, tooltip, and
  stepping back to Week 33. (Claude never saw it; the Chrome extension was not connected.)
- Open items, both from the user and not started: the optional workout split, and the real-data setup
  (Google sign-in instead of demo mode, see `docs/setup.md`). Ask the user for details before starting either.
- Also pending: open a pull request `calorie-breakup` -> `main` (CONTRIBUTING.md: `main` is protected), and
  ask what the sleep graph should change.

## 3b. Upstream merge (parked on `merge-upstream`)
- Plan: connect the Fitbit Air on the current (SQLite) version first. Do the Postgres merge later, only if wanted.
- `calorie-breakup` stays on the SQLite version at the last pushed state (eda87e8). It was reset to that after the
  merge; nothing was lost.
- The merge of `upstream/main` (remote `upstream` = https://github.com/adityaongit/pulse, added locally) is saved on
  branch `merge-upstream` (8da909c), with the week-stepping work merged in. Conflicts were in the Strain page,
  `TrendChart`, and the strain queries/types.
- Upstream removed the Calories card from the Strain page (it now has a Weekly Trends footer with a `calories` view).
  Week stepping (`weekNav`) still lives in `TrendChart`, with tests, but no page uses it on that branch.
- Upstream moved Pulse from SQLite to Postgres (`pg`, better-auth; PGlite is for tests only). The merged code needs
  Postgres 18 on this PC (native, about 300-350 MB, or Docker Desktop) plus `DATA_SOURCE=demo` and
  `BETTER_AUTH_SECRET` in `.env`. Migrations run at boot; demo data is generated into Postgres on first boot.
  Nothing has been installed for this (ask first, per CLAUDE.md).
- On `merge-upstream`: `pnpm lint` and `pnpm typecheck` pass after `pnpm install`. `pnpm test` failures vary
  between runs on identical code (16, then 25): timeouts under load (30 s limit, runs take 24-29 min).
  The failing files were not rerun on their own.

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
