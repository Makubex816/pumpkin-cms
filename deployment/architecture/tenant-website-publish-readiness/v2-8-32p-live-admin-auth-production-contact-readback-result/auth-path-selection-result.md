# Auth Path Selection Result

Selected auth path: none.

Saved JWT path:

- File existed: yes.
- Header name present: yes.
- Header value present: yes.
- Admin readback preflight attempted: yes.
- Admin readback status: HTTP `401`.
- Saved JWT usable: no.

JWT binding path:

- Binding file existed: yes.
- Allowed app setting name present: yes, `Jwt__SecretKey`.
- Admin email/password present: yes.
- `adminJwtSecretValue` present: no.
- Binding path usable: no.

Decision:

Stop before Azure mutation, live Admin login, authenticated readback with a login token, static contact preflights, and production POST.

Exact blocker: `saved_jwt_invalid_and_admin_jwt_secret_value_missing`.

