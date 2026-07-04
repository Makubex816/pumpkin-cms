# Local Build And Smoke Result

Status: passed.

Commands/results:

- `node --check deployment/airstrip/patches/v2-8-60r-mobile-responsive/apply-overlay.mjs`: passed.
- `npm ci`: passed with existing dependency audit/deprecation warnings.
- `npm run type-check`: passed.
- `npm run build`: passed.

Temporary build-only config:

- In `.tmp` only, `next.config.js` was adjusted for standalone output and local dependency resolution.
- These temp build changes were not added to the durable responsive overlay.

Local standalone route smoke:

| Route | Result | Content signal |
| --- | --- | --- |
| `/` | HTTP 200 | Airstrip true, Ice false |
| `/request-booking` | HTTP 200 | Airstrip true, Ice false |
| `/packages` | HTTP 200 | Airstrip true, Ice false |
| `/airstrip-the-club` | HTTP 200 | Airstrip true, Ice false |

Artifact validation:

- ZIP bytes: 10,152,228.
- ZIP entries: 1,923.
- Backslash ZIP entries: 0.
- Root `server.js`: present.
- `.next/static`: present.
- Public assets: present.
- Protected config entries: 0.
