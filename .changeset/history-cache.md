---
"red-alert-next": minor
---

History is fetched per city through a 1 s in-memory cache with in-flight coalescing, so concurrent users share upstream calls. Requests accept only known city names (max 30), oref empty-body responses are treated as "no alerts" instead of failing the whole request, and the oref token can be set via `OREF_TOKEN`.
