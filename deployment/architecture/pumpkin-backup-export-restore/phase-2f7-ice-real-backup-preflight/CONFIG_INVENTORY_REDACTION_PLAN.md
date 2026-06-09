# Config Inventory Redaction Plan

## Standard Inventory Rule

The standard backup may include configuration inventory only as names, categories, owning subsystem, presence state, and restore impact. It must never include values.

Allowed states:

- `PRESENT`
- `MISSING`
- `REDACTED`
- `NOT_APPLICABLE`

## Required Redacted Fields

Each inventory row should include:

- variable or setting name;
- subsystem;
- expected source type;
- presence state;
- restore impact if missing;
- escrow eligibility category;
- notes for operator remediation.

## Forbidden Content

The inventory must not include:

- secret values;
- JWT values;
- API key values;
- auth headers;
- cookies;
- token values;
- connection strings;
- storage keys;
- SAS URLs;
- protected config file contents;
- credential/cache file contents;
- local machine-specific secret paths.

## Protected Config Boundary

Future execution must not read `.env.local`, `appsettings.Development.json`, `local.settings.json` with real secrets, credential/cache files, uploaded env/key text files, or any file containing keys, JWTs, auth headers, cookies, tokens, connection strings, or storage keys.

Presence checks must use process environment or approved provider metadata only, and must print only `PRESENT` or `MISSING`.

## Phase 2F-7 Boundary

No environment variables were inspected, no protected config was read, and no secret values were printed in this phase.
