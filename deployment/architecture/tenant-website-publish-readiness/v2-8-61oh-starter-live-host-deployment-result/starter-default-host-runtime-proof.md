# Starter Default Host Runtime Proof

Runtime proof result: passed for GET routes.

Default host:

`https://app-pumpkin-starter-preview-centralus-001.azurewebsites.net`

GET-only results:

- `/`: HTTP 200, `text/html`, contained Pumpkin starter content
- `/admin/login`: HTTP 200, `text/html`, contained Starter Admin content
- `/admin`: HTTP 307, redirected to `/admin/login`

Browser proof gap:

- Chrome headless DOM output returned empty.
- Chrome headless screenshot reporting was inconsistent: the command reported no screenshot, but a delayed temporary screenshot file appeared afterward.
- Edge headless hung and was cleaned up by terminating only the process tied to the temporary OH profile.
- Temporary browser profiles/artifacts were deleted.
- Browser screenshot output was not counted as reliable proof.

No form submission, contact POST, or customer-facing POST was performed.
