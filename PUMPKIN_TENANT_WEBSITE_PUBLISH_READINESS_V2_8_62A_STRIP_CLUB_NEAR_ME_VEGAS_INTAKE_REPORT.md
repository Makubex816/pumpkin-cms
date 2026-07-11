# Pumpkin Tenant Website Publish Readiness V2.8.62A Strip Club Near Me Vegas Intake Report

## Status

`complete_read_only_intake_ready_for_local_compiler_with_gaps`

Lane: `V2.8 Tenant Website / Pumpkin Live Platform Readiness`

Classification: `new_tenant_source_package_intake_visual_dns_form_readiness_no_live_mutation`

## Source

The exact ZIP is `stripclubnearmevegas-final-menu-restored (2).zip`, 79,974,507 bytes, SHA-256 `c1612b09fa9d0e2629382957a8f943c7f43256e17b25bbb6b89eaf116e43c0f4`. Archive safety checks passed and uploaded JavaScript was not executed.

The package is compiled static HTML and is the visual source of truth. A separate visual reference is not required.

## Inventory

- 43 HTML pages;
- 10 structured venue records and 10 detail routes;
- 19 guide articles plus one guide hub;
- 473 media files totaling 39,521,491 bytes;
- 302 unique media hashes and 157 duplicate-content groups;
- 65 forms across 38 pages;
- 2,208 local references checked;
- 45 broken references isolated to one legacy route.

## Readiness Gaps

Forms use GET or browser-local storage, have no consent or honeypot, and have no backend endpoint. Media rights/content review is pending. Mixed 18+/21+ language has no age gate. One guide-count claim is inconsistent with the 19 actual guide articles. The package includes a 40-URL sitemap, 40 index/follow pages, and no robots.txt, so deployment would create premature indexing risk.

## DNS and Resources

Current public DNS uses `ns49.domaincontrol.com` and `ns50.domaincontrol.com`; apex A records are `3.33.130.190` and `15.197.148.33`, and `www` CNAMEs to the apex. No visible TXT or MX records were returned. DNS does not target Pumpkin and was not changed.

The planned model uses the shared Pumpkin API, Cosmos, starter host, Admin UI, and media account with container `strip-club-near-me-vegas-media`. No resource was created.

## Compliance and Safety

The source is an adult/nightlife directory and guide. Age notices are present, but owner/legal, media, commercial-claim, outbound-link, privacy, and indexing decisions remain required. No prohibited-service or graphic-text risk term was found by the neutral scan; source media remains unreviewed and uncertified.

Runtime no-regression passed 39/39 GET routes with Airstrip excluded. Tenant, TenantAdmin, CMS, storage, deploy, DNS/TLS, form, Party Pros, Ice, Admin, API, and Airstrip mutations were all zero.

Detailed evidence is under `deployment/architecture/tenant-website-publish-readiness/v2-8-62a-strip-club-near-me-vegas-intake-result/`.
