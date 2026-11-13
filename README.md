# התרעות אמת — Red Alert

Real-time Home Front Command (oref) alerts for the cities you choose. Built with Next.js (App Router).

The current version is in [`package.json`](package.json) and is shown at the bottom of the settings page. Release history is in [`CHANGELOG.md`](CHANGELOG.md).

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # history store self-check (node:test)
npm run lint
npm run build
```

Docker: `docker compose up --build`

| Env var    | Default | Purpose                                        |
| ---------- | ------- | ---------------------------------------------- |
| `DATA_DIR` | `data`  | Where `history.jsonl` is stored (Docker: volume `history` at `/app/data`) |

## How it works

- **Realtime:** `lib/realtime.ts` runs a single server-side loop that polls oref `Alerts.json` once a second, always (started from `instrumentation.ts`). It pushes alerts to browsers over Server-Sent Events at `/api/stream`, with a ping every ~5 s for the connection-lost warning.
- **History:** oref closed its history API to servers (Nov 2026), so `lib/history.ts` records every alert the realtime loop sees, one row per city, to `data/history.jsonl` (last 30 days). `/api/history` serves it from memory. Alerts that fire while the server is down are missing.

## Versioning & releases

The project follows [Semantic Versioning](https://semver.org) and manages versions with [Changesets](https://github.com/changesets/changesets).

1. **With every change**, run `npm run changeset`, pick `patch`/`minor`/`major`, and write a one-line summary. Commit the generated `.changeset/*.md` together with the change.
2. **To cut a release**, run `npm run version-packages`. This bumps `package.json` and `package-lock.json`, writes `CHANGELOG.md`, and consumes the changesets. Commit the result as `chore(release): vX.Y.Z`.
3. **After it's merged to `main`**, run `npm run release-tag && git push --follow-tags`. This creates the git tag `vX.Y.Z`.

Bump guide while below 1.0.0: `patch` for fixes, perf and dependency/security updates; `minor` for features and any removed or changed API/behaviour.
