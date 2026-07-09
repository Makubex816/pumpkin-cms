# Package Compiler Result

Status: compiled and output-normalized.

Compiler output root:

`C:\Users\User\Desktop\PumpkinCMS\tenant-onboarding-intake\PartyPros\v2-8-61ob-compiled-package-proof`

Compiled package root:

`C:\Users\User\Desktop\PumpkinCMS\tenant-onboarding-intake\PartyPros\v2-8-61ob-compiled-package-proof\compiled-package`

Compiler summary:

- Tenant id: `party-pros-philadelphia`.
- Package mode: `full-template`.
- Route classifications emitted by compiler: 400.
- Analyzer-discovered source routes preserved: 398.
- Compiler-synthesized V1 baseline routes: 2.
- Expected non-dynamic GET routes: 397.
- Responsive routes: 10.
- Page JSON candidates: 4.
- Media assets: 627.
- FormDefinition candidate: `party-pros-quote-request`.
- No live mutation: true.

Output-only normalization:

The first validator replay found one compiler contract gap: `conversion/source-map.json` still had analyzer tenant label `party-pros` as a `tenantId`. The outside output was normalized to `party-pros-philadelphia`, with the analyzer label retained as non-tenant metadata. The same output-only pass added confirmed owner metadata and replaced stale source-fixture form/theme labels. No discovered route, media, or form count was dropped.

