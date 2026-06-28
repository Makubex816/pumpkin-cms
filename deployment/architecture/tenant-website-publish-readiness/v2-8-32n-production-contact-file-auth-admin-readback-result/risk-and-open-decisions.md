# Risk And Open Decisions

Open blocker:

`readback_auth_invalid_or_insufficient`

The auth file was present and complete, but the Admin FormEntry readback route returned HTTP `401`.

Risk:

The production contact endpoint may already be correctly wired, but V2.8.32N cannot safely prove Admin persistence because the readback route is not authorized. Sending a production contact POST without a working Admin readback route would recreate the earlier visibility gap.

Open decision:

Decide whether the next approval should provide corrected Admin readback auth, adjust the Admin readback authorization contract, or identify the expected auth mode for this production route. Any next attempt should keep the same rule: preflight Admin readback first, send at most one synthetic non-PII POST only after readback is authorized, and never disclose the auth value.

