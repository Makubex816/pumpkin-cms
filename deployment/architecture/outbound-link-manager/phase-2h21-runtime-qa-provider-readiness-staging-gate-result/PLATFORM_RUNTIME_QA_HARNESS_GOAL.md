# Platform Runtime QA Harness Goal

Runtime QA is now documented as a reusable PumpkinCMS platform capability.

The goal is to support future Admin modules, API provider-state boundaries, gated write workflows, Backup Center surfaces, Resource Registry views, tenant bundle workflows, and future Electron operator cockpit screens.

Core requirements:

- support local/offline and fake-provider modes by default
- verify pages or service boundaries without live Azure, Cosmos, Storage, CMS writes, Cloudflare, DNS, deployment, indexing, or live publication
- detect uncontrolled write calls in read-only or approval-gated phases
- verify provider-mode messaging across local, fake, staging-simulated, live-readonly, and future live-write-approved states
- write evidence under ignored `.tmp`
- avoid protected config reads and never print secrets
- support browser checks only when tooling is already present and safe

