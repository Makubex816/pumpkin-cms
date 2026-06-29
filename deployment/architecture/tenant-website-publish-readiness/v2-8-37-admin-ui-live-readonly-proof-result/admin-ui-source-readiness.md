# Admin UI Source Readiness

Source path: `apps/admin`.

Result:

- Next.js Admin app source exists.
- API client uses `NEXT_PUBLIC_API_URL`, defaulting to localhost only when not configured.
- V2.8.37 build used the live Pumpkin API URL.
- Auth context is tenant-aware and stores current tenant from authenticated user/tenant list.
- Page, media, import-run, publish-run, and tenant calls pass tenant context.
- No server-only Next APIs were found in source search.

Care point:

- The Admin UI includes write-capable source paths. V2.8.37 proof did not exercise them.
