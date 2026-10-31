# התרעות אמת — Red Alert

Real-time Home Front Command (oref) alerts for the cities you choose. Built with Next.js (App Router).

The current version is in [`package.json`](package.json) and is shown at the bottom of the settings page. Release history is in [`CHANGELOG.md`](CHANGELOG.md).

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # cache self-check (node:test)
npm run lint
npm run build
```

Docker: `docker compose up --build`

| Env var      | Default                     | Purpose                         |
| ------------ | --------------------------- | ------------------------------- |
| `OREF_TOKEN` | oref's public web token     | Bearer token for history API    |

## How it works

- **Realtime:** `lib/realtime.ts` runs a single server-side loop that polls oref `Alerts.json` once a second, only while clients are connected. It pushes alerts to browsers over Server-Sent Events at `/api/stream`, with a ping every ~5 s for the connection-lost warning.
- **History:** `/api/history` fetches per city through a 1 s in-memory cache (`lib/cache.ts`) that shares in-flight requests. Only known city names are accepted, at most 30 per request.

## Versioning & releases

The project follows [Semantic Versioning](https://semver.org) and manages versions with [Changesets](https://github.com/changesets/changesets).

1. **With every change**, run `npm run changeset`, pick `patch`/`minor`/`major`, and write a one-line summary. Commit the generated `.changeset/*.md` together with the change.
2. **To cut a release**, run `npm run version-packages`. This bumps `package.json` and `package-lock.json`, writes `CHANGELOG.md`, and consumes the changesets. Commit the result as `chore(release): vX.Y.Z`.
3. **After it's merged to `main`**, run `npm run release-tag && git push --follow-tags`. This creates the git tag `vX.Y.Z`.

Bump guide while below 1.0.0: `patch` for fixes, perf and dependency/security updates; `minor` for features and any removed or changed API/behaviour.
