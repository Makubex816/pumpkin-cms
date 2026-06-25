# Source Media Reference Readiness

Source media reference readiness is improved but not execution-ready.

Ready after a later successful upload/readback:

- Homepage media slots.
- Shared Ice logo.
- Shared PPEC partner logo.
- Service-areas hero.

Not ready:

- Contact replacement image references, because contact replacement approval is false.
- Current app fallback public email values, because `fallback-home.ts` and `fallback-pages.ts` still contain generic `hello@{{domain}}`.

Required before source integration:

- Upload/readback must confirm public media URLs.
- Source references must use readback-confirmed Azure media URLs, not local upload-staging paths.
- Public contact email display must resolve to `contact@iceskatingrinkrentals.com`.
- Any `mailto:` link must resolve to `mailto:contact@iceskatingrinkrentals.com`.
- Contact replacement image references must remain excluded unless owner approval changes.

Source integration was not performed in V2.8.19D.
