# Pumpkin Package Compiler V2.8.61D

V2.8.61D adds the reusable source-map to normalized package compiler:

`deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/compile-normalized-package.mjs`

The compiler consumes V2.8.61C analyzer proof output and writes a V1 `full-template` package candidate outside the repo. It does not execute uploaded package code, install dependencies, build frontend output, deploy, create tenants, import records, upload media, mutate DNS, submit forms, or read protected config contents.

Key outputs:

- V1 tenant package files.
- Route classification.
- Media manifest.
- FormDefinition candidate.
- Theme/brand output.
- Responsive route requirements.
- Conversion gap report.
- Owner action packet.
- Technical compiler report.

The Airstrip replay generated a validator-clean candidate with 26 expected routes, 13 media assets, and the `airstrip-reservation` FormDefinition candidate.
