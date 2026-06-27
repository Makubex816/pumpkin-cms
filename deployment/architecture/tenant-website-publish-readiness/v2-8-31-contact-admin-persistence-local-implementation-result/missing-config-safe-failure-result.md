# Missing Config Safe Failure Result

Mocked local tests proved safe failure before persistence:

- Missing `PUMPKIN_API_URL` in `pumpkin-api` mode returns `502`, `ok:false`, no `entryId`, and no fetch call.
- Missing selected protected API key value in `pumpkin-api` mode returns `502`, `ok:false`, no `entryId`, and no fetch call.
- Mismatched Ice form ID returns `400`, `ok:false`, validation errors, and no fetch call.

This prevents the compat endpoint from claiming Admin persistence when required binding values are absent or misaligned.

