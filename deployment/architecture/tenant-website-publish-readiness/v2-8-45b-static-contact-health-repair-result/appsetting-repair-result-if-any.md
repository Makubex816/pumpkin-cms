# Appsetting Repair Result

Repair performed: yes.

Scope:

- Production SWA: `swa-ice-static-staging`.
- Isolated SWA: `swa-ice-static-isolated-staging`.

Action:

- Set only the seven approved static-contact settings from `.tmp/v2-8-45b/secure/static-contact-health-repair.json`.
- Used Azure CLI with output suppressed.
- Did not print or write any setting value.

Post-repair verification:

- Production expected settings present: yes.
- Production expected values exact match: yes.
- Isolated expected settings present: yes.
- Isolated expected values exact match: yes.
- Outer whitespace on expected values: none found.

Health result after appsetting repair:

- Static-contact health remained HTTP 500 with `Backend call failure` on production apex, production www, production default host, and isolated.

