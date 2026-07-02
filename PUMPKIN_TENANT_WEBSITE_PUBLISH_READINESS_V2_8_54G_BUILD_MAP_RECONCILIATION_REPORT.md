# Pumpkin Tenant Website Publish Readiness V2.8.54G Build Map Reconciliation Report

Status: validation_passed_build_map_reconciled_no_live_mutation

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness

Classification: owner_decision_packet_build_map_reconciliation_airstrip_package_readiness_no_live_mutation

## Scope

V2.8.54G populated a no-live-mutation planning packet from the V2.8.54F resource rationalization audit, V2.8.54D owner-decision carryforward, V2.8.54A Admin UI audit, V2.8.52A backup audit, V2.8.53R/S external compatibility work, and the V2.8.54G packet's uploaded-build-plan requirements.

The separately named uploaded file `updated build plan secondary tenant.txt` was not present under the current attachment folder, `.codex`, or the workspace during this run. Its hard requirements were present in the V2.8.54G task packet and were captured as the authoritative build-plan update.

## V2.8.54F Carryforward

- Active production, isolated/staging, observability, backup, and legacy-deferred resources remain protected.
- Seven resources in `rg-pumpkincms-stg-eastus-olm` remain cleanup candidates only after dependency proof.
- Runtime no-regression from V2.8.54F was 14/14 effective GET checks after bounded recheck.
- No resource cleanup, deploy, appsetting mutation, DNS/indexing, or tenant creation is approved from V2.8.54F.

## Uploaded Build-Plan Requirements

- The next true target domain is hard-locked to `airstripclublasvegas.com`.
- The uploaded package is intended for that domain.
- The old `strip-club-near-me-vegas` candidate must not be used for live creation unless the owner explicitly reconfirms it.
- Pumpkin needs a reusable ZIP/folder onboarding workflow that can validate, map, preview, and eventually create pages, media, theme, forms, contact handling, publish settings, and users.
- Exact frontend rendering must be proven from package inspection; it cannot be assumed.
- Admin UI navigation should make `/dashboard/forms` the clear Leads/Form Entries area and avoid confusing `/dashboard/leads`.
- Identity restore, secret restore, and live restore adapter gaps are elevated before broader tenant expansion.
- Resource redundancy must be handled by dependency proof rather than blind deletion.
- Owner-decision worktree actions need populated, exact path batches.

## Airstrip Target Readiness

`airstripclublasvegas.com` is the only approved next true tenant domain for planning. No tenant was created, no DNS was touched, and no deployment was run.

The recommended raw package intake location is an ignored operator drop zone, such as `.tmp/v2-8-55-airstrip-package-intake/source/`, until the package passes public secret scan, protected-path guard, shape detection, and normalization. A future approved phase should create a redacted normalized package report and only then decide whether any package files belong in the repo.

## ZIP Frontend Rendering Feasibility

Exact rendering is feasible only if the package contains a self-contained static artifact with complete HTML, CSS, JS, assets, relative paths, and no server/runtime dependency. If the package is a Next/Vite/React source package, Pumpkin must either build it in an isolated validation phase, adopt a static artifact passthrough mode, or convert it into Pumpkin Page/Theme/FormDefinition records with expected visual drift.

The safest near-term path is: inspect package shape, run local-only rendering proof, screenshot compare, then decide between static passthrough, conversion, or hybrid.

## Owner Decision Packet

A proposed owner-decision JSON was generated at `.tmp/v2-8-54g/owner-decisions/proposed-owner-decisions.json`. It is ignored by `.gitignore` through `.tmp/`, proposal-only, and not staged.

High-confidence commit batches were populated for V2.8.54F and V2.8.54G report artifacts. Delete candidates were limited to generated-looking test output requiring owner confirmation. Source-like paths, content-review material, hardcopy/security-looking reports, and unknown-origin artifacts were deferred.

## Admin UI Cleanup

Plan: make "Forms" and "Leads/Form Entries" clear to non-technical operators. The current proven route is `/dashboard/forms`; `/dashboard/leads` should either redirect to `/dashboard/forms` or become a thin alias. Preferred first implementation is a redirect/alias plus navigation relabeling, not a broad redesign.

## Backup Gap Closure

Future phases should separately close identity restore, secret restore using secure operator hardcopy rules, and a live restore adapter with isolated restore proof before production use. No restore was run and no secrets were read in V2.8.54G.

## Resource Cleanup Dependency Plan

All V2.8.54F do-not-delete resources remain protected. The seven OLM staging resources and legacy static form endpoint require source/config/traffic/RBAC/storage proof before any decommission prompt.

## Updated Master Build Map

1. P0: Preserve live Ice/Pumpkin runtime and observability.
2. P0: Lock Airstrip as the next real tenant target and pause old package use.
3. P1: Resolve worktree owner decision batches by exact path.
4. P1: Intake and classify the Airstrip ZIP/folder package in an ignored no-mutation phase.
5. P1: Prove ZIP/frontend rendering feasibility.
6. P1: Clean Admin UI navigation around Forms and Leads/Form Entries.
7. P2: Close backup restore gaps.
8. P2: Run resource cleanup dependency proof.
9. P3: Only after the above, request controlled Airstrip tenant creation preflight.

## Security Boundary

No live mutation occurred. No deploy, tenant creation, contact POST, form submission, media upload, Azure mutation, appsetting mutation, DNS/indexing action, protected config read, owner hard-copy secret read, key/listKeys/SAS operation, external repo mutation, or staging occurred.

## Outputs

- Result package: `deployment/architecture/tenant-website-publish-readiness/v2-8-54g-build-map-reconciliation-result/`
- Durable docs under `deployment/architecture/pumpkin-platform/`
- Proposal packet: `.tmp/v2-8-54g/owner-decisions/proposed-owner-decisions.json`
