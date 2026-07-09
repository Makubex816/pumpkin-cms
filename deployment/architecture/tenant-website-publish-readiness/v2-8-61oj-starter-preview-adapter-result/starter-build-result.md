# Starter Build Result

Status: passed.

Commands:

- `npm run type-check`
- `npm run build`

Results:

- Type-check: passed.
- Build: passed.
- Known warning: `../../packages/pumpkin-ts-models/dist/PageJsonConverter.js Module not found: Can't resolve 'fs'`.

Built route evidence included:

- `/preview/[tenantId]/[[...slug]]`

Local standalone proof after build:

| Route | Status | Bytes | Party Pros content | Preview disabled marker |
| --- | ---: | ---: | --- | --- |
| `/` | 200 | 32616 | no | no |
| `/preview/party-pros-philadelphia` | 200 | 32233 | yes | yes |
| `/preview/party-pros-philadelphia/contact` | 200 | 36505 | yes | yes |
| `/preview/party-pros-philadelphia/service-areas` | 200 | 32031 | yes | yes |
