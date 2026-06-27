# Mocked Pumpkin API Persistence Test Result

Local command:

```powershell
cd deployment/static-azure/forms/static-form-endpoint-compat
npm test
```

Result: passed.

New mocked coverage:

- Dry-run/no-email mode does not call Pumpkin API persistence.
- Pumpkin API mode forwards to `https://pumpkin-api.local.test/api/forms/ice-rink-rentals/entries` using mocked fetch.
- Forwarded payload includes the expected Ice tenant, form, source, routing refs, status, and tags.
- The response uses the Pumpkin API returned entry ID when available.
- Missing base URL fails before fetch.
- Missing protected key fails before fetch.
- Mismatched Ice form ID fails validation before fetch.

No real network write occurred.

