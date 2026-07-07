# Local Build Smoke Result

Status: passed.

Build workspace:

`.tmp/v2-8-60x/build-workspace/pumpkinairstrip`

Results:

- V2.8.60R overlay applied.
- V2.8.60X overlay applied.
- Temporary copied-workspace `next.config.js` adjusted for standalone output and dependency resolution only under `.tmp`.
- `npm ci`: passed with existing dependency audit/deprecation warnings.
- `npm run type-check`: passed.
- `npm run build`: passed.

Standalone artifact:

- File count: 1,923.
- Root `server.js`: present.
- `.next/static`: present.
- `public`: present.
- Protected config entries: 0.

Local route smoke:

| Route | HTTP | Airstrip text | Ice text |
| --- | ---: | --- | --- |
| `/` | 200 | true | false |
| `/request-booking` | 200 | true | false |
| `/packages` | 200 | true | false |
| `/airstrip-the-club` | 200 | true | false |
