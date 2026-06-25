# Local Build Validation Result

Result: pass.

Commands:

- `npm run validate:static:ice`: pass with known 34 warnings.
- `npm run type-check`: pass.
- `npm run build:static:ice:sanitized`: pass.

Selected sanitized build:

- Run ID: `sanitized_20260625063439`
- Protected config copied: false.
- Protected config reference in output: false for static validate, Next build, and static generate.

Tiny validation fix:

- File: `apps/ice-rink-web/src/data/ice-rink-recovered-pages.ts`
- Change: recovered SEO robots metadata now emits `index, follow`.
- Reason: production-bound release after owner approval should not preserve recovered noindex metadata.

Additional note:

- A broader legacy static-output validator was observed before the final selected artifact. It still expects an older `media.iceskatingrinkrentals.com` origin and a configured static form endpoint, while this V2.8.19H release explicitly approves existing Azure Blob media URLs and public email/mailto only. The scoped V2.8.19H validators passed for the selected artifact.

