# Disabled Future Action Carryforward

Current disabled future actions:

- request indexing;
- redeploy production;
- submit contact check.

V2.9.11 must preserve these actions as disabled in all provider modes.

API mode may enrich the disabled action tooltips with request/correlation evidence, but it must not attach handlers that can execute indexing, deployment, contact POST, provider writes, CMS writes, Azure mutation, crawl, or outbound live checks.

Test requirement:

- keep `assertAuditJobLedgerFutureActionsReadOnly`;
- add API-mode coverage proving every future action has `disabled: true`;
- add source scan proving no Audit Jobs Admin component imports a mutation client for these actions.

