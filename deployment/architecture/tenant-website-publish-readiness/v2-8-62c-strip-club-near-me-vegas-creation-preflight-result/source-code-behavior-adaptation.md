# Source Code Behavior Adaptation

## Safety Result

The source code was inspected statically. Detached DOM parsing had script execution disabled and all package network requests blocked. No uploaded script, Tailwind CDN script, inline handler, or source fetch executed.

## Script Inventory

| Class | Units | Intended treatment |
| --- | ---: | --- |
| JSON-LD structured data | 37 | preserve semantics through trusted server-rendered structured data after factual review |
| Tailwind presentation configuration | 10 inline configs plus 10 external CDN references | compile/adapt styling locally; do not depend on blindly executed uploaded/CDN code |
| inline quiz behavior | 2 | reimplement in reviewed tenant-scoped code |
| `assets/js/main.js` | 1 file, 17,302 bytes | map active behavior and reimplement required parts; do not deploy source file as trusted code |

## `main.js` Behavior Map

| Behavior | Source status | Safe adaptation |
| --- | --- | --- |
| header/mobile navigation | active | trusted menu component preserving clone/close/Escape/ARIA behavior |
| club/pickup/guest/timing synchronization | active where form hooks exist | tenant form instance state with source defaults and query prefill |
| smooth scroll/focus | active through form flow | preserve target, reduced-motion/accessibility behavior, and focus order |
| form submit interception | active | later approved Pumpkin form submission; preserve intent, success copy, reset, and source metadata |
| local lead list/storage | storage key `scnmv_leads` | do not carry forward as an accidental production datastore; owner-review whether any operator-only equivalent is required |
| CSV export and clear | code present, no bound controls | dormant; owner review before preserving, removing, or exposing |
| dynamic club-card fetch/render | fetches `data/clubs.json`, no mount hook in HTML | dormant; retain evidence and decide whether static cards or trusted dynamic catalog is intended |
| modal/concierge/location/finder helpers | code present, source hooks absent | dormant; no silent activation or omission |
| image fallback | used by dormant card renderer | preserve fallback asset relationship if dynamic catalog is approved |
| direct Airstrip booking branch | literal `if(false && ...)` | remain disabled; no payment/checkout activation |

## Inline Quiz Map

The home and `/guides` pages each contain three answer buttons. Their inline code changes recommendation text, reveals the result, scrolls it into view, and marks the selected answer. All six controls require equivalent trusted behavior and browser proof. Merely rendering the recommendation panel is insufficient.

## Adaptation Gate

Before creation, the adapter must classify every dormant hook as intended, owner-approved legacy removal, or blocked. Active behavior must have source-to-Pumpkin tests and browser proof. Current result: `static_analysis_complete_trusted_adaptation_and_browser_proof_pending`.
