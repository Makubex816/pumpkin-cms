# Provider Profile QA Result

Status: passed.

Command:

```powershell
node src\outbound-link-cli.mjs provider-check --profile fixtures/provider-profile-olm-staging-cosmos-nosql.fixture.json --out .tmp/v2-6-1-provider-profile-check
```

Result:

- Provider: `passed`
- Provider profile ID: `olm-staging-cosmos-nosql-v1`
- Provider mode: `live-write-approved`
- Live write allowed: `false`
- Can plan writes: `true`

The profile remains a scoped staging profile, not a global write profile.
