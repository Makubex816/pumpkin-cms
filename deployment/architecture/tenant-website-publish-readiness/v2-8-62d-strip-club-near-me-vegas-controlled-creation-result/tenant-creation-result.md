# Tenant Creation Result

Status: created once.

- Tenant ID: `strip-club-near-me-vegas`
- Name: `Strip Club Near Me Vegas`
- Plan: `controlled-preview`
- Status: `active` for controlled Admin use
- Theme reference: `strip-club-near-me-vegas-static-v1`
- Allowed public origins: 0
- Analytics: disabled
- Public launch/indexing: held in the creation proof and pending content metadata import

The legacy tenant schema auto-generates active key material when key fields are empty. To prevent that behavior, creation supplied an inactive, deliberately nonmatching pair and set `apiKeyMeta.isActive=false`. The values were not printed or written to repo. No usable live form submit key was configured.

No destructive rollback was attempted after tenant creation.
