# Operator Remediation Input

Approved public-safe remediation env values were read from the environment by exact name only.

Observed values:

- `PUMPKIN_CONTACT_DELIVERY_REMEDIATION_MODE`: `admin-persistence-required`.
- `PUMPKIN_CONTACT_DELIVERY_ADMIN_PERSISTENCE_REQUIRED`: `true`.
- `PUMPKIN_CONTACT_DELIVERY_EMAIL_NOTIFICATION_REQUIRED`: `false`.
- `PUMPKIN_CONTACT_DELIVERY_DUAL_DELIVERY_TARGET`: `future-optional-after-admin-persistence`.
- `PUMPKIN_CONTACT_DELIVERY_FORM_TENANT_ID`: `ice-rink-rentals`.
- `PUMPKIN_CONTACT_DELIVERY_FORM_ID`: `default-quote-request`.
- `PUMPKIN_CONTACT_DELIVERY_PUBLIC_EMAIL`: `contact@iceskatingrinkrentals.com`.
- `PUMPKIN_CONTACT_DELIVERY_LAST_TRACE_ID`: `v2-8-26-production-contact-20260626101926`.
- `PUMPKIN_CONTACT_DELIVERY_LAST_ENTRY_ID`: `ice-rink-rentals-default-quote-request-f9e8a6d2-3f9c-41d2-92e0-39f8ea83dbd5`.
- `PUMPKIN_CONTACT_DELIVERY_APPROVED_MODE`: `no-deploy-no-post-public-safe-binding-preflight`.

Validation:

- Required mode matched: yes.
- Admin persistence required matched: yes.
- Tenant ID matched: yes.
- Form ID matched: yes.
- Public email matched canonical approved email: yes.
- Trace and entry ID matched V2.8.26 carryforward: yes.

No protected config, app settings, inboxes, providers, or production endpoints were queried.
