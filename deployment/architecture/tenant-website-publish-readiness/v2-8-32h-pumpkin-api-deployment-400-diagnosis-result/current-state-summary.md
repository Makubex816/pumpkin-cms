# Current State Summary

Status: deployment 400 resolved; health gate not passed.

Selected target:

- Subscription: `ff887def-fd83-4a19-9298-13d4b1687873`
- Resource group: `rg-pumpkin-api-prod-centralus`
- Plan: `asp-pumpkin-api-prod-centralus-001`
- Web App: `app-pumpkin-api-prod-centralus-001`
- Base URL: `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net`
- Runtime metadata: `DOTNETCORE|10.0`

V2.8.32H found the V2.8.32G HTTP 400 cause: the original ZIP used Windows-style backslash paths. A corrected POSIX-entry ZIP was deployed exactly once and Azure reported `RuntimeSuccessful`.

The live app is still not ready for downstream binding because both approved health routes returned HTTP `500`.
