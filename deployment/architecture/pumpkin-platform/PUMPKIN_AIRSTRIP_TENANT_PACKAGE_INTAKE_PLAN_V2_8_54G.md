# Pumpkin Airstrip Tenant Package Intake Plan V2.8.54G

Target domain: `airstripclublasvegas.com`

Status: package_intake_planned_not_executed

Recommended intake flow:

1. Place raw package in ignored local intake, for example `.tmp/v2-8-55-airstrip-package-intake/source/`.
2. Record file inventory, hashes, and package size without staging raw files.
3. Run public secret scan before executing scripts.
4. Detect package shape: static HTML, static export, Next source, React/Vite source, CMS export, asset-only, or unknown.
5. Validate domain and tenant metadata; normalize conflicts against `airstripclublasvegas.com`.
6. Map pages, media, theme, forms, contact endpoint expectations, publish metadata, and admin users into the Pumpkin package contract.
7. Produce a sanitized readiness report and only then request creation preflight.

DNS, deployment, media upload, form submission, and tenant creation remain deferred.

