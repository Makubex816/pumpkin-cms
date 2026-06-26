# Isolated Contact Response Verification

Endpoint:

`https://kind-island-0a85a740f.7.azurestaticapps.net/api/static-contact`

Public-safe response summary:

- Status: 200
- Body parse OK: true
- Body keys: `entryId`, `message`, `ok`
- Body `ok`: true
- Body `message`: `Your request was submitted.`
- Entry ID present: true
- Entry ID: `ice-rink-rentals-default-quote-request-3dd6171a-62ef-48bb-9f7a-029759ac71ba`

Conclusion:

The isolated contact endpoint exists after deployment and accepts the approved synthetic POST when discovered through the v3-compatible managed API package.
