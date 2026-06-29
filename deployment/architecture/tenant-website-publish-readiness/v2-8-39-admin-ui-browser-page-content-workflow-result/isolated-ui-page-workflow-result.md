# Isolated UI Page Workflow Result

Synthetic page:

`pumpkin-ui-proof-v2-8-39-admin-ui-browser-proof-20260629203906-e77382`

Create:

- UI create attempts: 1.
- UI create status: HTTP 201.
- Created title: `Pumpkin V2.8.39 Admin UI Browser Proof e77382`.
- Created draft state: `isPublished=false`.
- Created sitemap state: `includeInSitemap=false`.

Update:

- UI update attempts: 1.
- UI update status: HTTP 200.
- Updated title: `Pumpkin V2.8.39 Admin UI Browser Proof Updated e77382`.
- Updated version by readback: 2.

UI revert:

- UI rollback button became enabled after update.
- UI rollback click did not produce the expected rollback request within the proof timeout.
- Classification: `admin_ui_rollback_click_no_request_observed`.

Fallback:

- One Admin API rollback fallback was used.
- Fallback rollback status: HTTP 200.
- Final title reverted to the original synthetic title.
- Final version: 3.

Workflow classification:

`ui_create_update_proven_revert_required_api_fallback`
