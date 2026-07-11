# Source Code Behavior Adaptation Result

Uploaded JavaScript was never executed. Static analysis covered 102 script occurrences, the unique `assets/js/main.js` source, selectors, data hooks, event listeners, DOM mutations, media references, storage, forms, fetch targets, and dormant branches.

| Behavior class | Source units/hooks | Adaptation | Disposition |
| --- | ---: | --- | --- |
| `structured-data` | 37 | preserved-nonexecuting-json-ld | `preserved` |
| `tailwind-runtime` | 10 | local-compiled-tailwind-css | `safely_adapted_equivalent` |
| `mobile-menu` | 0 | trusted-adapter-menu-with-aria-escape-outside-click-and-link-close | `safely_adapted_equivalent` |
| `quiz` | 2 | trusted-adapter-result-reveal-selection-and-scroll | `safely_adapted_equivalent` |
| `form-success` | 0 | validated-local-success-state-no-post | `safely_adapted_equivalent` |
| `lead-local-storage` | 0 | no-personal-data-storage-per-owner-direction | `owner_approved_change` |
| `dynamic-club-cards` | 0 | preserve-dormant-state-static-source-cards-and-normalized-catalog | `preserved` |
| `modal-concierge` | 0 | trusted-optional-handler-preserves-dormant-state | `preserved` |
| `finder` | 0 | trusted-optional-handler-preserves-dormant-state | `preserved` |
| `lead-export-clear` | 0 | preserve-dormant-state-and-no-personal-data-store | `owner_approved_change` |
| `direct-airstrip-booking-branch` | 0 | remain-disabled | `preserved` |
| `image-error-fallback` | 30 | trusted-adapter-local-fallback-from-inert-data-attribute | `safely_adapted_equivalent` |
| `age-acknowledgement` | 0 | local-session-only-21-plus-dialog | `owner_approved_change` |

Active mobile menu, quiz, query prefill, form UI, external-navigation hold, and 30 image-error fallbacks were recreated in audited local code. Tailwind runtime usage was replaced with local compiled CSS, including page-specific shadow values. JSON-LD remained nonexecuting structured data.

Dynamic club-card, modal, finder, export, and clear helpers had no matching source hooks and remain dormant. The literal-false direct Airstrip booking branch remains disabled. Source localStorage lead persistence was replaced under explicit owner direction; no personal data was collected or retained.
