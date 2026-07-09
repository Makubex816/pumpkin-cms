# Pumpkin Starter App Admin Boundary Proof V2.8.61OH

Status: passed.

Starter `/admin` is a tenant-site-local admin surface. It is not the Pumpkin platform/SuperAdmin control plane.

Allowed starter workflows:

- Dashboard
- Pages
- Page Map
- Forms
- Themes

Denied platform controls:

- Backup Manager
- Package Intake
- Domain Manager
- Users/Admins platform management
- Hardcopy/recovery controls
- Resource management
- Cross-tenant controls

Standalone Admin UI remains the platform control plane at `https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net`.
