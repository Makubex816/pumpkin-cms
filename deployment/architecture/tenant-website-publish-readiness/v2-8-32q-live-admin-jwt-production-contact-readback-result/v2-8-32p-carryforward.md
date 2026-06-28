# V2.8.32P Carryforward

V2.8.32P attempted the approved auth-resolution order:

- Saved JWT file existed and was ignored.
- Saved JWT Admin FormEntry readback returned HTTP `401`.
- Binding file existed and was ignored.
- Binding file still lacked `adminJwtSecretValue`.
- No Azure mutation occurred.
- No live Admin login occurred.
- No production POST occurred.

V2.8.32P exact blocker: `saved_jwt_invalid_and_admin_jwt_secret_value_missing`.

V2.8.32Q used a corrected binding file where `adminJwtSecretValue` was present.

