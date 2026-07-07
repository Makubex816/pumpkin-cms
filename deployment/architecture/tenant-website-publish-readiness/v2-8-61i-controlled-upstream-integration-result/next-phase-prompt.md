# Next Phase Prompt

Approve V2.8.61J Existing Non-Airstrip Sandbox Starter App Proof only.

Use the completed V2.8.61I controlled upstream integration result. The starter app has been imported under `apps/starter-app/`, the active form model/package bridge builds locally, and Airstrip remains frozen.

Scope:

- Use only local runtime or an existing non-Airstrip sandbox explicitly named by the owner.
- Install starter dependencies only inside `apps/starter-app` if approved.
- Run starter type-check and build.
- If an existing non-Airstrip sandbox is approved, deploy starter app there exactly once and prove sandbox GET routes only.
- Prove embedded `/admin` remains isolated from standalone production Admin UI.
- Do not use Airstrip for proof.
- Do not create Azure resources.
- Do not mutate live Azure appsettings, DNS, custom domains, content, media, users, roles, tenants, storage, Cosmos, DomainBinding, or indexing.
- Do not run contact POST, form submission, or customer-facing POST proof unless separately approved.

Hard stop:

If the only available runtime proof target is Airstrip, stop and ask owner for a different sandbox or a changed approval.
