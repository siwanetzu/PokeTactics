# GitHub publication

The user authorized publishing this prepared project as a **public** personal GitHub repository named **PokeTactics**, scheduled for **14 October 2026 at 18:00 Europe/London** (17:00 UTC). The target account is `siwanetzu`; the intended URL is `https://github.com/siwanetzu/PokeTactics`.

The Codex thread automation `publish-poketactics-on-github` performs this one-time action. It must not publish early and must pause itself after verified success. The local host and scheduler need to be available at the scheduled time; a delayed run should report its actual result.

## Prepared route

Git Credential Manager provides existing GitHub HTTPS authentication. The helper uses that credential only with GitHub and never stores or prints it. Check authentication without creating or changing a repository:

```sh
npm run publish:github
```

At the authorized time, publish from the project directory:

```sh
npm run publish:github -- --publish --owner siwanetzu --not-before "2026-10-14T18:00:00+01:00"
```

The scheduled command checks the authenticated owner is `siwanetzu`. The helper requires a clean committed `main`, runs tests and the build, creates a public repository if needed, pushes the complete commit history, sets the default branch to `main` and verifies the remote HEAD and visibility. It then enables GitHub Pages with GitHub Actions and explicitly dispatches `.github/workflows/pages.yml`. It rejects unrelated origins, existing nonempty repositories with different history and private name collisions. It never force-pushes. A failed push may leave an empty repository; inspect and retry rather than creating duplicates. Repeating publication with the identical remote commit can finish Pages setup after a partial failure.

## Playable GitHub Pages deployment

The README links to **https://siwanetzu.github.io/PokeTactics/**. The Pages workflow installs locked dependencies with Node 24, runs the tests, builds the game, stamps `deployment.json` with the deployed commit and uploads only `dist/`. Every subsequent push to `main` deploys the game again. The workflow uses pinned official GitHub Actions and the `github-pages` environment, with `contents: read`, `pages: write` and `id-token: write` permissions.

Vite emits relative asset URLs, including animated sprites, so the game works beneath `/PokeTactics/` as well as locally. Preview that path before release:

```sh
npm run build
npm run preview -- --port 5175 --base /PokeTactics/
```

Open `http://127.0.0.1:5175/PokeTactics/?test-run=1` for an isolated production smoke test. Browser-local saves belong to each origin; local development progress is not uploaded.

After publication, allow a few minutes for Actions and Pages to finish. Check the hosted deployment with this read-only command:

```sh
npm run publish:github -- --owner siwanetzu --verify-pages
```

This checks a successful workflow for the exact local commit, the live commit stamp, HTML, JavaScript, CSS and all 27 animated GIF assets. A request to deploy is not proof that the site is live. The scheduled task should wait for completion, run this verification, then open the public game and smoke-test a battle before reporting success and pausing itself. If deployment fails, inspect the Actions logs and report the blocker; do not repeatedly dispatch while a deployment is still running.

Pages setup requires repository administration and Pages write access; workflow dispatch requires Actions write access (or suitable classic OAuth scopes). If the current credential cannot enable Pages, report the specific API failure and ask for the smallest account-side fix. Do not create new credentials or use a different account silently.

References: [Vite's GitHub Pages deployment guide](https://vite.dev/guide/static-deploy.html), [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), and [Pages configuration API](https://docs.github.com/en/rest/pages/pages).

Do not upload ignored `artifacts/`, dependencies, `dist/`, credentials, environment files, browser saves or reference attachments. The approved game screenshot in `docs/images/` is part of the documentation. Third-party sprite credits are in `CREDITS.md`.

If the helper cannot authenticate, create the repository or deploy Pages, report the exact blocker and distinguish repository publication from playable-site availability. Do not substitute an unrelated account or silently make a private repository public. After both repository and playable-site verification succeed, report both URLs and the exact published commit and pause the one-time automation.
