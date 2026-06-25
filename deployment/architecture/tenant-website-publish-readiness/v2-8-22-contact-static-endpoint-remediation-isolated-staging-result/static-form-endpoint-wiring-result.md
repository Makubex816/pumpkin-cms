# Static Form Endpoint Wiring Result

Selected endpoint: `/api/static-contact`.

Reason:

- Static export cannot deploy the Next route at `/api/contact`.
- The existing Azure Functions scaffold registers `static-contact`.
- `host.json` sets the API route prefix to `api`.
- The deployed public path for that scaffold is `/api/static-contact`.

Local wiring result:

- `getStaticFormEndpoint()` returns `/api/static-contact` for Ice static builds when no explicit endpoint env var is present.
- `PageRenderer` already passes the static endpoint to the public contact submit handler.
- The contact artifact serialized `staticFormEndpoint: "/api/static-contact"`.
- `contact/index.txt` did not contain `/api/contact`.

Isolated live result:

- The isolated `/contact` page serialized `/api/static-contact`.
- The isolated `/api/static-contact` POST returned 404, indicating the managed API route was not live after deployment.
