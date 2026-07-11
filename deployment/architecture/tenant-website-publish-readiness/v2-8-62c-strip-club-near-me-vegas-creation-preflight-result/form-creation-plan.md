# Form Creation Plan

The source contains 57 physical form elements. Three redirect routes inherit 4, 1, and 3 target-page forms, yielding 65 effective route instances across 38 routes. The durable map has 65 rows, but its `62 physical + 3 aliases` labels do not describe the source correctly.

Future API payloads must use the live FormDefinition contract:

- `id`, `tenantId`, `siteKey`, `formKey`, name, type, version, and draft/preview status;
- source fields with normalized live types, options, required state, order, width, and summary behavior;
- top-level required consent with owner-approved text;
- top-level spam protection naming the honeypot;
- hidden `tenantId`, `pageSlug`, and `formKey` fields;
- tenant-scoped runtime submit path;
- protected endpoint/recipient references with no literal protected value; and
- preview-disabled behavior until a later form phase.

Every effective instance must additionally retain its visible labels, option labels/values, defaults, hidden source values, submit label, intended purpose, success message, reset/focus behavior, and GET/navigation or later-approved submit destination. The current 15 field-shape candidates collapse 32 stronger full-contract signatures and do not yet prove those per-instance differences.

## Effective Instance Ledger

Instance identity is `{effective route}#form-{one-based DOM order}`. Redirect rows identify the physical target source. The row counts sum to 65; no instance may be dropped during canonicalization.

| Effective route | Instance IDs | Physical source route | Full-contract variants |
| --- | --- | --- | ---: |
| `/` | `form-1` to `form-2` | `/` | 2 |
| `/24-hour-late-night-strip-clubs-las-vegas` | `form-1` to `form-4` | `/guides/24-hour-late-night-strip-clubs-las-vegas` | 2 |
| `/bachelor-party-strip-clubs-las-vegas` | `form-1` | same | 1 |
| `/best-strip-clubs-las-vegas` | `form-1` | same | 1 |
| `/clubs` | `form-1` | same | 1 |
| `/clubs/airstrip-las-vegas` | `form-1` | same | 1 |
| `/clubs/crazy-horse-3` | `form-1` | same | 1 |
| `/clubs/hustler-las-vegas` | `form-1` | same | 1 |
| `/clubs/little-darlings-las-vegas` | `form-1` | same | 1 |
| `/clubs/palomino-club-las-vegas` | `form-1` | same | 1 |
| `/clubs/peppermint-hippo-las-vegas` | `form-1` | same | 1 |
| `/clubs/sapphire-las-vegas` | `form-1` | same | 1 |
| `/clubs/scores-las-vegas` | `form-1` | same | 1 |
| `/clubs/spearmint-rhino-las-vegas` | `form-1` | same | 1 |
| `/clubs/treasures-las-vegas` | `form-1` | same | 1 |
| `/contact` | `form-1` | same | 1 |
| `/couples-strip-clubs-las-vegas` | `form-1` | same | 1 |
| `/free-limo-strip-clubs-las-vegas` | `form-1` | same | 1 |
| `/guides` | `form-1` | same | 1 |
| `/guides/24-hour-late-night-strip-clubs-las-vegas` | `form-1` to `form-4` | same | 2 |
| `/guides/bachelor-parties` | `form-1` | same | 1 |
| `/guides/bachelor-party-planning` | `form-1` | same | 1 |
| `/guides/best-strip-clubs-las-vegas` | `form-1` to `form-2` | same | 2 |
| `/guides/couples-guide-vegas` | `form-1` | same | 1 |
| `/guides/couples-night` | `form-1` | `/guides/couples-guide-vegas` | 1 |
| `/guides/dress-code` | `form-1` to `form-3` | same | 1 |
| `/guides/dress-code-what-to-expect` | `form-1` to `form-3` | `/guides/dress-code` | 1 |
| `/guides/first-time-visitor` | `form-1` to `form-3` | same | 1 |
| `/guides/free-limo-guide` | `form-1` to `form-4` | same | 3 |
| `/guides/gentlemens-club-vs-strip-club` | `form-1` to `form-3` | same | 1 |
| `/guides/how-many-strip-clubs-las-vegas` | `form-1` to `form-3` | same | 1 |
| `/guides/las-vegas-strippers-101` | `form-1` to `form-3` | same | 1 |
| `/guides/prices-deals` | `form-1` to `form-3` | same | 1 |
| `/guides/safety-etiquette` | `form-1` to `form-3` | same | 1 |
| `/guides/vip-bottle-service` | `form-1` | same | 1 |
| `/guides/what-to-expect` | `form-1` | same | 1 |
| `/las-vegas-strip-club-prices` | `form-1` | same | 1 |
| `/strip-clubs-near-the-strip` | `form-1` | same | 1 |

Owner choices required before creation:

1. Correct the 65-instance provenance and enrich every instance mapping.
2. Prove that each proposed canonical FormDefinition plus instance metadata reproduces all 32 full-contract signatures; otherwise increase the definition count.
3. Approve consent wording and privacy destination.
4. Supply a protected recipient-group reference; TenantAdmin email is not a default recipient.
5. Approve retention, notification, abuse-control, and customer-contact policy.

V2.8.62CR must not provision a submit key, mutate starter settings, submit a form, create a FormEntry, or send email. A later E2E phase must name the exact synthetic submission count and use an approved test/suppressed recipient. No FormEntry Admin readback occurred in V2.8.62C, so no FormEntry custom-header auth value was read or printed.
