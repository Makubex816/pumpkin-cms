# V2.8.61OQ Party Pros Custom Domain Report

Phase status: partial success, TLS carryforward required.

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness.

Classification: `party_pros_custom_domain_binding_host_routing_tls_no_form_post_no_airstrip`.

Summary:

- OP carryforward was verified at commit `570f68e1`.
- Public DNS prerequisites remained propagated across Cloudflare, Google, and Quad9.
- Generic starter host routing was implemented and deployed once.
- Party Pros custom hostnames were bound to `app-pumpkin-starter-preview-centralus-001`.
- HTTP custom-domain routes render Party Pros content for apex and `www`.
- Forms render disabled/no-post.
- Managed TLS did not bind; HTTPS custom-domain proof is held.
- Non-Airstrip runtime no-regression passed.

Key results:

| Area | Result |
| --- | --- |
| Starter redeploy | passed, deployment id `b15e7fae-e4b7-4853-a3b5-e9b474a09d89` |
| `partyrentalphiladelphia.com` binding | passed |
| `www.partyrentalphiladelphia.com` binding | passed |
| Managed TLS | not bound, `sslState=Disabled` |
| HTTPS-only | not enabled |
| Custom HTTP runtime | passed |
| Form no-POST | passed |
| Runtime no-regression | passed |
| Airstrip | untouched |
| Registrar DNS | untouched |

Files:

- `deployment/architecture/tenant-website-publish-readiness/v2-8-61oq-party-pros-custom-domain-result/`
- `deployment/architecture/pumpkin-platform/PUMPKIN_PARTY_PROS_CUSTOM_DOMAIN_BINDING_V2_8_61OQ.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_PARTY_PROS_HOST_ROUTING_V2_8_61OQ.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_PARTY_PROS_TLS_RUNTIME_PROOF_V2_8_61OQ.md`

Exact-path commit instructions:

```powershell
git add -- apps/starter-app/src/lib/host-tenant-routing.ts `
  apps/starter-app/src/lib/preview-fixtures.ts `
  'apps/starter-app/src/app/(site)/layout.tsx' `
  'apps/starter-app/src/app/(site)/page.tsx' `
  'apps/starter-app/src/app/(site)/[...slug]/page.tsx' `
  PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_61OQ_PARTY_PROS_CUSTOM_DOMAIN_REPORT.md `
  deployment/architecture/tenant-website-publish-readiness/v2-8-61oq-party-pros-custom-domain-result `
  deployment/architecture/pumpkin-platform/PUMPKIN_PARTY_PROS_CUSTOM_DOMAIN_BINDING_V2_8_61OQ.md `
  deployment/architecture/pumpkin-platform/PUMPKIN_PARTY_PROS_HOST_ROUTING_V2_8_61OQ.md `
  deployment/architecture/pumpkin-platform/PUMPKIN_PARTY_PROS_TLS_RUNTIME_PROOF_V2_8_61OQ.md
git commit -m "Add V2.8.61OQ Party Pros custom domain proof"
```
