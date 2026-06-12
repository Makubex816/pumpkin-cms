# Sanitized No-Dotenv Build Pattern

Status: active no-go. A repo-supported no-dotenv Next static build path does not currently exist.

Current finding:

- `apps/ice-rink-web/package.json` uses `next build` for `build:static:ice`.
- Previous V2.8.3 build reported `Environments: .env.local`.
- V2.8.4 did not run another Next build because the phase forbids protected-config reads and the current build path auto-detects `.env.local`.

Required future pattern:

1. Create a build wrapper or CI profile that runs the Ice static build in a sanitized workspace.
2. Exclude `.env.local`, `.env.*.local`, `appsettings.Development.json`, `local.settings.json`, credential caches, cookies, and auth files from that workspace.
3. Provide only approved public build-time values through the process environment.
4. Fail if Next reports `.env.local` or any protected config file in the environment summary.
5. Fail if generated output contains `.env*`, `appsettings.*.json`, tokens, auth headers, keys, connection strings, SAS URLs, or local host-only secrets.
6. Write a sanitized build proof manifest under ignored `.tmp`.
7. Run static output and staging package validators against that sanitized output.

Future staging execution must not proceed until this proof exists or the owner explicitly accepts the caveat in a separate approval.

