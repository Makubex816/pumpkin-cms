# Extension System Overview

Extensions package reviewed functionality such as new block types, CMS fields, validators, form integrations, or deployment profile adapters.

Every extension must declare:

- manifest version
- extension ID
- compatible Pumpkin CMS versions
- compatible schema versions
- tenant scope
- permissions
- routes added
- CMS fields added
- API endpoints added
- frontend components added
- migrations
- required runtime env vars
- tests
- rollback steps
- security review status

Extensions are disabled by default for a tenant until explicitly enabled.

