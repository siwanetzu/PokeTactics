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

The scheduled command checks the authenticated owner is `siwanetzu`. The helper requires a clean committed `main`, runs tests and the build, creates a public repository if needed, pushes the complete commit history, sets the default branch to `main` and verifies the remote HEAD and visibility. It rejects unrelated origins, existing nonempty repositories with different history and private name collisions. It never force-pushes. A failed push may leave an empty repository; inspect and retry rather than creating duplicates.

Do not upload ignored `artifacts/`, dependencies, `dist/`, credentials, environment files, browser saves or reference attachments. The approved game screenshot in `docs/images/` is part of the documentation. Third-party sprite credits are in `CREDITS.md`.

If the helper cannot authenticate or create the repository, report the exact blocker and do not claim publication succeeded. Do not substitute an unrelated account or silently make a private repository public. After success, report the public URL and exact published commit and pause the one-time automation.
