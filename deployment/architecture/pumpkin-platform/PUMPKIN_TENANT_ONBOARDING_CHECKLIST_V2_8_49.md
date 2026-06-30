# Pumpkin Tenant Onboarding Checklist V2.8.49

## Approval

- [ ] Confirm tenant ID and target environment.
- [ ] Confirm write scope.
- [ ] Confirm secure handoff path and ignored status.
- [ ] Confirm DNS/indexing are explicitly approved or out of scope.

## Identity

- [ ] SuperAdmin can authenticate to production Admin UI.
- [ ] TenantAdmin users exist or are approved for creation.
- [ ] Tenant selector/current tenant displays expected tenant.

## Tenant Record

- [ ] Tenant exists with active status.
- [ ] Tenant API key metadata is present.
- [ ] Tenant partition/container routing is known.

## Pages

- [ ] Required routes exist.
- [ ] Public route GETs return HTTP 200.
- [ ] Page writes have explicit approval.

## Media

- [ ] MediaAsset API/UI workflow is proven.
- [ ] Synthetic media cleanup is available.
- [ ] Blob protection settings remain enabled.

## Themes

- [ ] Theme UI list route loads.
- [ ] Theme create works or exact gap is documented.
- [ ] Theme update works or exact gap is documented.
- [ ] Theme cleanup works or API fallback is documented.

## Forms

- [ ] Form Builder route loads.
- [ ] Standalone FormDefinition list works.
- [ ] FormDefinition create works or exact gap is documented.
- [ ] FormDefinition update works or exact gap is documented.
- [ ] Public FormDefinition read works.
- [ ] Synthetic FormDefinition cleanup works.

## Contact And Leads

- [ ] Contact health returns HTTP 200.
- [ ] Contact POST approval is explicit.
- [ ] FormEntry cleanup/readback is known before synthetic submits.

## Import/Export

- [ ] Import package target tenant is explicit.
- [ ] ImportRun readback works.
- [ ] Export output excludes secrets.

## Publish

- [ ] PublishRun proof exists.
- [ ] Static output routes are validated.
- [ ] DNS/indexing remain separate final gates.

## Monitoring

- [ ] Pumpkin API health is HTTP 200.
- [ ] Admin UI health routes are HTTP 200.
- [ ] Public static health routes are HTTP 200.
- [ ] Diagnostics/alerts remain preserved.

## Closeout

- [ ] Synthetic records are cleaned up.
- [ ] Secure file cleanup is performed after validation.
- [ ] Reports contain no secrets.
- [ ] Exact-path commit instructions are provided.
