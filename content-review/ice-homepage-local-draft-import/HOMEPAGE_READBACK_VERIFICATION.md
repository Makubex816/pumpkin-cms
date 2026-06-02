# Homepage Readback Verification

Readback performed: yes

Readback file:

```text
content-review/ice-homepage-local-draft-import/homepage-local-draft-imported-readback.json
```

Verification:

- route/pageSlug home: passed
- tenantId: passed
- draft/review workflow: passed
- production approval false: passed
- MediaAsset asset IDs present in persisted Page media fields: passed
- selected mailbox/contact policy metadata present: passed
- public email hidden: passed
- public phone empty: passed
- static eligibility conservative: passed

Persisted Page media asset IDs:

- `winterfesticerinkrentals-324b1b89777d`
- `corporateicerinkrentalevent-18e985ca59bd`
- `holidayicerink-973ce7691377`

Note: the .NET Page model stores `MediaAsset.assetId` values in `media.*.assetId`; tenant-scoped MediaAsset record ids remain in the source candidate `mediaRequirements` review metadata.
