# CMS Preview Validators

Validate after an approved CMS preview import:

- imported tenant/site records match package scope
- page count and slugs match approved routes
- no forbidden routes imported
- draft/preview status is clear
- media and form references resolve
- theme navigation uses approved routes
- no unrelated tenant content appears
- readback snapshot is captured without secrets

CMS preview validators may read CMS state only under the approved gate. They must not mutate without separate approval.

