# Airstrip Isolated Proof Plan V2.8.59

Status: plan only, not executed.

Objective:

Prove Airstrip in an isolated environment after controlled tenant creation and before any production cutover.

Recommended proof mode:

`hybrid_parallel_proof`

Rationale:

- The normalized Pumpkin package can seed CMS content and Admin records.
- Exact uploaded rendering still requires the Next source app as-is.
- Static export is not feasible without later source refactor.

V2.8.59 proof path:

1. Confirm V2.8.58 creation readback passed.
2. Use isolated host or isolated app target only, with no production DNS.
3. Prove CMS converted pages render enough for package validation routes.
4. Prove source-rendered Next app can build and run in isolated mode if exact visual parity is required.
5. Compare route coverage for `/`, `/contact`, `/service-areas`, `/request-booking`, `/packages`, and package detail routes.
6. Verify contact/form UI wiring without submitting forms.
7. Verify media references without uploading production media unless separately approved.
8. Produce a go/no-go recommendation for V2.8.60.

No production deploy, DNS, indexing, contact POST, or form submission is included in this plan.

