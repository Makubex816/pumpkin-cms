# Route Probe Results

Date: 2026-06-03

## Local Services

| URL | Status | Response length | Result |
| --- | ---: | ---: | --- |
| `http://localhost:5064` | 200 | 55 | Local API reachable |
| `http://localhost:3002` | 200 | 34131 | Local frontend reachable |

## Requested Routes

| URL | Purpose | Status | Response length | Expected | Manual browser review |
| --- | --- | ---: | ---: | --- | --- |
| `http://localhost:3002/__preview/ice-rink-rentals/home` | Local draft homepage preview | 200 | 28660 | Yes, client preview shell is acceptable | Required with local admin JWT |
| `http://localhost:3002/contact` | Local contact page | 200 | 48799 | Yes | Required for visual approval |
| `http://localhost:3002/service-areas` | Out-of-scope unchanged route check | 404 | n/a | Yes, unchanged/404 | No |

Notes:
- The homepage draft preview response is a client shell, not a full server-rendered draft document.
- Draft homepage judgment should use the preview route with a browser JWT session and the readback artifact marker checks.
- Public `/` was not used for draft homepage QA.

