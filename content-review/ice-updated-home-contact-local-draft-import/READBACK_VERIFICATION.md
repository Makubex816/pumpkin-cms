# Readback Verification

Readback files:

- `homepage-readback-after-import.json`
- `contact-readback-after-import.json`

Homepage:

- Route/pageSlug: passed
- Draft/needs_review: passed
- Production/publish false: passed
- Revision or page version incremented: passed
- Rollback metadata: present
- Required MediaAsset IDs in page: failed; required MediaAsset records still exist, but readback retained shortened `assetId` values and did not retain all candidate `mediaAssetId` fields.
- Required MediaAsset records exist: passed
- Production-render fields persist: failed; readback block content did not retain candidate `sectionVariant`/media production-render metadata.

Contact:

- Route/pageSlug: passed
- Draft/needs_review: passed
- Production/publish false: passed
- Revision or page version incremented: passed
- Rollback metadata: present
- formBlock exists: yes
- formKey default-quote-request: yes
- sourcePage /contact: yes
- staticEndpointRef: yes
- leadRecipientRef: yes
- Selected mailbox: missing as explicit `selectedMailbox` field
- Public email policy form-first/under-review: no explicit `publicEmailDisplayPolicy` field persisted
- Public email hidden: yes

Change source:

- Requested custom changeSource persisted on homepage: no
- Requested custom changeSource persisted on contact: no
