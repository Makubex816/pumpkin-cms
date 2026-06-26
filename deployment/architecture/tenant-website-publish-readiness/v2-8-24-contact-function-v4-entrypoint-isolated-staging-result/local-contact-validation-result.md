# Local Contact Validation Result

Passed:

- `npm run check` in `deployment/static-azure/forms/static-form-endpoint`
- `npm test` in `deployment/static-azure/forms/static-form-endpoint`
- `npm run type-check` in `apps/ice-rink-web`
- `npm run validate:static:ice` in `apps/ice-rink-web`
- `npm run build:static:ice:sanitized` in `apps/ice-rink-web`
- Deployment readiness wrapper against the packaged app/API roots

Static validation warning state:

- `npm run validate:static:ice` passed with 34 existing content readiness warnings.
- Strict static output validator failed on 165 known non-contact media-origin findings.
- Strict staging package validator failed on the same 165 known non-contact media-origin findings.
- The strict static form gate passed when supplied the approved same-origin endpoint verification flags.

Sanitized build:

- Run ID: `sanitized_20260626011945`
- Protected config copied: false
- Child build environment allowlist: true
- Protected config reference in command output: false
