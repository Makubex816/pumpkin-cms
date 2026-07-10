# Pumpkin API Deployment Substrate Cleanup V2.8.61OSE

V2.8.61OSE addressed the API deployment substrate blocker from OSD.

Findings:

- The old OSD deployment package contained Windows-style backslash ZIP entries.
- The current Kudu `/home/site/wwwroot` backup contained zero literal backslash entries.
- No malformed wwwroot entries were deleted.
- The API package was rebuilt outside the repo with forward-slash ZIP entries.

Deployment:

- App Service: `app-pumpkin-api-prod-centralus-001`
- Deployment id: `6f048653-3bc4-4dba-8cf5-f1f8fbff4386`
- Status: `RuntimeSuccessful`

Boundary:

No form submit, submit-key registration, starter mutation, DNS/TLS, Ice mutation, or Airstrip action occurred.

