# Generic Preview Fixture Compiler Result

A reusable package-to-preview compiler now produces immutable package-static fixtures without executing uploaded JavaScript or embedding tenant-specific route names in compiler logic.

## Implementation

- Compiler version: `2.8.62f.1`; fixture schema: `pumpkin-preview-fixture/v1`.
- HTML is parsed with `parse5`; CSS values are parsed with `postcss-value-parser`; JSON Schema validation uses Ajv.
- The compiler cross-checks normalized package, backup evidence, and reference preview hashes.
- Scripts, inline event handlers, iframe execution, form POST behavior, and unsafe URL schemes fail closed or are safely adapted.
- Media binaries are excluded; canonical URLs and source aliases are emitted.
- Generation report and parity scorecard are machine-readable.
- Synthetic non-Vegas compiler proof passed, demonstrating generic tenant input handling.

## Fail-Closed Checks

- Unresolved routes, links, anchors, media aliases, forms, and controls: 0.
- Blocked items: 0; form actions: 0; POST methods: 0; enabled submit controls: 0.
- Fixture scripts and inline event handlers: 0.
