# Homepage JSON Audit

Primary candidate file used:

```text
ice-homepage.phase8k.full.json
```

Audit result:

- JSON parse: passed.
- Most complete homepage JSON: yes.
- Raw .NET Page contract: blocked before normalization.
- Raw .NET blockers: placeholder tenant id `ICE_RINK_RENTALS_TENANT_ID`, missing `pageSlug`, and zero canonical `ContentData.ContentBlocks`.
- Raw package form behavior: WordPress Contact Form 7-oriented, not Pumpkin CMS form behavior.
- Normalization action: mapped usable content into Pumpkin Page JSON with canonical `tenantId: ice-rink-rentals`, `pageSlug: home`, `ContentData.ContentBlocks`, semantic classes, media requirements, and Pumpkin `formBlock`.
- SEO fields: present in the proposed package and carried into review metadata/SEO with unapproved region wording neutralized for the normalized candidate.
- Schema fields: present in the proposed package, treated as recommendations until legal/business and service-area values are approved.
- Media reference shape: raw package references local ZIP asset paths; normalized candidate converts those into MediaAsset requirement objects with `mediaAssetId: null`.
- Secret/protected config status: no protected config was read; final targeted scan is required before completion.

Quarantined proposed values:

- Proposed public phone and email values were detected in the source package but not applied as approved final domain-routing values.
- Proposed primary-region wording was not treated as approved primary-region wording.
- Proposed partner material was inventoried but not promoted to final required homepage copy without approval.
