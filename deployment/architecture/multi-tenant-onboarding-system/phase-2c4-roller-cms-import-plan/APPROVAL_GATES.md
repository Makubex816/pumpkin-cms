# Approval Gates

Each gate requires separate explicit approval. Approval of one gate does not authorize the next.

## Gate 1: CMS Import Execution Script/Command Preparation

Allows preparing exact local commands or scripts for a future CMS import.

Does not allow CMS reads or writes.

## Gate 2: CMS Current-State Read

Allows read-only CMS inspection for Roller scope if explicitly approved.

Does not allow writes, tenant creation, import, or external systems.

## Gate 3: Roller Tenant Shell Creation

Allows creating the Roller tenant shell in CMS draft/preview scope only if explicitly approved.

Does not allow importing pages, media, forms, deployment, or live pages.

## Gate 4: Roller Package CMS Import

Allows importing the validated Roller package into CMS draft/preview scope only if explicitly approved.

Does not allow MediaAsset binary writes, deployment, email, Search Console, indexing, or live pages.

## Gate 5: CMS Readback Verification

Allows verifying CMS records after import if explicitly approved.

Does not allow external checks or publication.

## Gate 6: Static Readiness Planning

Allows planning static readiness after CMS import gates pass.

Does not approve static generation, deployment, DNS, Cloudflare, Azure, or live pages.

## Gate 7: Production Readiness Planning

Allows planning production readiness after CMS and static readiness gates.

Does not approve production deployment or live pages.

## Gate 8: Live Pages

Requires a separate future approval after every prior human and technical gate passes.

Not approved by Phase 2C-4.

## Final Search Console And Indexing Gate

Search Console, sitemap submission, URL Inspection, indexing request, and indexing monitoring are final completion tasks only and remain blocked.
