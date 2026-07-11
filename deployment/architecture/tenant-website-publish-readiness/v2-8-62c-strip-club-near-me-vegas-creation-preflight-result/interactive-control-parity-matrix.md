# Interactive Control Parity Matrix

## Accounting

Detached-DOM analysis found 861 physical controls. Redirect-route projection produces 896 effective controls. Every physical control has an intended-action classification; browser proof has not run, so none is accepted as parity-complete.

| Intended action | Physical occurrences | Physical routes | Required adaptation |
| --- | ---: | ---: | --- |
| navigate to link target | 347 | 43 | preserve target, label, query, fragment, context, and safe external attributes |
| select form/filter value | 124 | 30 | preserve labels, options, defaults, and dependent form behavior |
| select quiz answer, reveal recommendation, scroll | 6 | 2 | reimplement the two inline quiz handlers in trusted code |
| toggle mobile navigation | 43 | 43 | preserve expanded state, outside click, Escape, link-close, and mobile CTA behavior |
| toggle native details disclosure | 284 | 26 | preserve native keyboard/disclosure semantics and content |
| validate and submit enclosing form | 57 physical / 65 effective | 35 physical / 38 effective | preserve each instance contract; safe Pumpkin submission requires later approval |

Button-styled anchors are represented in both the link and control ledgers. A pass in one ledger does not waive the other.

## Script-Described Behavior

| Behavior | Source evidence | Current disposition |
| --- | --- | --- |
| mobile menu | active hooks on all 43 physical pages; `assets/js/main.js` | safely adapt and browser-prove |
| lead form intercept | 57 physical forms; `scnmv_leads` local storage; success copy and reset | replace with approved Pumpkin form flow while preserving purpose, feedback, reset, prefill, and context |
| club query prefill | `?club=` parsing and club-field synchronization | safely adapt and browser-prove on every affected form instance |
| club finder quiz | 6 buttons and 2 active inline handlers | safely adapt and browser-prove all answer/result states |
| native FAQ disclosures | 284 `summary` controls | preserve and browser-prove grouped by equivalent template |
| dynamic club cards | `data/clubs.json` plus render code, but no `data-club-cards` mount in source HTML | blocked owner review; do not silently activate or discard |
| modal/concierge/location/finder/export/clear helpers | handler code exists, but matching source hooks are absent | blocked owner review as dormant code |
| CSV lead download | generated download code exists, but no bound source control | blocked owner review; no download behavior may be invented |
| direct Airstrip booking branch | guarded by literal `if(false && ...)` | preserve disabled state; do not enable checkout/payment behavior |

No cart, quote-cart, checkout, or payment control was found in the physical DOM. This is not approval to add one. Any newly proposed commerce behavior requires separate owner approval.

## Proof Gate

Each action must pass pointer and keyboard activation, expected state/navigation, focus and expanded state, mobile/tablet/desktop layout, and no-unexpected-POST checks. A rendered but inert occurrence fails. Current result: `static_mapping_complete_browser_interaction_parity_pending`.
