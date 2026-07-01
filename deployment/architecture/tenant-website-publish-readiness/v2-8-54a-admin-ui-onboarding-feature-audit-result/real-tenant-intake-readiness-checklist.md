# Real Tenant Intake Readiness Checklist

Use this checklist when the partner supplies the updated real tenant package.

## Package And Identity

- Partner package path is explicitly approved.
- Package is not the old secondary candidate.
- Tenant ID, display name, domains, and owner contact references are confirmed.
- Package validator passes locally.
- Package contains no credential material.

## UI And Content

- Baseline pages map to `/dashboard/pages` and import/export dry-run.
- Theme maps to `/dashboard/themes`.
- Form definitions map to `/dashboard/form-builder`.
- Media manifest maps to `/dashboard/media`, with binaries kept outside repo until upload approval.
- Leads readback maps to `/dashboard/forms`.

## External Compatibility

- Public submit aliases are preserved.
- Admin FormEntry aliases are preserved.
- Live container contract remains singular Pascal-style.
- External repo and dependent external systems are not mutated.

## Approval Gates

- Live tenant creation approval granted.
- Live record write approval granted.
- Media upload approval granted if media will be uploaded.
- Deploy approval granted if static output will be deployed.
- DNS approval granted before custom-domain changes.
- Indexing approval granted only after final publication.

Current readiness: package intake can resume only after partner package delivery and a new approval. Creation remains blocked.

