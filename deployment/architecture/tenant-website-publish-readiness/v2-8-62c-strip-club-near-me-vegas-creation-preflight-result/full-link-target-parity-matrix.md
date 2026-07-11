# Full Link Target Parity Matrix

## Accounting

Static detached-DOM analysis found 1,747 physical anchor/area link occurrences across 43 files and 185 distinct kind/raw-target keys. The physical kinds are 1,551 internal-relative, 153 same-page or routed anchors, and 43 external. The source contains 0 physical `mailto`, `tel`, or download anchors. A dormant JavaScript CSV-download behavior is accounted for in `source-code-behavior-adaptation.md`.

The three redirect routes expose target-page links, producing 1,797 route-effective occurrences. Thirty-nine physical Airstrip anchors become 45 effective occurrences after redirect behavior is included.

## Route Matrix

`Gaps` counts unresolved link targets or fragments in the physical file. All other occurrences have disposition `preserve_or_safely_adapt_equivalent`, except Airstrip links, which are `preserve_intentional_source_behavior`.

| Route | Physical | Effective | Internal | Anchors | External | Airstrip | Gaps |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/24-hour-late-night-strip-clubs-las-vegas` | 13 | 39 | 12 | 1 | 0 | 0 | 0 |
| `/404.html` | 30 | 30 | 29 | 1 | 0 | 0 | 0 |
| `/advertising-disclosure` | 30 | 30 | 29 | 1 | 0 | 0 | 0 |
| `/bachelor-party-strip-clubs-las-vegas` | 56 | 56 | 55 | 1 | 0 | 0 | 0 |
| `/best-strip-clubs-las-vegas` | 55 | 55 | 54 | 1 | 0 | 0 | 0 |
| `/clubs` | 62 | 62 | 61 | 1 | 0 | 0 | 0 |
| `/clubs/airstrip-las-vegas` | 57 | 57 | 46 | 10 | 1 | 1 | 0 |
| `/clubs/crazy-horse-3` | 50 | 50 | 40 | 10 | 0 | 0 | 0 |
| `/clubs/hustler-las-vegas` | 50 | 50 | 40 | 10 | 0 | 0 | 0 |
| `/clubs/little-darlings-las-vegas` | 57 | 57 | 46 | 10 | 1 | 0 | 0 |
| `/clubs/palomino-club-las-vegas` | 57 | 57 | 46 | 10 | 1 | 0 | 0 |
| `/clubs/peppermint-hippo-las-vegas` | 50 | 50 | 40 | 10 | 0 | 0 | 0 |
| `/clubs/sapphire-las-vegas` | 50 | 50 | 40 | 10 | 0 | 0 | 0 |
| `/clubs/scores-las-vegas` | 57 | 57 | 46 | 10 | 1 | 0 | 0 |
| `/clubs/spearmint-rhino-las-vegas` | 57 | 57 | 46 | 10 | 1 | 0 | 0 |
| `/clubs/treasures-las-vegas` | 50 | 50 | 40 | 10 | 0 | 0 | 0 |
| `/contact` | 30 | 30 | 29 | 1 | 0 | 0 | 0 |
| `/couples-strip-clubs-las-vegas` | 52 | 52 | 51 | 1 | 0 | 0 | 0 |
| `/editorial-policy` | 30 | 30 | 29 | 1 | 0 | 0 | 0 |
| `/free-limo-strip-clubs-las-vegas` | 54 | 54 | 53 | 1 | 0 | 0 | 0 |
| `/guides` | 102 | 102 | 100 | 2 | 0 | 0 | 0 |
| `/guides/24-hour-late-night-strip-clubs-las-vegas` | 39 | 39 | 34 | 2 | 3 | 3 | 0 |
| `/guides/bachelor-parties` | 15 | 15 | 14 | 1 | 0 | 0 | 0 |
| `/guides/bachelor-party-planning` | 15 | 15 | 14 | 1 | 0 | 0 | 0 |
| `/guides/best-strip-clubs-las-vegas` | 53 | 53 | 36 | 11 | 6 | 6 | 0 |
| `/guides/couples-guide-vegas` | 15 | 15 | 14 | 1 | 0 | 0 | 0 |
| `/guides/couples-night` | 13 | 15 | 12 | 1 | 0 | 0 | 0 |
| `/guides/dress-code` | 35 | 35 | 31 | 1 | 3 | 3 | 0 |
| `/guides/dress-code-what-to-expect` | 13 | 35 | 12 | 1 | 0 | 0 | 0 |
| `/guides/first-time-visitor` | 33 | 33 | 27 | 1 | 5 | 5 | 0 |
| `/guides/free-limo-guide` | 38 | 38 | 31 | 2 | 5 | 5 | 0 |
| `/guides/gentlemens-club-vs-strip-club` | 36 | 36 | 31 | 2 | 3 | 3 | 0 |
| `/guides/how-many-strip-clubs-las-vegas` | 37 | 37 | 30 | 2 | 5 | 5 | 0 |
| `/guides/las-vegas-strippers-101` | 34 | 34 | 29 | 1 | 4 | 4 | 0 |
| `/guides/prices-deals` | 35 | 35 | 30 | 2 | 3 | 3 | 0 |
| `/guides/safety-etiquette` | 32 | 32 | 30 | 1 | 1 | 1 | 0 |
| `/guides/strip-club-scams-avoid-vegas-taxis-uber` | 13 | 13 | 12 | 1 | 0 | 0 | 1 |
| `/guides/vip-bottle-service` | 19 | 19 | 17 | 2 | 0 | 0 | 1 |
| `/guides/vip-rooms` | 16 | 16 | 15 | 1 | 0 | 0 | 0 |
| `/guides/what-to-expect` | 15 | 15 | 14 | 1 | 0 | 0 | 0 |
| `/` | 85 | 85 | 81 | 4 | 0 | 0 | 0 |
| `/las-vegas-strip-club-prices` | 55 | 55 | 54 | 1 | 0 | 0 | 0 |
| `/strip-clubs-near-the-strip` | 52 | 52 | 51 | 1 | 0 | 0 | 0 |

## External Targets

| Target | Physical occurrences | Source intent | Disposition |
| --- | ---: | --- | --- |
| `https://www.airstriplasvegas.com/packages` | 39 physical / 45 effective | package booking/package CTA across 11 physical pages | preserve; no probe; browser proof pending |
| `https://littledarlingsvegas.com/vip-packages` | 1 | labeled venue package reference | preserve with safe external-link behavior |
| `https://palominolv.com/packages/` | 1 | labeled venue package reference | preserve with safe external-link behavior |
| `https://scoreslv.com/vip-party-packages/` | 1 | labeled venue package reference | preserve with safe external-link behavior |
| `https://spearmintrhinolv.com/vip-packages/` | 1 | labeled venue package reference | preserve with safe external-link behavior |

## Required Repairs

| Source route | Link | Defect | Required disposition |
| --- | --- | --- | --- |
| `/guides/strip-club-scams-avoid-vegas-taxis-uber` | `#main` | skip link has no target ID | repair target and preserve skip behavior |
| `/guides/vip-bottle-service` | `#pricing` | CTA fragment has no target ID | add source-backed pricing target or owner-approved equivalent |

The earlier 45-reference broken-route report is superseded. It followed the top-level meta refresh and then resolved the target guide's `../../` references as if they came from the redirecting file. The physical redirect uses valid `../` references and points to an existing guide. Preserve both the redirect and target.

Static resolution is complete; browser link activation and anchor landing proof remain pending, so full link parity has not passed.
