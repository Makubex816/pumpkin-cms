# Local Static Build Validation Result

Result: pass.

Commands run:

`npm run build`

- CWD: `apps/ice-rink-web`
- Result: pass with existing warnings.
- Warnings observed:
  - React hook dependency warning in `DraftPreviewClient.tsx`.
  - Existing `<img>` lint warnings in `PolishedBlocks.tsx`.
  - Existing shared package warning for `fs` resolution from `pumpkin-ts-models/dist/PageJsonConverter.js`.

`npm run build:static:ice:sanitized`

- CWD: `apps/ice-rink-web`
- Result: pass.
- Run ID: `sanitized_20260625053836`
- Static validate: pass.
- Next build: pass.
- Static generate: pass.
- Protected config copied into sanitized workspace: false.
- Protected config reference in sanitized command output: false.

The sanitized static build/generate run is the protected-config-safe static evidence for V2.8.19F.
