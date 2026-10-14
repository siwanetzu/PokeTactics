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
