# V2.8.26 Through V2.8.31 Carryforward

## V2.8.26

- Production Ice Static Web App target: `swa-ice-static-staging`.
- Public `/contact` was wired to same-origin `/api/static-contact`.
- Static contact health returned an expected healthy shape during that phase.
- One approved production contact POST returned `ok: true`.
- Trace carried forward: `v2-8-26-production-contact-20260626101926`.
- Entry id carried forward: `ice-rink-rentals-default-quote-request-f9e8a6d2-3f9c-41d2-92e0-39f8ea83dbd5`.
- Admin/backend visibility remained pending.

## V2.8.27

- Operator confirmation data needed for backend visibility was not available.
- Contact persistence gate stayed open.

## V2.8.28

- Operator-provided trace and entry id matched the V2.8.26 submission.
- Admin lead/contact submissions view did not show the submission.
- Backend delivery was false from an Admin visibility perspective.

## V2.8.29

- Root cause: the static contact path accepted payloads without guaranteed `FormEntry` persistence.
- Compat/no-email/Graph-style paths could create local or delivery identifiers without creating a CMS `FormEntry`.
- Admin reads `GET /api/admin/{tenantId}/form-entries`, backed by tenant-scoped `FormEntry` storage.
- Only forwarding to Pumpkin API `POST /api/forms/{tenantId}/entries` can satisfy Admin-visible contact persistence.

## V2.8.30

- Selected route: `admin-persistence-required`.
- Public path remains `/api/static-contact`.
- Static contact must forward to Pumpkin API write route `POST /api/forms/ice-rink-rentals/entries`.
- Write requires a tenant API key.

## V2.8.31

- Local implementation completed for Pumpkin API forwarding mode.
- `PUMPKIN_API_URL` is explicitly required for Pumpkin API mode.
- Protected key selector contract: `PUMPKIN_CONTACT_PROTECTED_KEY_ENV_NAME=PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY`.
- Mocked tests proved request forwarding and returned API id handling.
- No deployment, production POST, or protected config read occurred.

## V2.8.32A rebaseline

The local adapter path is ready for a future approved runtime binding, but current Azure metadata does not show a live Pumpkin API Web App/App Service host. The next blocker is live runtime exposure and provider binding, not another local static contact code change.
