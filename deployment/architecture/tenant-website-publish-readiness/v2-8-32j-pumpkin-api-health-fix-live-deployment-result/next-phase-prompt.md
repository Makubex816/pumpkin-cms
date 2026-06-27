# Next Phase Prompt

Approve V2.8.32K only:

Prepare and execute the next provider/app-setting binding gate for the live Pumpkin API now that health is passing.

Canonical API URL:

`https://app-pumpkin-api-prod-centralus-001.azurewebsites.net`

Approved only if explicitly confirmed in the next task:

- Identify the exact provider/contact settings required for the next gate.
- Bind only explicitly approved settings.
- Do not print, export, or document secret values.
- Verify only approved health/readiness checks.

Hard stops unless separately approved:

- No contact POST.
- No FormEntry write/read validation.
- No Admin live API readback.
- No DNS/custom-domain mutation.
- No Search Console/indexing.
- No Key Vault secret query unless explicitly approved.
- No keys/listKeys.
- No connection string or SAS generation.
- No deployment token reset/list/print/export/use.
- No arbitrary outbound checks.

Contact POST validation should remain a later, separate approval after provider binding succeeds.
