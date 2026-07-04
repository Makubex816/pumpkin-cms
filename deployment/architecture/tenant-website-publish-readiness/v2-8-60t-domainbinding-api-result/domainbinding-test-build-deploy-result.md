# DomainBinding Test Build Deploy Result

Status: passed.

Tests/build:

- Focused DomainBinding source tests: passed.
- Pumpkin API Release build: passed.
- Pumpkin API publish with protected config excluded: passed.
- TypeScript model package build: passed after local `npm ci`.

Package:

- ZIP path: `.tmp/v2-8-60t/artifacts/pumpkin-api-domainbinding-v2-8-60t-posix.zip`
- Entry count: 56
- Backslash entry count: 0
- Protected config entry count: 0

Deploy:

- Deploy count: 1
- Deployment ID: `a647c10c-0f36-4db5-a943-682fc2c94d54`
- Deployment status: `RuntimeSuccessful`

Notes:

- `npm ci` reported 2 dependency audit findings in `packages/pumpkin-ts-models`: 1 moderate and 1 high.
- No dependency remediation was performed in this phase.

