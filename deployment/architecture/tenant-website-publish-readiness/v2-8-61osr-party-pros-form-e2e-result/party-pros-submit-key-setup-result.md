# Party Pros Submit Key Setup Result

Result: not set.

Source discovery confirmed live submit requires:
- `PUMPKIN_TENANT_ID=party-pros-philadelphia`;
- `PUMPKIN_API_KEY` containing a valid Party Pros tenant API key;
- `PUMPKIN_API_URL` or `NEXT_PUBLIC_PUMPKIN_API_URL`.

Redacted appsetting readback showed:
- API URL settings are present on the starter app.
- `PUMPKIN_TENANT_ID` was not present in the filtered readback.
- `PUMPKIN_API_KEY` was not present in the filtered readback.

The secure handoff did not contain a Party Pros submit key candidate. OSR did not regenerate a tenant API key because the readback auth value was also missing and generating a key would have created a partial live state.

No submit key was printed, generated, or set.
