# Development

Use Node.js 24+ and `npm ci`. Run `npm test` and `npm run build` before committing. Run the relevant audit when changing economy, AI or combat. Browser QA can use `http://127.0.0.1:5174/?test-run=1` to preserve a regular match.

Keep commits focused on one coherent behavior, include its necessary tests, and explain the player-visible result. Avoid bundling unrelated balance, UI and asset changes. A combat rule change should update the ruleset and replay validation. An economy change should cover breakpoint and settlement behavior. For drag interactions, check board and bench units, previews, cancellation, actual refunds and equipment returns.

The repository excludes dependencies, build output, screenshots and local audit reports in `artifacts/`, environment files and logs. Approved documentation images live in `docs/images/`. Do not commit credentials, browser saves or machine-specific paths. Sprite credits must stay with redistributed artwork.

Audit commands create their ignored `artifacts/` directory automatically. Keep generated output outside the tracked source tree. The original development folder had no Git history; the initial commits import coherent implementation layers rather than claiming historical development dates.
