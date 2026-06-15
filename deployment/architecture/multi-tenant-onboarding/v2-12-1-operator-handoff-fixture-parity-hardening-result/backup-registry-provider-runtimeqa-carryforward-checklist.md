# Backup Registry Provider Runtime QA Carryforward Checklist

Carryforward references that must remain present in handoff packets:

## Backup Center

- Ice: `backup:v2-8-17d-artifact-sha256-506c6b4c99bcabed162466c79b299f900c6070855b90cd6f38ffae37fceff899`.
- Roller: `backup:paused-candidate-no-import-placeholder`.

## Resource Registry

- Ice: `resource-registry:ice-v2-8-19`.
- Roller: `resource-registry:paused-candidate-placeholder`.

## Provider Profile

- Ice: `provider-profile:static-azure-cloudflare-worker-graph`.
- Roller: `provider-profile:paused-provider-placeholder`.

## Runtime QA

- Ice: `runtime-qa:v2-8-19-passed`.
- Ice projection signoff: `runtime-qa:v2-11-10-admin-api-projection-signoff`.
- Roller: `runtime-qa:paused-no-runtime-qa-required-until-resume`.

## Audit Jobs

- Ice/Roller governance: V2.9.12 closeout and V2.11 paused record references remain read-only carryforward evidence.
