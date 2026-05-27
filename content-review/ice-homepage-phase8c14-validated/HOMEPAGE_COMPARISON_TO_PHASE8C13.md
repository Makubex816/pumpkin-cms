# Homepage Comparison To Phase 8C.13

Compared source:

```text
content-review/ice-launch-phase8c13-approval-resolution/ice-homepage.approval-resolution.json
```

Sections added or materially changed by the proposed package:

- More image-forward homepage hero concept with winter festival imagery.
- Event-fit cards for holiday festivals, corporate events, and schools/community events.
- Setup/logistics section using portable rink setup media.
- Corporate/VIP and public-space holiday sections.
- Homepage quote form intent originally expressed as Contact Form 7.
- Proposed partner strip/banner material requiring separate business approval before final launch copy.

Sections retained from the Pumpkin launch architecture:

- Homepage route `/` and canonical `https://iceskatingrinkrentals.com/`.
- Links to `/contact` and `/service-areas`.
- Semantic design-system classes and section variants.
- Media requirement/reference objects instead of fake public URLs.
- No raw form HTML inside customHtml.
- No arbitrary Tailwind utility dependency.

Content not promoted to final live copy without approval:

- Proposed public phone and email display.
- Proposed primary-region wording.
- Proposed legal/business display name.
- Proposed partner claims and logos.

Blockers resolved by this Phase 8C.14 output:

- The homepage ZIP is now inventoried.
- Proposed homepage JSON is parsed and audited.
- CF7 intent is mapped to Pumpkin `formBlock`.
- Starter media files are audited.
- A normalized .NET-contract-shaped homepage candidate exists.

Blockers still open:

- Approved business values.
- Approved MediaAsset IDs after upload/selection.
- Human approval.
- Admin import/export preflight.
