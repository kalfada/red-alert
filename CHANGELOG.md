# red-alert-next

## 0.3.0

### Minor Changes

- c6db5d1: Fix: alert history always failed (HTTP 502) because oref retired `alerts-history.oref.org.il` and its replacement API blocks server requests. The server now records every alert from the realtime loop (one row per city, last 30 days) to `data/history.jsonl`, and `/api/history` serves it. The realtime loop now runs from server start instead of only while clients are connected. **Changed:** history begins when the server is deployed and misses alerts while it is down; Docker needs the new `history` volume at `/app/data` (set the path with `DATA_DIR`). **Removed:** the `OREF_TOKEN` env var.

## 0.2.0

### Minor Changes

- df85d06: A city card turns red and pulses with the alert title while a realtime alert is active for that city (2 minutes), in addition to the toast.
- df85d06: The app version is shown at the bottom of the settings page.
- df85d06: History is fetched per city through a 1 s in-memory cache with in-flight coalescing, so concurrent users share upstream calls. Requests accept only known city names (max 30), oref empty-body responses are treated as "no alerts" instead of failing the whole request, and the oref token can be set via `OREF_TOKEN`.
- df85d06: Realtime alerts are pushed over Server-Sent Events (`/api/stream`) instead of each client polling every 700 ms. One server loop polls oref once per second while clients are connected, so upstream load no longer grows with users and alerts arrive without poll delay. **Removed:** `/api/realtime` (use `/api/stream`; `?mock=1` still works for testing).
- df85d06: The header shows a red "אין חיבור" warning when no successful update arrived for 12 s, covering both browser→server and server→oref failures (measured on the server clock, immune to device clock skew).

### Patch Changes

- df85d06: Performance: polling effects no longer restart on every render (unstable `useLocalStorage` array), unchanged history no longer re-renders the cards, history refreshes every 10 s plus right after an alert, the first load no longer waits 2 s, the font is self-hosted via `next/font`, and `framer-motion`, `@mantine/core` and `@radix-ui/react-select` were removed.
- df85d06: Security: upgrade Next.js 15.3.3 → 15.5.28, fixing the critical App Router RSC remote-code-execution vulnerability (CVE-2025-66478 / React CVE-2025-55182).
- df85d06: Fixes: Tab/arrow keys are no longer hijacked by the alert list, the "last update" time displays correctly in every locale, pinch-zoom is allowed, the installed-app splash screen is dark instead of white, entrance animations work (`tw-animate-css` was never imported), toasts that arrive while loading are kept, and the "select all cities" option was removed.
