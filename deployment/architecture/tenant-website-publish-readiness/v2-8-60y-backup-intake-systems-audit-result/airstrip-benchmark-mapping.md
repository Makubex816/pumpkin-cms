# Airstrip Benchmark Mapping

Tenant ID: `airstrip-club-las-vegas`

Target domain: `airstripclublasvegas.com`

Production default host: `https://app-airstrip-prod-centralus-001.azurewebsites.net`

## Source Intake

Source package:

`C:\Users\User\Desktop\PumpkinCMS\tenant-onboarding-intake\TRUENewestTenant\newest upload package\pumpkinairstrip.zip`

V2.8.55 found:

- 355 ZIP file entries.
- Next.js app router source under `pumpkinairstrip/apps/airstrip-frontend`.
- 25 detected app page routes.
- 13 media assets.
- Reservation form flow.
- Theme file and dark luxury brand direction.
- Source tenant/domain mismatch requiring normalization.
- Protected config template name present; contents were not printed.

## Normalization

Normalized package:

`C:\Users\User\Desktop\PumpkinCMS\tenant-onboarding-intake\TRUENewestTenant\airstrip-pumpkin-package-v1`

V2.8.56 found:

- valid V1 full-template package;
- 0 validation errors;
- 0 validation warnings at that time;
- 13 media assets;
- 26 expected routes;
- 1 form definition;
- 1 placeholder handoff user;
- rendering mode: `hybrid-next-server-required-as-is`.

## Responsive Benchmark

V2.8.60V introduced the mandatory responsive standard and replayed Airstrip, finding `/airstrip-the-club` mobile overflow. V2.8.60R repaired that issue through a reusable overlay and proved production default-host responsive checks passed 28/28.

## Backup Benchmark Requirements

Airstrip backups must preserve:

- original ZIP reference and checksum;
- normalized package reference and checksum;
- production runtime mode;
- media blob inventory;
- form mapping for `airstrip-reservation`;
- DomainBinding pending DNS state;
- responsive overlay files and apply instructions;
- deployment IDs and runtime proof references.

