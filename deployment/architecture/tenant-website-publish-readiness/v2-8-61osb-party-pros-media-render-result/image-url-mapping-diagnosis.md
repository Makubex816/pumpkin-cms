# Image URL Mapping Diagnosis

Root cause: `fixture_and_page_media_slot_omission`.

Evidence:

- The deployed Party Pros custom-domain fixture rendered normal Party Pros content but had empty image fields.
- Backed-up Party Pros CMS page records also had empty `backgroundImage`, `mainImage`, card `image`, and nested media URL fields.
- The block view package already renders images when standard fields are populated.
- Public blob URLs are readable when addressed with the actual source-relative path under `party-pros-philadelphia/assets/img/...`.
- The local package's proposed target path shape `media/party-pros-philadelphia/...` did not match the actual uploaded blob path.

Cause classification:

| Candidate cause | Result |
| --- | --- |
| Inaccessible blob URLs | not cause |
| Next image config | not cause |
| Block renderer cannot emit images | not cause |
| CSS/background image omission | partial symptom only |
| Local/package path leakage | not observed |
| Fixture omission | cause |
| Page media slot omission | cause |

Repair approach:

- Keep source generic.
- Preserve source-relative paths in blob URLs.
- Do not flatten duplicate filenames.
- Do not mutate Party Pros CMS records.
- Use a bundle-only fixture for the live preview/runtime shell.
