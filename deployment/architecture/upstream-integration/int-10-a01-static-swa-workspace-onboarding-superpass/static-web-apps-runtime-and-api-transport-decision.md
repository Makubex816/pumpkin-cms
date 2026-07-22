# Static Web Apps runtime and API transport decision

Decision: the tenant public website is generated as static files suitable for Azure Static Web Apps. Dynamic behavior routes to the central Pumpkin API only through public, tenant-scoped, non-credential configuration.

Allowed in public artifact:

- tenant UID/slug/display name;
- public base URL;
- non-credential API origin or route prefix;
- public form mode;
- CAPTCHA public site key only when approved for a non-live local proof;
- route, redirect, theme, and content-package metadata.

Forbidden in public artifact:

- privileged API credentials;
- Cosmos/storage/SAS/connection strings;
- private CAPTCHA provider credentials;
- customer payloads or raw FormEntry records;
- admin/editor privileged credential state.

Cost hold: any paid Static Web Apps plan choice, managed API linking, custom-domain binding, DNS mutation, or TLS mutation requires separate owner approval.
