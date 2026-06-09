# Validator Integration Plan

## Modes

The validator should distinguish:

- baseline standard backup mode, where database and media blobs may be explicitly missing;
- completion mode, where selected database/media artifacts are required;
- full-production-restore-proof mode, where database artifact proof and media binary proof are required.

## Required Validator Behavior

The validator should:

- pass baseline mode when missing components are explicitly marked incomplete;
- fail completion mode if an approved database artifact is missing;
- fail completion mode if media copy mode is selected but blob copies or checksums are missing;
- validate database artifact checksum if present;
- validate media blob checksums if present;
- validate that media inventory count and copied blob count match the selected scope;
- detect signed URLs, storage keys, connection strings, access tokens, and secret-like values in standard backup files;
- reject escrow payloads in standard backup mode;
- reject protected config paths;
- reject output paths outside ignored `.tmp` or approved private storage labels;
- report accidentally staged database/media artifacts as a hard failure when Git context is available.

## Expected New Checks

| Check | Baseline Mode | Completion Mode |
| --- | --- | --- |
| `database-artifact-required` | warning/incomplete allowed | required if selected |
| `database-artifact-checksum` | skip if absent | required if artifact present |
| `media-blob-copy-required` | warning/incomplete allowed | required if selected |
| `media-blob-checksums` | skip if absent | required if blobs present |
| `production-proof-status` | blocked allowed | must fail if selected proof is incomplete |

## Secret Exclusion

Standard backup validation must continue to exclude real secrets and encrypted escrow payloads. Escrow execution remains a separate approval track.

