---
"red-alert-next": patch
---

Performance: polling effects no longer restart on every render (unstable `useLocalStorage` array), unchanged history no longer re-renders the cards, history refreshes every 10 s plus right after an alert, the first load no longer waits 2 s, the font is self-hosted via `next/font`, and `framer-motion`, `@mantine/core` and `@radix-ui/react-select` were removed.
