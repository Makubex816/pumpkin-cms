# Runtime HTTP Warning Carryforward

Status: carried forward.

V2.9.5 recorded local runtime HTTP warning:

`local_next_dev_server_listened_but_timed_out`

V2.9.6 preserves that warning in:

- `source.runtimeHttpWarning`
- `meta.runtimeHttpWarning`

Future remediation should happen before browser/runtime QA signoff. Recommended next gate: V2.9.7 Admin Shared Contract Adapter and Local Runtime HTTP Remediation.
