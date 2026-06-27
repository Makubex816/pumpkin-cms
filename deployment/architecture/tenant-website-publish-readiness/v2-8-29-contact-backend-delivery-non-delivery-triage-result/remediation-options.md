# Remediation Options

## Option A - Admin Persistence As Source Of Truth

Make accepted production leads visible in Admin by binding `/api/static-contact` to the Pumpkin API save path:

- Set approved delivery mode to `pumpkin-api`.
- Provide the production Pumpkin API base URL to the static function.
- Provide the server-side Ice tenant API key to the static function.
- Confirm Admin reads the same Pumpkin API backend/provider.
- Run a separately approved preflight, deploy/config change, and exactly one approved POST only after approvals.

Pros: Admin inbox becomes the canonical lead store.

Cons: Requires protected app settings/provider binding and likely an Azure app setting/deploy/config phase.

## Option B - Email Notification Only

Treat production delivery as Microsoft Graph notification delivery, not Admin inbox persistence:

- Keep or enable `FORM_DELIVERY_MODE=graph`.
- Confirm mailbox receipt through operator-only provider/inbox access.
- Update gates and docs to stop expecting Admin visibility for graph-only submissions.

Pros: Lower source change if email-only is the business requirement.

Cons: Admin lead inbox will remain incomplete by design.

## Option C - Dual Delivery

Change source so accepted production leads write to Pumpkin API and send Graph email:

- Persist first, email second, or add an idempotent dual-write plan.
- Preserve the same entry ID across both actions.
- Decide response behavior if email succeeds but persistence fails, or persistence succeeds but email fails.

Pros: Admin inbox and email notification both work.

Cons: Requires source design, tests, protected config, deployment, and error-state decisions.

## Recommended Next Step

Run V2.8.30 as a remediation planning/preflight phase. It should choose Option A, B, or C using operator-provided non-secret current-mode facts and decide whether the next implementation will be source-only, protected config/provider binding, deployment, or a combined gated release.

