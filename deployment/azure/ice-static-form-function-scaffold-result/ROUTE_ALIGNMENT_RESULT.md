# Route Alignment Result

Generated: 2026-06-05

## Final Route Decision

Primary deployable route:

```text
/api/static-contact
```

Azure Functions route metadata:

```text
Function name: static-contact
route: static-contact
host routePrefix: api
```

Resulting public path:

```text
/api/static-contact
```

## Compatibility Decision

No deployed `/api/contact` compatibility route was registered.

Reason:

- `/api/static-contact` is clearer for the static companion endpoint
- validators and static frontend can point directly to the public URL
- avoiding a second deployed route reduces ambiguity with the runtime Next.js `/api/contact` route

Local-only compatibility:

```text
local-test-server.mjs accepts /api/contact
```

That local compatibility exists only to keep older sample commands usable. It is not a deployed Azure Function route.

## Updated Wrapper

The existing TypeScript example now uses:

```text
route: static-contact
```

The deployable JavaScript entrypoint uses the shared adapter route constants and registers:

```text
app.http('static-contact', getStaticContactFunctionOptions(handleAzureFunctionStaticContact))
```

## Static Build Contract

Future static builds should use:

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT=https://<approved-form-endpoint-host>/api/static-contact
```

Do not set `STATIC_FORM_ENDPOINT_VERIFIED=true` until the deployed endpoint and backend behavior have passed verification under separate approval.
