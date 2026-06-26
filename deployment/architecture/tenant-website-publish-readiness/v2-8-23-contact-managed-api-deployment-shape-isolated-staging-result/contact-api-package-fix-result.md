# Contact API Package Fix Result

Implemented before the isolated deployment:

- Static export writes `staticwebapp.config.json` with `platform.apiRuntime=node:20`.
- Static output and staging package validators require that config for Ice static output.
- API package includes `package-lock.json`.
- Isolated readiness wrapper requires app output, API package, package lock, API runtime, target values, and token presence without printing token values.

Implemented after the single POST failed, local-only and not deployed:

- Added `deployment/static-azure/forms/static-form-endpoint/src/functions/static-contact.js`.
- Updated `package.json main` to `src/functions/static-contact.js`.
- Kept `azure-function-static-contact.mjs` as a local/legacy ESM wrapper.
- Updated package docs and readiness wrapper to require the CommonJS v4 registration entrypoint.

The post-failure local next-candidate package passed readiness and entrypoint import checks. It requires a separate isolated-only approval to deploy.

