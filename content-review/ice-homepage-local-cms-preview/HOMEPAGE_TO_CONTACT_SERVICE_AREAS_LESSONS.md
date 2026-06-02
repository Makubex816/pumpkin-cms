# Homepage Lessons For Contact And Service Areas

Contact and service-area pages remain on hold. These notes only capture what the homepage preview package suggests should inform future versions.

## Contact Page Inputs To Reuse Later

- Keep the default quote-request path aligned with `default-quote-request`.
- Keep public email display hidden until policy is approved.
- Reuse non-secret routing refs rather than literal mailbox or provider credentials.
- Preserve the same lead recipient/static endpoint reference style.
- Do not submit or rely on email as the lead source of truth; Pumpkin Lead Inbox remains primary for form leads.

## Service Areas Inputs To Reuse Later

- Avoid creating a targeted city/state page in this phase.
- Keep service-area wording generic until the approved primary region/service-area language is settled.
- Preserve `/service-areas` as the broad service-area route only when content is explicitly approved.
- The current local `/service-areas` route returns 404, so future work needs either CMS content or a fallback page.

## Media Lessons

- Homepage media remains the first blocker to solve before visual polish.
- Future contact/service-area pages should not invent media URLs or bind fake MediaAsset IDs.
- MediaAsset IDs must come from tenant-scoped local/admin MediaAsset creation or selection.

