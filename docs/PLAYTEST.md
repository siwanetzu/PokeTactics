# Pre-publication playtest — 14 October 2026

## Browser league

Played the isolated QA league in Chrome from stage 1-1 through stage 3-2: 11 fights and one shared draft, ending with the player's elimination and an eighth-place result. All seven trainer opponents were encountered. This was a functional playthrough rather than a balance or optimal-strategy claim.

Exercised shop purchases, XP and deployment limits, board/bench dragging, item assignment, interest thresholds through the five-gold cap, a draft that combined Voltorb to two stars while preserving its equipment, stage-end wild rewards, income/streak settlement and the final placement screen. Reloading the completed QA match started a fresh league.

The last-round replay reproduced its checksum in the browser. A fresh equipped battle was also replayed after the fixes, verifying the checksum again and preserving opponent damage and cast details on return.

## Bugs fixed

- Battle reports opened after a round were obscured by the result card. Arena inspection now sits above results, temporarily hides the underlying card, and clears when advancing rounds.
- Leaving a replay discarded the original battle session, leaving the opponent section of the subsequent report empty. Replay exit now restores the original completed session, fighters, effects and elapsed time.
- Unit hover HP omitted held-item health bonuses. Hover details now use the actual fighter calculation; an equipped Squirtle correctly displayed 734 HP instead of 680.

## Automated verification

- All 90 tests passed after the fixes.
- TypeScript checks and the production Vite build passed.
- The full-match audit completed 20 equipped leagues, including a first-place finish at round 30 with seed 12. Pool, gold, deployment, held-slot, exclusive-position and replay invariants passed.
- The damage audit checked 19,970 fights, with damage accounting within floating-point tolerance.

## Production preview browser check

Retried the interactive check successfully in a fresh Codex in-app browser at `http://127.0.0.1:5175/PokeTactics/?test-run=1`, using the built production assets under the same repository subpath as GitHub Pages.

- Every displayed image finished loading with nonzero natural width, including Ekans and Oddish. No broken images appeared after advancing to the next round either.
- Bought Oddish for one gold: gold fell from 18 to 17 and the Pokémon appeared on the bench.
- Selected Oddish and deployed it into Pikachu's occupied tile. Pikachu moved to Oddish's bench slot, and Grass/Poison synergies activated.
- Selected Bulbasaur and swapped it with Squirtle on the battlefield. Their rendered positions exchanged exactly, with three distinct occupied tiles preserved. This check exercised click-to-position controls.
- The opening wild battle completed with a victory, eight gold income (five base, one interest, two wild bonus), two XP and a Mana Orb reward. Health stayed at 100.
- Advancing returned to stage 1-2 preparation, with purchasing and battle controls enabled. The browser recorded no warning or error messages.

Victory screenshot: ignored `artifacts/production-preview-victory.jpg`. No game code changes were needed. Live GitHub Pages verification remains part of the scheduled publication task.

## Item interface update

Verified the new item bag in development and production previews: eligible board/bench targets highlight on selection, bench Abra receives Wise Lens, Squirtle receives Vitality Seed and displays 734 HP, Wise Lens plus Vitality Seed crafts Miracle Seed, and Oddish equips that completed item. A wild-round loss still names and adds Vitality Seed to the bag. Combat disables item controls; advancing restores them, Escape clears selection/highlights, and the in-arena help opens and closes. No browser warnings/errors were recorded. The 90 existing tests and production build passed. The physical pointer-drag test remains unverified because launching the separate browser for that check was blocked by policy. Screenshots remain in ignored `artifacts/item-bag-ui.jpg` and `artifacts/item-reward-ui.jpg`.

## Mobile layout update

Inspected the published game at a 390 × 844 viewport and found small bench targets, tiny shop text and wasted battlefield height. The update enlarges the phone battlefield, gives bench slots 46-pixel targets, makes the shop and bench horizontally scrollable, adds an item drawer and explicit tap-to-position tiles, and exposes inspection, bench transfer, selling, cancellation and synergy details through tap controls. Landscape separates the arena from team-building controls. Short screens can scroll vertically rather than clipping controls.

Checked the production preview at 360 × 640, 390 × 844, 430 × 932 and 844 × 390 browser viewport sizes. Verified purchasing, highlighted-tile deployment, bench transfer, inspection, synergy details, selecting/equipping an item with the drawer closing, and a battle ending in victory followed by normal next-round preparation. No page-wide horizontal overflow or browser warnings/errors were observed. These are browser screen-size checks and tap-style interactions, not tests on physical iOS/Android devices. The 90 tests and production build passed.

## Trusted touch gesture check

With the user's approval, exercised actual Chromium touch input through Playwright/CDP on the production preview at 390 × 844 (`isMobile` and `hasTouch` enabled), rather than mouse clicks at phone size. Confirmed native horizontal bench/shop panning without unit, inventory or gold changes; vertical reserve deployment; board-to-board dragging; item equipping; cancelled item/unit drags preserving state; and dragging back to the bench. The check starts a fresh isolated browser context and never touches personal browser saves. Browser runtime errors remained empty.

Fixed gesture arbitration before pointer capture, the global pressed-button transform shifting sprite hitboxes, item-drawer obstruction during dragging, drag-follow-up click suppression, and selection cleanup after cancellation. Item-origin gestures use `touch-action: none`; bench-origin horizontal pans remain native scrolling. Four gesture policy tests bring the suite to 94 tests. The production build and full suite passed.

Repeat locally with Google Chrome installed:

```sh
npm run build
npm run preview -- --port 5175 --base /PokeTactics/
# In a second terminal:
npm run test:touch
```

The optional check records screenshots, frame timing and state assertions under ignored `artifacts/touch-tests/`. The delivered `artifacts/mobile-touch-controls.gif` is an approximately 12-second recording of these trusted touch gestures, with a test caption and touch-position indicator. Chromium touch emulation is not physical iOS/Android hardware testing.

## Landscape-first phone play

The user's preferred phone orientation is now landscape. Portrait shows a rotate prompt, blocks game input and pauses simulation without losing progress. Landscape uses the full available height, with the battlefield left and reserves/shop right. Reserves pan vertically so sideways deployment remains a separate gesture.

The trusted-touch check now starts in portrait, verifies the prompt, rotates into 844 × 390, and runs the complete drag/swipe regression there. It also checks 667 × 375 and 932 × 430 for page overflow, rotates an active battle into portrait to confirm time is frozen, then resumes in landscape and verifies battle completion. The gesture suite includes vertical-reserve arbitration, bringing the unit suite to 95 tests. This remains Chromium emulation rather than physical-device testing.

## README clip

`docs/images/gameplay.gif` is a real browser recording of an opening wild battle: 28 frames, approximately eight seconds, 960 × 540 pixels and about 1.2 MB. It shows movement, ordinary attacks, signature effects and the round result. The GIF uses a shared palette and was visually checked across its opening, ability impacts and ending.

Raw captures and detailed audit output remain in the ignored `artifacts/` directory. These checks describe the current local prototype; they do not establish online multiplayer, hosted deployment or universal matchup balance.


## Reference-style landscape dock — 15 October 2026

Replaced the right-hand reserve/shop column with a horizontal bench above a bottom shop. Synergies stay left of the battlefield; the compact item tray remains visible at bottom left and expands for details. Health, level, gold and round information share the compact top HUD. Mobile hex sizing uses the available board height instead of leaving a large gap around the island. Desktop layout is unchanged.

The trusted-touch regression runs at 667 × 375, including horizontal bench/shop swipes, upward reserve deployment, board movement, dragging directly from the compact item tray, cancelled gestures, return to bench, purchasing, portrait pause/resume and battle completion. Layout bounds are checked at 667 × 375, 844 × 390 and 932 × 430. All 95 unit tests and the production build pass. Screenshots and the controls GIF are captured from Chromium phone emulation; physical-device validation remains outstanding.


## Mobile treasury and round header — 15 October 2026

Restored Meowth and the five interest markers in the water between the synergy rail and battlefield. The compact stack fits inside the battle surface and above the bottom item controls. Markers use the same live bank thresholds as desktop; tapping the treasury opens its existing economy explanation in the arena panel. Explicit line heights and removal of the inherited stage-label margin keep both round-header lines inside the pill.

The touch regression checks treasury visibility, all five markers and the active tier count, separation from synergies/items, and header text bounds at 667 × 375, 844 × 390 and 932 × 430. It also taps the treasury explanation and returns to the board before the existing purchase and battle-completion check. Screenshots are captured at each size.


## Desktop battle readability — 15 October 2026

Added distinct healing feedback, stacked damage lanes, named casts, ability target traces and shield bars. A compact desktop inspector supports hover/focus, right-click pinning, live vitals, current targets, equipment stats and component recipes. Live updates patch changing fields while preserving expanded role details and scroll position. Held item clicks are intercepted before board selection; keyboard activation pins inspection without triggering the battle shortcut.

All 99 tests pass, including recovery-vs-damage rendering, concurrent impact lanes, live inspection values and item recipes. The 1280 × 720 production-preview browser playtest equipped a Power Band on Squirtle, inspected its stats, completed a battle, and replayed seed 874678473 to 9.4 seconds with VERIFIED checksum. Captured real healing, skill damage, cast labels and active shields in the GIF. Tested held-badge clicks, keyboard pinning and the item recipe card; browser warnings/errors were empty. No combat rules changed.

Replay transport controls now sit in the right margin below inspection instead of crossing the battlefield. A second capture of the same replay again reached VERIFIED. Expanded role details stayed open across live refreshes; keyboard Space on Pin/Unpin left preparation unchanged. The existing trusted-touch regression also passed.


## Mixed 8v8 desktop stress test — 15 October 2026

Seed 1, sixteen 2-star Pokémon, two items per unit (32 items total). Blue: Snorlax, Blastoise, Growlithe, Venusaur, Charizard, Pikachu, Oddish, Magnemite. Red: Onix, Lapras, Arcanine, Vileplume, Raichu, Gengar, Squirtle, Bulbasaur. This is a presentation stress fixture, with no balance changes. The battle finishes after 649 ticks (10.817 seconds), red wins, checksum `2eebdd1b`, with 26 total casts. It can be launched from Battle sandbox with its current seed.

The first recorded run peaked at 36 number labels and eight cast labels, with names and numbers piled over the front line. Crowded desktop feedback now aggregates visible impacts by victim and damage/healing channel, shows event counts, places labels in free spaces, protects live vitals, and moves cast names into the left margin. Only three casts receive the heavy bloom layer at once; all basic attack paths and individual skill projectiles/impacts remain. Recovery ripples are limited to one per recipient, and hit flashes are softer. Normal smaller fights retain their existing feedback.

Final browser runs at 1280 × 720 and 1920 × 1080 both reached VERIFIED with peak 19 number labels. Every sampled frame had zero number-to-number and zero number-to-live-vitals overlaps. The full-HD check first exposed a sprite-scale cap mismatch; the corrected protected regions follow the actual capped sprite scale. Console warnings/errors were empty. Deterministic audits for seeds 1, 7 and 42 preserve every eligible damage/healing value and event count, avoid label/health-bar collisions, and match their original result checksums. The GIF records the final seed-1 battle on the production preview.


## Live desktop combat meter — 15 October 2026

Added a compact right-margin Damage/Healing meter with team toggle, ranked sprites/bars, cumulative totals, leader marker and retained knocked-out entries. Rows open the existing inspector below the meter; collapse frees inspection space. Updates patch existing rows at 5 Hz, preserving sprite animations and keyboard focus as ranks change. Uses engine health-damage/effective-healing counters directly; no battle-rule changes.

The same seed-1 8v8 fixture completed at 10.8s with VERIFIED checksum `2eebdd1b`. Captured 85 meter snapshots across damage/healing views: every displayed value and rank matched a simulation sought to the meter timestamp; raw values/totals agreed within 1e-8 (browser/Node floating-point precision). Blue damage leader: Charizard, 8,463; healing leader: Venusaur, 1,236. Opponent damage leader: Gengar, 5,205; healing leader: Vileplume, 675.

Browser checks cover team toggle, row inspection, collapse/expand (including keyboard Space without resuming combat), final totals, and rewind to 0.0s clearing all eight rows. At 1280 × 720, meter ends at y385, inspector spans y393–588, and transport begins at y612, leaving the battlefield unobstructed. Unit tests cover metric separation, team filtering, KO retention, shares/bar scaling, zero values, final report agreement and replay reset/seeking.

All 103 unit tests pass. At 1920 × 1080, meter/inspector/replay control bounds remain disjoint; the temporary viewport override was reset. The final GIF switches damage/healing during combat and clicks Venusaur’s meter row to inspect live stats. Browser warnings/errors remained empty.


## Damage taken and shielding meter — 15 October 2026

Added Taken and Shielding as two additional compact tabs, moving the team toggle into the heading. Taken uses health conservation from replay starting HP, incoming effective heals and own passive regeneration; outgoing heals and shield absorption do not inflate it. Shielding reads the existing shields-generated counter, including opening grants and positive refresh gains. Its footer shows team absorption and live remaining shields; row tooltips give individual absorption and remaining shield. No combat rules or stored replay schema changed.

All 105 tests pass. Across seeds 1, 7 and 42, Taken stays monotonic and each team's total matches the opposing team's health damage throughout the battle; tests also cover incoming/outgoing healing attribution, regeneration, injured starting HP, shield generation vs absorption, replay resets and opening grants.

The seed-1 8v8 production-preview fight again reached 10.8s VERIFIED with checksum `2eebdd1b`. All 39 captured Taken/Shielding snapshots matched simulation ranks, rounded values and raw values/totals within 1e-8. Your team's leaders: Snorlax 3,868 taken / 1,721 shields generated. Opponent leaders: Arcanine 3,902 taken; Lapras 2,635 shields generated. Rewind restores 0 Taken and 781 opening shielding for your team. Team switching, row inspection and keyboard collapse remained functional, and no browser warnings/errors occurred. At 1280 × 720 and 1920 × 1080, the meter, inspector and replay controls remain separate; the viewport override was reset.
