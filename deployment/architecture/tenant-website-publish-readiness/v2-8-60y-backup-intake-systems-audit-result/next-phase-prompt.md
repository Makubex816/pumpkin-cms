# Next Phase Prompt

Approve V2.8.60Z Backup Manager and Universal Package Compiler Contract Implementation Planning only.

Use V2.8.60Y as the source of truth. Do not mutate live Azure resources, Cosmos records, Bluehost DNS, DNS records, appsettings, tenants, users, pages, media, forms, themes, DomainBinding records, or production hosting. Do not deploy. Do not submit forms or contact POSTs. Do not upload/delete media. Do not run indexing or search-owner actions. Do not read or print protected secret values. Do not stage `.tmp`, secure hardcopies, visual-review artifacts, backup bundles, tenant intake packages, or use `git add -A`.

Approved scope:

- Design `BackupRequest`, `BackupRun`, and `BackupArtifact` models.
- Design SuperAdmin-only Backup Manager API/UI contract with disabled execution until later approval.
- Refresh backup package spec to include DomainBinding, original package, normalized package, overlays, runtime artifacts, resource bindings, checksum manifest, restore runbook, and missing-secret report.
- Design Universal Package Compiler manifest, source inventory, framework detection, route/media/form/theme extraction, owner action packet, and output contract.
- Use Airstrip as the first benchmark fixture.
- Produce implementation-ready source file map and tests plan.

Not approved:

- live backup execution;
- tenant creation;
- source package mutation;
- deploy;
- appsetting changes;
- DNS/custom-domain/indexing;
- contact/form submission;
- media/content mutation;
- secret reading;
- backup bundle or tenant package staging.
