# Standard Backup Secret Exclusion Plan

## Core Rule

The Ice standard backup must be recovery evidence and content/data backup only. It must not become a secret backup.

## Must Exclude

The standard backup must exclude:

- raw API keys;
- JWTs;
- auth headers;
- cookies;
- Azure tokens;
- Cloudflare tokens;
- Microsoft Graph secrets;
- storage keys;
- connection strings;
- SMTP passwords;
- deployment tokens;
- SAS URLs;
- private keys;
- protected config file contents;
- local credential/cache files;
- short-lived tokens;
- session cookies;
- encrypted escrow payloads.

## Required Markers

The future standard backup should include:

- `escrow/ESCROW_NOT_INCLUDED.md`;
- redacted config inventory only;
- validator report confirming no standard-mode escrow payload;
- validator report confirming no secret-like values in generated standard backup text files;
- manifest field `escrowIncluded: false`.

## Failure Conditions

Future execution must fail closed if:

- a generated file contains likely unredacted secret values;
- a protected config path is included;
- an escrow payload appears in standard mode;
- a backup manifest contains connection strings, token values, auth headers, cookies, or storage keys;
- ignored `.tmp` or raw input folders are staged.

## Escrow Separation

If recovery secrets are ever needed, they must be handled only by a separately approved encrypted escrow flow with recipient/key metadata, approval records, access control, audit logging, and encryption.
