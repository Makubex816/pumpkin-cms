# Runtime QA Staging Storage Binding Result

Status: container metadata check passed; blob list blocked by data-plane RBAC.

Read-only command:

```powershell
az storage container show --account-name pumpkincmsstgolm01 --name runtime-qa-staging --auth-mode login --only-show-errors --query "{name:name,publicAccess:properties.publicAccess,leaseState:properties.lease.state}" --output json
```

Result:

- Container: `runtime-qa-staging`
- Lease state: `available`
- Public access: `null`

Read-only blob list with `--auth-mode login` failed because the current Azure session lacks Storage Blob Data Reader/Contributor-style data-plane permission. Key auth was not used.
