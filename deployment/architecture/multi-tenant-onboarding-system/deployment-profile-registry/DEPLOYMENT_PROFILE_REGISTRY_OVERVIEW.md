# Deployment Profile Registry Overview

The registry prevents onboarding from assuming every tenant uses the same hosting stack.

Each profile must specify:

- profile ID
- display name
- supported tenants
- required infrastructure
- required runtime env vars
- validators
- deployment steps
- smoke tests
- approval gates
- rollback steps
- unsupported actions
- indexing final gate

Profiles do not perform work. They describe gates that future tools and operators follow.

