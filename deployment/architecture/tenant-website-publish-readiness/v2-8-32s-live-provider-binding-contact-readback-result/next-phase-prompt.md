# Next Phase Prompt

Approve V2.8.32T only: resolve the V2.8.32S `provider_binding_not_active` gate after source-discovered provider/JWT appsetting mutation succeeded and the Web App restarted, but health still reported `providerConfigured:false`.

Recommended scope:

- Review the V2.8.32S result package.
- Do not redeploy unless explicitly approved.
- Do not list/show appsettings.
- Use a new ignored secure handoff file only if protected values are needed.
- Decide whether to either:
  - run a bounded Admin login/readback probe despite the dependency-light health flag, or
  - implement/deploy a provider-aware readiness signal in a separate deployment-approved phase.
- Use returned bearer auth only in memory.
- Run authenticated Admin FormEntry readback preflight before any production contact POST.
- If readback preflight returns 2xx, submit exactly one synthetic non-PII production contact POST and read it back by entry ID or trace.

Hard stops:

- No appsettings list/show.
- No protected config read except a new approved secure file.
- No DNS/indexing.
- No inbox/provider login.
- No more than one production contact POST.
- No secret value disclosure.

