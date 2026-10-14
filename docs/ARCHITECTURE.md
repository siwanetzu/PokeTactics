# Architecture

The game uses TypeScript, Vite, DOM-based controls and sprites, and a Canvas 2D battlefield. There is no backend service.

| Module | Responsibility |
| --- | --- |
| `engine.ts` | Roster, units, purchases, upgrades, movement reservations, damage and combat |
| `traits.ts`, `skills.ts`, `items.ts` | Data and rules for synergies, roles, abilities and equipment |
| `battle.ts` | Seeded random stream, fixed 1/60-second simulation, records, seeking and checksums |
| `lobby.ts`, `run.ts` | Bot purchases, trainer pairings, drafts, elimination, XP and round income |
| `sandbox.ts`, `sandbox-ui.ts` | Equal-budget squads, formation editing, repeatable experiments |
| `effects.ts`, `audio.ts`, `facing.ts` | Skill visuals, generated sound and sprite mirroring |
| `sprites.ts` | Local sprite URLs, preload caching and one bounded retry |
| `battlefield.ts` | Deterministic island scenery |
| `scouting.ts`, `report.ts` | Board inspection and combat summaries |
| `main.ts` | Application state, input, HUD, shop, drag selling, persistence and animation loop |

## Combat invariants

A living fighter reserves both its current hex and in-progress destination. Pathfinding avoids reservations; movement commits only on arrival. Strikes identify attackers and victims, charge and spend mana, and resolve damage at impact. Damage statistics credit health actually lost; shield absorption and healing are tracked separately. Visual facing does not mutate simulation state.

A battle record stores its seed and complete initial fighter data, including items. Replay advances fixed ticks independently of render speed. The result checksum can be reproduced after JSON storage and seeking. The current ruleset is `poketactics-11`; older ruleset records are rejected. Change the ruleset when combat semantics change.

## Persistence

League saves use schema 5 and the browser key `poketactics-match-v1`. Schema-4 saves receive starting inventory during migration. Replays use a separate key ending in `-replays-v1`. `?test-run=1` selects isolated match and replay keys. Saves contain no online account or multiplayer state. Completed round settlement is idempotent so reloads do not pay the same round twice.

## Rendering and input

The battlefield surface supplies dimensions and coordinate transforms for drawing, sprite positions, attack effects and pointer hit testing. Arena HUD elements are excluded from placement clicks. Pointer capture keeps sprite clicks and drags attached to their unit. The shop sale overlay quotes the same `unitSaleValue` used by the transaction; only a completed drop performs a sale. Cancellation and loss of window focus clear drag previews.
