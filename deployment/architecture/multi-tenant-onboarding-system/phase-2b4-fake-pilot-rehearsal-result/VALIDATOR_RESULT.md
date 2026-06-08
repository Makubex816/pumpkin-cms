# Validator Result

Direct validator command:

```powershell
node ../validator-implementation/src/cli.mjs --package .tmp/fake-pilot-example-event-rentals --out .tmp/fake-pilot-example-event-rentals --support-packet
```

Result:

- overall status: passed
- errors: 0
- warnings: 0
- info: 0
- files checked: 12
- top blockers: none

Passed gates:

- required-files
- json-parse
- schema-validation
- cross-file
- media-references
- form-references
- seo-canonical
- url-safety
- secret-patterns

Skipped/deferred gates:

- external-checks: skipped
- deployment-profile-and-extension-validation: deferred

Boundary:

- offline only
- external checks not implemented
- no CMS writes
- no MediaAsset writes
- no Azure, Cloudflare, DNS, deployment, Function setting, email, Search Console, indexing, protected config, or Roller work
