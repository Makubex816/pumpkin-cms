# Pumpkin Strip Club Near Me Vegas Media And Form Plan V2.8.62C

## Media

Target shared account: `iceskatingmedia` in `rg-ice-production-media`.

Target container: `strip-club-near-me-vegas-media`.

Blob path strategy: `strip-club-near-me-vegas/{canonical-source-relative-path}`. Content identity is SHA-256; all 473 physical source paths remain aliases of 302 unique assets, preventing duplicate filename collisions.

| Scope | Unique hashes | Disposition |
| --- | ---: | --- |
| Dependency/source-use evidence | 152 | preserve or hash-deduplicate with every source alias retained |
| No dependency proof yet | 150 | retain as blocked candidates; do not exclude without proof or owner approval |
| All deduplicated | 302 | retained candidate universe; exact upload scope not approved |

The graph includes 532 mapped dependency edges. It found the favicon and JavaScript fallback hash missed by the first HTML-image scan, and it retains 171 redundant paths as aliases across 157 duplicate-content groups. Twelve internal-metadata references to eight absent image filenames require resolution.

Create MediaAsset metadata only after its blob exists and reads back at the expected URL/hash/size. Use Entra/RBAC only; no storage keys, listKeys, or SAS. Container creation, upload, and MediaAsset creation require a later explicit approval with one fidelity-backed exact scope count.

## Forms

The package exposes 57 physical form elements and 65 route-effective instances. Three redirect routes inherit 4, 1, and 3 forms from their targets. The compiled map has 65 rows, but its `62 physical + 3 aliases` provenance labels are inaccurate and require compiler correction.

Each API payload must map source fields into the live `FormDefinition` model and include:

- top-level required consent with owner-approved text;
- `spamProtection.honeypotFieldName` mapped to the inert honeypot;
- hidden `tenantId`, `pageSlug`, and `formKey` fields;
- tenant-scoped `formKey`, version, and runtime submit path;
- protected recipient references rather than literal recipient values; and
- draft/inactive or preview-disabled behavior until live form proof is separately approved.

The current compiler groups by 15 field-shape signatures. A stronger signature including labels, options, defaults, and submit behavior finds 32 variants, and the map does not yet prove every success/reset/navigation flow. Before creation, the compiler must preserve the full contract for all 65 instances and then justify any canonical grouping. Recipient routing is unresolved, and the default TenantAdmin email must not be used as the lead recipient by inference.

No submit key, starter setting, FormEntry, contact POST, customer inquiry, or email delivery is part of tenant creation. A later form phase must approve an exact synthetic count, suppression/test recipient, authenticated readback, tenant isolation, and no real customer contact.
