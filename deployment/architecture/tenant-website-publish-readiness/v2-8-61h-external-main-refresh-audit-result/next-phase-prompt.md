# Next Phase Prompt

Approve V2.8.61I External Pumpkin API Forms Starter Integration Contract Planning only.

Use the completed V2.8.61H external-main refresh audit to build a contract-only integration plan for SDI-AI upstream main commit `565a8afd669a42224a9d15759f7060faa375d000` against the active Pumpkin branch.

Scope:

- Compare Pumpkin API route tables and DTOs.
- Compare FormDefinition/FormEntry/Theme/FormBlock model shapes.
- Map current active Admin UI form-builder, forms inbox, user, domain, backup, package intake, import execution, operator handoff, and outbound-link surfaces against upstream changes.
- Produce an implementation sequence and test plan.
- Do not merge, cherry-pick, rebase, deploy, mutate Azure, mutate DNS/custom domains, submit forms/contact, use storage keys/listKeys, generate SAS, read Key Vault, read protected config, or stage `.tmp`.

Owner decision option:

If Airstrip custom-domain cutover should resume before upstream integration, approve a separate Airstrip cutover resume prompt using the current production default host. Do not combine cutover with upstream integration.
