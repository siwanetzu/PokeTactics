# Balance experiments

Use the sandbox from the corner menu to select teams, star levels, formations and a seed. Replaying preserves the starting configuration, even after changing the current sandbox. Pure Fire, Grass, Electric and Water squads and mixed Fire/Grass and Electric/Water presets are available.

For meaningful comparisons, hold seed, copy-equivalent gold, star levels, team size and opponent positioning fixed. Change one formation or rule at a time. A single seed is useful for visual diagnosis; use multiple seeds and both board orientations before tuning.

```sh
npm run balance
npm run audit:formations
npm run audit:mixed
npm run audit:damage
npm run audit:run
```

Reports include health damage, shields absorbed, casts, control, healing and recipients. Inspect overkill, spell timing, first-cast mana, healing cuts, shield pressure and tile reservations when a result looks surprising. Equipment can change these interactions; equal item resources do not imply equal effectiveness.

Audit files are generated in `artifacts/`. `audit:run` plays 20 equipped local leagues using a legal purchasing policy and checks shop stock, nonnegative gold, deployment limits, held-slot caps, exclusive positions and replay equality. Composition audits describe the tested presets rather than all possible boards. Current sandbox controls do not expose an item editor; item mechanics are covered by the equipment tests and league audit.
