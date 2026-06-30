# Current State Summary

Start state:

- Pumpkin API health: HTTP 200.
- Approved Admin login: HTTP 200.
- Authenticated user role: `TenantAdmin`.
- Authenticated user tenant: `ice-rink-rentals`.
- Initial Admin Page count: `0`.
- Initial Admin MediaAsset count: `0`.
- Initial Admin FormEntry readback: HTTP 200, count `4`.
- Azure Blob inventory under `ice-rink-rentals/assets/`: `9` PNG blobs.

End state:

- Page count: `3`.
- Published pages: `3`.
- Draft pages: `0`.
- MediaAsset count: `9`.
- Active Azure Blob MediaAsset records: `9`.
- Cross-tenant rows returned by final readback: `0`.
- FormEntry readback remained HTTP 200, count `4`.
