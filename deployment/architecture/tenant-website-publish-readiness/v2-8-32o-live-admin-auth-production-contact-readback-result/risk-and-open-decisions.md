# Risk And Open Decisions

Open blocker:

`secure_file_missing_required_admin_jwt_secret_value`

Risk:

The Admin readback route may be unblocked by binding `Jwt__SecretKey`, but V2.8.32O could not safely perform that mutation because the approved secure file did not contain the required value.

Open decisions:

- Provide a corrected approved secure handoff with `adminJwtSecretValue`.
- Confirm whether the next phase should also be allowed to bind source-referenced non-secret JWT values if live login reveals they are missing, without listing/showing appsettings.
- Keep the production POST hard stop unchanged: no POST until authenticated Admin FormEntry readback preflight returns 2xx.

