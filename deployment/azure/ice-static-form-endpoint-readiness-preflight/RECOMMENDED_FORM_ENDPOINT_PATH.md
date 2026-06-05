# Recommended Form Endpoint Path

## Recommendation

Use the existing endpoint foundation and deploy/configure it later as an Ice-only hardened endpoint.

Recommended public endpoint shape:

```text
https://<approved-form-endpoint-host>/api/static-contact
```

Compatibility path if the existing Azure Function wrapper is used unchanged:

```text
https://<approved-form-endpoint-host>/api/contact
```

The frontend can use either shape through `NEXT_PUBLIC_STATIC_FORM_ENDPOINT`. The clearer production route is `/api/static-contact` because it distinguishes the static companion endpoint from the runtime Next route `/api/contact`.

## Future Execution Steps

1. Confirm whether the future route will be `/api/static-contact` or `/api/contact`.
2. If `/api/static-contact` is selected, update the Azure Function wrapper route during the separately approved endpoint execution.
3. Restrict the endpoint to Ice for the first production pass with `STATIC_FORM_ALLOWED_SITE_KEYS=ice-rink-rentals`.
4. Configure allowed origins only for approved Ice hosts.
5. Configure server-side Pumpkin API forwarding settings in endpoint app settings.
6. Run validation-only tests first.
7. Run backend save verification using approved test data.
8. Keep email notifications disabled unless separately approved.
9. Set `NEXT_PUBLIC_STATIC_FORM_ENDPOINT` for static build only after the endpoint URL is real.
10. Set `STATIC_FORM_ENDPOINT_VERIFIED=true` only after backend verification passes.

## Important Boundary

`ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT` is the CMS/page static endpoint reference currently present in Ice form blocks. It is not one of the validator endpoint URL aliases today. If it is used as an environment variable in a future pipeline, it must be mapped to `NEXT_PUBLIC_STATIC_FORM_ENDPOINT` or the validators will still fail.

