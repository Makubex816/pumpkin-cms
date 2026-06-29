# Next Phase Prompt

Approve V2.8.42A deployment packaging repair and live MediaAsset lifecycle proof only.

Scope:

- Keep the V2.8.42 MediaAsset cleanup source repair.
- Repair the Pumpkin API deployment package so ZIP entries use POSIX-style paths on Linux App Service.
- Build/test/publish/deploy Pumpkin API once after package repair.
- After deploy succeeds, verify health and Admin login.
- Prove `DELETE /api/admin/{tenantId}/media-assets/{id}` is live only through the approved MediaAsset lifecycle workflow.
- Upload exactly one new synthetic proof blob only if approved for V2.8.42A.
- Capture public HTTP HEAD/GET before cleanup.
- Create/read/update/archive/restore/delete exactly one MediaAsset proof record through Admin API routes.
- Delete exactly the proof blob and verify no residual proof blob or proof record remains.

Hard stops remain:

- No static contact deploy.
- No contact POST.
- No page/content/publish/import writes.
- No Theme/Form work.
- No appsetting mutation.
- No DNS/custom-domain or indexing mutation.
- No storage key-listing.
- No delegated signed URL.
- No direct Cosmos mutation.
- No protected config read beyond the approved secure file.
