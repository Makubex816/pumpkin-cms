# Report Format Result

The validator still writes:

```text
validation-report.json
VALIDATION_REPORT.md
```

Report improvements:

- records `phase: 2A-2`
- includes overall status
- includes summary counts
- includes gate statuses for cross-file, media, form, SEO, URL, and secret checks
- lists files checked
- includes owner-facing explanations
- includes suggested fixes
- keeps boundary confirmation explicit
- does not print secret values

External checks are reported as `skipped`. Deployment profile and extension validation are reported as `deferred`.
