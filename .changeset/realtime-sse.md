---
"red-alert-next": minor
---

Realtime alerts are pushed over Server-Sent Events (`/api/stream`) instead of each client polling every 700 ms. One server loop polls oref once per second while clients are connected, so upstream load no longer grows with users and alerts arrive without poll delay. **Removed:** `/api/realtime` (use `/api/stream`; `?mock=1` still works for testing).
