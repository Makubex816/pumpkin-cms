# Pumpkin Airstrip Isolated Proof V2.8.59

V2.8.59 proves an isolated hybrid Airstrip preview without production cutover.

Isolated app:

- `app-airstrip-preview-isolated-centralus-001`
- `https://app-airstrip-preview-isolated-centralus-001.azurewebsites.net`

Build and deploy:

- Built from copied ignored `.tmp` workspace.
- Original package source was not modified.
- Standalone Next package was created and validated.
- Isolated deploy ran exactly once and succeeded.
- Non-secret appsettings only were configured.

Route proof:

- `/`: HTTP 200.
- `/request-booking`: HTTP 200.
- `/packages`: HTTP 200.
- `/airstrip-the-club`: HTTP 200.

Browser diagnostics:

- Console errors: 0.
- Failed requests: 0.
- Bad responses: 0.
- Missing image assets: 0.

Screenshots were saved outside the repo for owner review.
