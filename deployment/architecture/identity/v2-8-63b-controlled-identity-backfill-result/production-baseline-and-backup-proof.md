# Production baseline and backup proof

The restricted and sanitized backup is at `C:\Users\User\Desktop\PumpkinCMS\secure-operator-handoff\platform-backups\v2-8-63b-pre-identity-backfill`.

- Captured: 2026-07-15T08:15:52.7734056Z
- Tool: v2.8.63b.1
- Database: pumpkin-prod-cms
- Tenants/users/form definitions: 4/5/35
- Password-hash presence: 5/5; values are excluded from repository evidence
- Checksum-manifest SHA-256: `b5589e3ddd388e9e29b89f1a677167f12c11c656dd0d810aad57cdb809af9b99`
- Restricted rollback and sanitized validation classes: present
- Restore order: Tenant, User, FormDefinition, disable identity flags, validate login/access

The source set contains Airstrip, Ice Rink Rentals, Party Pros Philadelphia, and Strip Club Near Me Vegas. No allowlist was used.
