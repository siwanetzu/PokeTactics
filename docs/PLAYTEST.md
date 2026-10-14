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

## README clip

`docs/images/gameplay.gif` is a real browser recording of an opening wild battle: 28 frames, approximately eight seconds, 960 × 540 pixels and about 1.2 MB. It shows movement, ordinary attacks, signature effects and the round result. The GIF uses a shared palette and was visually checked across its opening, ability impacts and ending.

Raw captures and detailed audit output remain in the ignored `artifacts/` directory. These checks describe the current local prototype; they do not establish online multiplayer, hosted deployment or universal matchup balance.
