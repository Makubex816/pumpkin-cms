# Redirect Import Result

Status: `blocked_preserved_partial_state`.

One exact source-supported redirect carried forward from V2.8.62DR:

| From | To | State |
| --- | --- | --- |
| `/24-hour-late-night-strip-clubs-las-vegas` | `/guides/24-hour-late-night-strip-clubs-las-vegas` | persisted; preserved |

Two redirects remain missing:

| From | To | Owning page | State |
| --- | --- | --- | --- |
| `/guides/couples-night` | `/guides/couples-guide-vegas` | `guides-couples-night` | missing |
| `/guides/dress-code-what-to-expect` | `/guides/dress-code` | `guides-dress-code-what-to-expect` | missing |

The first pending page update returned through the update route, but readback contained no redirect. `PageRevisionHelper.MergeRedirects` normalizes each redirect and drops it when `from == currentSlug` at lines 226-233. The attempted page now has revision number 2, zero redirects, no revision snapshot, and unchanged held content. The second pending redirect was not attempted.

The runner's in-process `redirectsAdded: 1` counter represented the attempted update, not persisted state. Fresh readback is authoritative: 1 / 3 total redirects, and 0 redirects persisted by DRR. No retry, direct data write, API change, deploy, delete, recreate, or rollback followed.
