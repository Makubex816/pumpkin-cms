# Hardcoded Tenant Value Audit

Observed hardcoded tenant values:

- `ice-rink-rentals`
- `roller-rink-rentals`

Expected/current use:

- Static deployment docs and validators contain tenant-specific site examples and planned site configs.
- Admin preview maps include local preview hosts for Ice and Roller.
- Admin page/content import tools use selected/current tenant and validate incoming tenant IDs.
- Static form endpoint compatibility tests include Ice and Roller site mappings.

Risk classification:

- Acceptable where values are explicit tenant profiles, validators, fixtures, or docs.
- Needs future registry-driven cleanup before broader tenant scale, especially for Admin preview host maps and static publishing profiles.

No hardcoded tenant value was changed in V2.8.36.
