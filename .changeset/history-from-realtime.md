---
"red-alert-next": minor
---

Fix: alert history always failed (HTTP 502) because oref retired `alerts-history.oref.org.il` and its replacement API blocks server requests. The server now records every alert from the realtime loop (one row per city, last 30 days) to `data/history.jsonl`, and `/api/history` serves it. The realtime loop now runs from server start instead of only while clients are connected. **Changed:** history begins when the server is deployed and misses alerts while it is down; Docker needs the new `history` volume at `/app/data` (set the path with `DATA_DIR`). **Removed:** the `OREF_TOKEN` env var.
