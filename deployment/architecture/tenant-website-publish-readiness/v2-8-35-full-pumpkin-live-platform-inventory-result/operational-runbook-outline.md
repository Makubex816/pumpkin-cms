# Operational Runbook Outline

## Daily / Routine Checks

- GET production `/api/static-contact-health`.
- GET production `/contact`.
- GET Pumpkin API `/health` and `/api/health`.
- Confirm no unexpected SWA or App Service outage.

## Weekly Checks

- Verify media blob access for known prefix.
- Review Cosmos account health and backup status.
- Review App Service logs and platform health.
- Review Static Web App availability.

## Before Admin Deployment

- Re-run bounded Admin API login/readback proof.
- Resolve Cosmos container naming alignment.
- Confirm `NEXT_PUBLIC_API_URL` target.
- Confirm Admin UI hosting target and access boundary.

## Before Broader CMS Writes

- Validate pages/media/themes/publish/import containers.
- Prove read paths before write paths.
- Run controlled write/readback in isolated or staging first.
- Keep static public site deploy separate from Admin validation.

## Before Cleanup

- Confirm empty fallback groups have no dependencies.
- Confirm legacy Function App receives no traffic.
- Preserve rollback evidence.
- Use explicit delete approval only.
