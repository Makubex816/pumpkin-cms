# Shared Starter Deployment Artifact Completeness Standard V2.8.62FRR

Every tenant served by one starter deployment must be represented in a committed deployment artifact manifest.

The manifest must declare tenant ID, fixture path/format/hash, route count, theme/public dependencies, host routing, registry path, and form mode. Registry tenants and manifest tenants must match exactly.

Before packaging, verify every declared source artifact. Package only declared tenant fixtures, then verify the standalone tree and the extracted final ZIP. Fail closed for a missing tenant, missing asset, hash mismatch, extra registry tenant, unsafe path, protected config, or empty static output.

Adding or repairing one tenant must never remove another tenant from the shared package. A successful app deployment is not sufficient proof; every represented tenant requires post-deployment route and behavior checks.
