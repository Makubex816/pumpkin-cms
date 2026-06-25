# Risk And Open Decisions

Risks:

- Owner visual/content review has not happened yet.
- The three contact AI images are existing Azure assets, but they still require owner visual approval.
- The PPEC partner treatment requires owner approval.
- The service-area route intentionally avoids city-specific claims until market coverage is approved.
- Production-bound deployment remains blocked.
- A plain local `npm run build` completed successfully but printed the standard Next.js environment banner for `.env.local`; the protected-config-safe static evidence is the sanitized build run, which copied no protected config and reported no protected config references in output.

Open decisions:

- Whether the recovered AI contact images are acceptable for isolated staging preview.
- Whether additional city/region pages should be rebuilt later after coverage approval.
- Whether contact-form backend routing should be changed in a later approved phase.
- Whether image dimensions should be enriched from owner-approved metadata in a later phase.

No open decision blocks local source integration. Owner approval blocks staging progression and production readiness.
