# Admin UI Form Inbox Proof

Result: runtime reachable, inbox entry proof blocked.

GET-only Admin UI runtime checks:

- `https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/`: 200.
- `https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/login`: 200.
- `https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/dashboard`: 200.

Admin API FormEntry readback proof was blocked because available Admin/readback credentials returned `401`.

No Admin UI write or authenticated browser artifact was created.
