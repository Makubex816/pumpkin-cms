# V2.8.61D Package Compiler Report

Status: completed.

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness.

Classification: package_compiler_source_map_to_normalized_package_no_live_mutation_no_post.

## Carryforward

V2.8.61C produced the reusable intake analyzer and the Airstrip analyzer proof at:

`C:\Users\User\Desktop\PumpkinCMS\tenant-onboarding-intake\TRUENewestTenant\v2-8-61c-intake-analysis-proof`

Carryforward facts:

- Framework: Next.js App Router, high confidence.
- Raw source routes: 25.
- Dynamic routes: 1.
- Media candidates: 13.
- Form candidates: 54.
- Rendering classification: `hybrid_next_server_required`.
- Protected config findings were filename-only; contents were not read.

## Compiler Result

Created reusable compiler:

`deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/compile-normalized-package.mjs`

Compiler replay generated outside-repo proof output:

`C:\Users\User\Desktop\PumpkinCMS\tenant-onboarding-intake\TRUENewestTenant\v2-8-61d-compiled-package-proof`

Compiled package root:

`C:\Users\User\Desktop\PumpkinCMS\tenant-onboarding-intake\TRUENewestTenant\v2-8-61d-compiled-package-proof\compiled-package`

Summary:

- Package mode: `full-template`.
- Route classifications: 27.
- Expected routes: 26.
- Responsive routes: 12.
- Page candidates: 8.
- Media manifest assets: 13.
- FormDefinition candidate: `airstrip-reservation`.
- Theme/brand output: generated.
- Owner action packet: generated.

## Validator Replay

Existing V1 validator result: passed.

- Errors: 0.
- Warnings: 0.
- Required files: present.
- Secret scan hits: 0.
- Media assets: 13.
- Responsive routes: present and complete.

## Runtime No-Regression

GET-only runtime no-regression passed: 17/17 HTTP 200.

Covered Ice apex/www public pages and static contact health, Pumpkin API health, Admin UI production routes, and Airstrip production default-host routes.

## Security Boundary

No live mutation occurred. No deploy, tenant creation, record import, media upload/delete, content mutation, DomainBinding mutation, DNS/custom-domain action, indexing action, contact POST, form submission, customer-facing POST proof, storage key/listKeys, SAS generation, connection string generation, Key Vault query, package install, package build, or uploaded package script execution occurred.

No protected config contents were read or printed. The outside proof output, uploaded ZIP, tenant intake folders, `.tmp`, and generated package output were not staged.

## Reports

Result package:

`deployment/architecture/tenant-website-publish-readiness/v2-8-61d-package-compiler-result/`

Durable docs:

- `deployment/architecture/pumpkin-platform/PUMPKIN_PACKAGE_COMPILER_V2_8_61D.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_COMPILED_PACKAGE_PROOF_V2_8_61D.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_PACKAGE_COMPILER_OPERATOR_ACTION_PACKET_V2_8_61D.md`

Next approval is folded into:

`deployment/architecture/tenant-website-publish-readiness/v2-8-61d-package-compiler-result/next-phase-prompt.md`
