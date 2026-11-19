# Leonida Nights — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/kavivenn-blip/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/kavivenn-blip/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline web app that guides you to the GTA VI platinum on PS5: all 55 official trophies with their names, descriptions and grades, a cited guide for every one, a saved-progress tracker, filters, a spoiler setting, a Next Up planner and a 5-stage roadmap to the platinum.

## What it covers

- **Tracker** — checklist of all 55 trophies (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden on PSN). Progress saves in the browser (localStorage) and exports/imports as JSON.
- **Filters** — by kind (story, missable, collectibles, activities, hidden), by grade, by free-text search, and earned-only.
- **Spoiler-safe mode** — hides the names, descriptions and guides of hidden story trophies until you earn them.
- **Next Up planner** — the next three trophies to chase, missable first, then by roadmap stage.
- **Roadmap to Platinum** — five stages from Chapters 1–2 to the free-roam 100% grind, with the save-slot warnings that matter: no mission replay, one flagged missable (Positive Mental Attitude, Chapter 1).
- **Cited guides** — every guide is written for this entry in my own words and names its source beside it. Counts are the PSN counters from PSNProfiles; how-to details come from the Output Lag trophy guide (19 Nov 2026). Where no walkthrough is verified yet the guide says so (“belum terverifikasi in-game”) instead of inventing steps.

## Sources (checked 19 Nov 2026)

- Official PS5 list: Exophase and PSNProfiles trophy pages — they agree on all 55 names, descriptions and grades.
- Hidden / visible split: 28 hidden, 27 visible.
- PSN counts: PSNProfiles 0/N counters (20 trophies carry a counter).
- Missable: only Positive Mental Attitude is reported possibly missable.

## Run it

```sh
node serve.ts   # serves app/ at http://localhost:8080
```

Or hand it in exactly as the grader does:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Fully offline: no network requests, no external fonts or images, no Rockstar logo or official artwork. Built for the [make.fun gta6-trophy-guide-01 bounty](https://make.fun/bounty/gta6-trophy-guide-01).
