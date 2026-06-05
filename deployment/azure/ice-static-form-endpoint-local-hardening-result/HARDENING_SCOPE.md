# Hardening Scope

## Approved

- update `deployment/static-azure/forms/static-form-endpoint/`
- accept/map `staticEndpointRef` and `leadRecipientRef`
- preserve `domainRoutingKey` and `recipientGroup` compatibility
- validate allowed Ice routing/recipient references
- add/update local tests
- add/update docs
- prepare future deployment instructions

## Not Approved Or Performed

- endpoint deployment
- Azure resource creation
- Azure Function deployment
- production environment variable changes
- email sending
- Microsoft 365 changes
- CMS writes
- MediaAsset writes
- Cloudflare changes
- static deployment
- production deployment
- DNS changes
- protected config reads
- secret/key/token/connection string printing
- Roller work

## Work Area

Primary source package:

```text
deployment/static-azure/forms/static-form-endpoint/
```

Result package:

```text
deployment/azure/ice-static-form-endpoint-local-hardening-result/
```

