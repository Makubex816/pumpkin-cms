# Pumpkin Strip Club Near Me Vegas Compiler V2.8.62B

## Decision

Use a static-HTML-specific local compiler for this package. The reusable V1 manifest and validator remain the target contract, but `compile-normalized-package.mjs` is currently coupled to Airstrip route and form assumptions and is not a safe content compiler for this source.

## Implementation

The ignored task-scoped compiler is `.tmp/v2-8-62b/static-package-compiler.mjs`. It:

- rechecks the approved source ZIP SHA-256 before work;
- parses source HTML with Chrome script execution disabled and HTTP(S) blocked;
- preserves title, H1, meta, structured data, semantic content blocks, image relationships, link relationships, and sanitized source-backed HTML;
- emits 43 source page records plus one validator compatibility alias;
- emits 10 catalog records and 19 guide/article records;
- deduplicates media by SHA-256 while retaining every source-relative alias;
- emits 15 draft FormDefinition candidates with consent, honeypot, and context fields;
- quarantines the one broken legacy route;
- marks outbound Airstrip links held for owner decision; and
- creates an inert local preview fixture without copying or executing source JavaScript.

Final compiler SHA-256: `74eebd63bc44649e4ad0fa4075fa7466355880d92b8305d527a489a9fb65fc9b`.

The normalized candidate is outside the repository at `C:\Users\User\AppData\Local\Temp\pumpkin-v2-8-62b\compiled-package`. The task-scoped compiler is ignored and is not a proposed canonical compiler replacement in this phase.

## Result

All expected source counts reconciled. The canonical V1 validator passed with no errors or warnings. No live import or mutation was attempted.
