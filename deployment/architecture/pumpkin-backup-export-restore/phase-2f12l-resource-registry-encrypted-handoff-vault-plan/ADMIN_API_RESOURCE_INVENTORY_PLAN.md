# Admin API Resource Inventory Plan

The registry should track API/Admin resources without exposing credentials.

## Pumpkin API Resources

- API app identity
- Runtime profile
- Provider metadata endpoint
- CMS tenant access model
- Backup Center job endpoint references
- Required credential references
- Audit log target

## Admin App Resources

- Admin frontend identity
- API base reference
- Runtime profile/status views
- Operator role requirements
- Backup Center workflow references
- Future Electron orchestration references

## Status Values

- `planned`
- `implemented-local`
- `implemented-readonly`
- `blocked`
- `future-live`

## Current Phase Boundary

Phase 2F-12L does not implement Admin/API features. It only defines how these resources should be recorded in the registry.

