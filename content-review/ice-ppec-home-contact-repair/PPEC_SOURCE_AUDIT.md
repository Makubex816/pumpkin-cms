# PPEC Source Audit

Search pattern:

`Party Pros East Coast|PPEC|Party Pros|party rental equipment|additional rental items|event rental equipment|partner|partnership`

Requested source root status:

- Missing locally: `content-review/ice-updated-home-contact-input/`
- Existing and audited: `content-review/ice-updated-home-contact-validated/`
- Existing and audited: `content-review/ice-updated-home-contact-local-draft-import/`
- Existing and audited: `content-review/ice-updated-home-contact-post-repair-reimport/`
- Existing and audited: `content-review/ice-homepage-phase8n-crm-scaffold-validated/`
- Existing and audited: `content-review/ice-homepage-phase8n-local-draft-overwrite/`

Detailed hit list:

- Full raw hit list is in `ppec-rg-hits.txt`.
- Raw hit line count, excluding header lines: 171.

Key customer-facing PPEC hits:

| File | Page target | Format | Customer-facing | Included in normalized candidate | Imported/read back | Rendered |
| --- | --- | --- | --- | --- | --- | --- |
| `content-review/ice-updated-home-contact-validated/UPDATED_HOMEPAGE_NORMALIZED_CANDIDATE.json:647` | homepage | JSON | yes, PrimaryCTA description | yes | yes, later readbacks contain same copy | not present in raw terminal preview HTML; draft preview requires JWT client load |
| `content-review/ice-updated-home-contact-validated/UPDATED_HOMEPAGE_NORMALIZED_CANDIDATE.json:648` | homepage | JSON | yes, CTA text | yes | yes | not present in raw terminal preview HTML |
| `content-review/ice-updated-home-contact-validated/UPDATED_CONTACT_NORMALIZED_CANDIDATE.json:618-620` | contact | JSON | yes, PrimaryCTA title/copy/CTA | yes | yes | public /contact raw HTML does not show draft content |
| `content-review/ice-updated-home-contact-validated/UPDATED_CONTACT_NORMALIZED_CANDIDATE.json:651-652` | contact | JSON | yes, FAQ | yes | yes | public /contact raw HTML does not show draft content |
| `content-review/ice-updated-home-contact-local-draft-import/homepage-readback-after-import.json:297-298` | homepage | JSON readback | yes | n/a | yes | not proven by terminal raw HTML |
| `content-review/ice-updated-home-contact-local-draft-import/contact-readback-after-import.json:256-289` | contact | JSON readback | yes | n/a | yes | not proven by terminal raw HTML |
| `content-review/ice-updated-home-contact-post-repair-reimport/homepage-readback-after-post-repair-import.json:960-961` | homepage | JSON readback | yes | n/a | yes | not proven by terminal raw HTML |
| `content-review/ice-updated-home-contact-post-repair-reimport/contact-readback-after-post-repair-import.json:672-712` | contact | JSON readback | yes | n/a | yes | not proven by terminal raw HTML |

Non-PPEC but relevant service-area hits:

- Older Phase 8 homepage artifacts contain generic text like `Serving event routes across the East Coast`. This remains intentionally blocked by the validator unless explicitly approved.
- PPEC reference image paths were present in package inventory only. No PPEC logo/media asset was imported or assigned in this repair.
