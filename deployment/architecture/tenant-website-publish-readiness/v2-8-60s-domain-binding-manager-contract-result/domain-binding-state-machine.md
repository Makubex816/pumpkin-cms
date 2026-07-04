# Domain Binding State Machine

Status: design complete.

## States

- `draft`
- `pending_owner_approval`
- `pending_dns_records`
- `dns_records_applied`
- `dns_verified`
- `azure_hostname_bound`
- `tls_pending`
- `tls_ready`
- `runtime_verified`
- `live`
- `custom_domain_pending_dns_validation`
- `custom_domain_bound_tls_pending`
- `rollback_required`
- `rolled_back`
- `blocked`

## Normal Flow

1. `draft`
2. `pending_owner_approval`
3. `pending_dns_records`
4. `dns_records_applied`
5. `dns_verified`
6. `azure_hostname_bound`
7. `tls_pending`
8. `tls_ready`
9. `runtime_verified`
10. `live`

## Compatibility States

`custom_domain_pending_dns_validation` maps older planning language where DNS proof is not ready.

`custom_domain_bound_tls_pending` maps older planning language where the hostname exists but certificate readiness is asynchronous.

## Transition Rules

- Every transition must be explicit and written to audit history.
- No binding may skip DNS validation before Azure hostname binding.
- No domain may become canonical until runtime proof passes.
- DNS packet generation does not prove DNS application.
- DNS observed values must be captured separately from expected values.
- TLS readiness can remain pending after hostname binding.
- `live` requires canonical promotion approval plus runtime proof.
- `rollback_required` can be entered from any post-approval state.
- `rolled_back` must preserve the failed binding and the rollback target history.
- `blocked` requires a clear reason and next-action owner.

## State Guard Summary

`draft`:

- editable, not owner-approved.

`pending_owner_approval`:

- DNS packet may be generated for review.
- No provider mutation allowed.

`pending_dns_records`:

- owner action required for manual or Bluehost-assisted mode.

`dns_records_applied`:

- operator or owner asserts records were applied.
- system must still validate.

`dns_verified`:

- expected apex/www records observed.
- Azure hostname binding may be attempted only after this state.

`azure_hostname_bound`:

- App Service hostname binding is present.
- TLS may still be pending.

`tls_ready`:

- certificate is ready and HTTPS can be verified.

`runtime_verified`:

- apex and www GET proof passed.

`live`:

- canonical metadata promoted and proof retained.

