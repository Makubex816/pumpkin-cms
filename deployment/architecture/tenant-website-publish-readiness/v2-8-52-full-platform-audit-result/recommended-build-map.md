# Recommended Build Map

## Active Map

1. V2.8.53 Controlled Secondary Tenant Creation Preflight
2. Secondary tenant creation and readback proof
3. Secondary baseline Theme/FormDefinition/Page import proof
4. Secondary media import/upload proof
5. Secondary Admin UI scoped workflow proof
6. Secondary static contact health and contact readback proof
7. Secondary PublishRun/static integration proof
8. Secondary production cutover proof
9. DNS/custom-domain gate
10. Search Console/indexing gate

## Carry Forward

- Monitoring/storage hardening preservation.
- Legacy endpoint deferred decommission.
- Custom Admin domain optional.
- App Service custom backups deferred.
- Non-contact FormEntry submit optional.

## Remove From Active Map

- Old static contact 502/500 blockers closed by V2.8.45D.
- V2.8.39 UI rollback residual closed by V2.8.39A.
- V2.8.43 page import 409 blocker closed by V2.8.43A.
- V2.8.42 MediaAsset lifecycle blocker closed by V2.8.43.
- Empty East US fallback API groups deleted by V2.8.46.
