# V2.8.62DR Partial-State Carryforward

Committed baseline: `445246881fd896a4add8d7d4fc12a71c690db0cf` (`Document V2.8.62DR partial Vegas creation resume`).

V2.8.62DR left the tenant intact with one provisional TenantAdmin, one theme, 10 club records, 19 guide records, 302 MediaAssets, 473 source aliases, 32 FormDefinitions, 65 form mappings, and 17 pages. The contact create returned HTTP 400 and the run stopped without retry or rollback. Domain, import-run, and publish-run counts remained zero.

DR declared zero redirects, but the fresh DRR preflight found one exact source-supported redirect already persisted on the create-time page. It was classified as completed carryforward, not duplicated or overwritten.

Existing page slugs preserved before DRR:

- `24-hour-late-night-strip-clubs-las-vegas`
- `404`
- `advertising-disclosure`
- `bachelor-party-strip-clubs-las-vegas`
- `best-strip-clubs-las-vegas`
- `clubs`
- `clubs-airstrip-las-vegas`
- `clubs-crazy-horse-3`
- `clubs-hustler-las-vegas`
- `clubs-little-darlings-las-vegas`
- `clubs-palomino-club-las-vegas`
- `clubs-peppermint-hippo-las-vegas`
- `clubs-sapphire-las-vegas`
- `clubs-scores-las-vegas`
- `clubs-spearmint-rhino-las-vegas`
- `clubs-treasures-las-vegas`
- `home`
