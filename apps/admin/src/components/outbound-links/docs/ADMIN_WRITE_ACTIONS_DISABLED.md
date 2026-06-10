# Admin Write Actions Disabled

Phase 2H-10 exposes disabled affordances only.

Disabled actions shown:

- Run Scan
- Bulk Actions
- Edit Policy
- Enable
- Disable
- Approve
- Block
- Create Policy
- Generate Export
- Resolve Selected

The new outbound-link UI source does not import the general Admin API client, does not call network APIs, and does not define write-capable submit handlers.

Future write actions require a separate approval and preflight phase.

