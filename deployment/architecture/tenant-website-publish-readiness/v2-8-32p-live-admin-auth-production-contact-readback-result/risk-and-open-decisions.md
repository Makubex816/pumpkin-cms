# Risk And Open Decisions

Open blocker:

`saved_jwt_invalid_and_admin_jwt_secret_value_missing`

Risk:

The contact endpoint may be ready for persistence, but V2.8.32P could not safely prove it because no authorized Admin readback path was available before POST.

Open decisions:

- Provide a fresh saved JWT that authorizes Admin FormEntry readback, or provide a corrected binding file with `adminJwtSecretValue`.
- If using binding, keep the approved setting scope limited to `Jwt__SecretKey`.
- Keep the production POST hard stop unchanged: do not send a production contact POST until authenticated Admin FormEntry readback preflight returns 2xx.

