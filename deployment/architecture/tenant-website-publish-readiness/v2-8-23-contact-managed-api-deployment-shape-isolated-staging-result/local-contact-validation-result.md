# Local Contact Validation Result

Passed:

- Static function `npm run check`.
- Static function `npm test`.
- Static function checks after CommonJS entrypoint update.
- Static function tests after CommonJS entrypoint update.
- Local runtime import of `src/functions/static-contact.js` with ignored installed dependencies.
- Ice `npm run type-check`.
- Ice `npm run validate:static:ice`, with 34 existing warnings.
- Ice sanitized static build `sanitized_20260625230507`.

Notes:

- Azure Functions Core Tools were not installed locally (`func` command not found), so a full local Functions host run was not available.
- The CommonJS registration file was import-checked with `@azure/functions` in test mode.

