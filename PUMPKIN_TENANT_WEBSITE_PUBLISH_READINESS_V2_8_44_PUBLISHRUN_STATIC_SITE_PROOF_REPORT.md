# V2.8.44 PublishRun Static Site Proof Report

Status: `succeeded`.
Classification: `publishrun_static_site_integration_proved`.
Tenant: `ice-rink-rentals`.
Trace: `v2-8-44-publish-20260630003547-ef4cda80`.

V2.8.44 is closed successfully. The live proof created a synthetic noindex page, built and deployed it to the isolated Static Web App, confirmed the proof route returned HTTP 200 with the trace, created and read back a PublishRun record, deleted the proof page, deployed an isolated cleanup artifact, verified the proof route was absent, then deployed a production clean artifact.

Key results:

- PublishRun create/readback: HTTP 201/HTTP 200, status `ready_for_manual_upload`.
- Isolated proof runtime: HTTP 200, trace present=true.
- Proof cleanup Admin readback: HTTP 404.
- Isolated cleanup proof route: HTTP 404, trace present=false.
- Production clean runtime: `/`, `/contact`, `/service-areas`, and `/api/static-contact-health` returned HTTP 200 on the apex host; `www /` returned HTTP 200.
- Production proof route: HTTP 404, trace present=false.
- Deploy counts: isolated proof 1, isolated cleanup 1, production clean 1, Pumpkin API 0.

Security boundaries held: no contact POST, no appsettings mutation/list/show, no direct Cosmos mutation, no storage keys/listKeys/SAS, no Key Vault secret reads, no DNS/indexing work, no Theme/FormDefinition/FormEntry/MediaAsset/Tenant mutation, and no secret values written or printed.

Result package: `deployment/architecture/tenant-website-publish-readiness/v2-8-44-publishrun-static-site-proof-result/`.
