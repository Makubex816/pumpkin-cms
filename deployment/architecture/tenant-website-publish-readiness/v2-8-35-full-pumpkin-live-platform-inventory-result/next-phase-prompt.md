# Next Phase Prompt

Approve V2.8.36 Production CMS Container Alignment and Admin UI Deployment Preflight only.

Scope:

- Use the V2.8.35 inventory as source of truth.
- Reconfirm subscription `ff887def-fd83-4a19-9298-13d4b1687873`.
- Do read-only Cosmos/source comparison to decide whether the live production CMS should use singular containers (`Page`, `MediaAsset`, `PublishRun`, `ImportRun`, `Theme`) or lower/plural containers (`pages`, `mediaAssets`, `publishRuns`, `importRuns`, `themes`).
- Do not delete or overwrite any container or document.
- If live document sampling is needed, use bounded metadata/source-known IDs only and redact sensitive fields.
- Re-run bounded Admin API login/readback proof using approved secret handling without printing credentials or bearer tokens.
- Prepare exact Admin UI deployment plan for `swa-pumpkin-admin-prod-centralus-001` in `rg-pumpkin-api-prod-centralus`, bound to `NEXT_PUBLIC_API_URL=https://app-pumpkin-api-prod-centralus-001.azurewebsites.net`.
- Do not deploy Admin UI in this preflight unless a separate deploy approval is included.

Hard stops:

- No deploy without explicit deploy approval.
- No contact POST.
- No live CMS write.
- No Azure/resource/appsetting/DNS/indexing mutation unless explicitly approved.
- No protected config read.
- No secret value printed or written.
- No `.tmp` or hard-copy staging.
