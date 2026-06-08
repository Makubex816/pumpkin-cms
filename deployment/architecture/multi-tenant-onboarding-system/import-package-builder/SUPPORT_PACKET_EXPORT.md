# Support Packet Export

Support packet export is delegated to the existing offline validator, then hardened by the builder with a local redaction scan.

Run:

```powershell
node src/builder-cli.mjs --answers fixtures/example-event-rentals.answers.json --out .tmp/generated-example --validate --support-packet
```

The builder generates the package, asks the validator to write support files into the generated package folder, writes a builder package summary, and scans the support files for raw-answer references and secret-like values.

## Files

| File | Audience |
| --- | --- |
| `support-packet.json` | Developers and support tooling. |
| `OPERATOR_HANDOFF.md` | Operators reviewing package readiness. |
| `NON_TECHNICAL_SUMMARY.md` | Non-technical reviewers. |
| `NEXT_ACTIONS.md` | Owners of follow-up remediation. |
| `PACKAGE_FILE_INVENTORY.md` | Reviewers checking package contents. |
| `BUILDER_PACKAGE_SUMMARY.md` | Operators checking generated package summary, validation result, and stop points. |

## Redaction Checks

After support packet export, the builder scans the local support files for:

- references to the raw answers file name
- secret-like assignments
- private-key patterns
- JWT-looking values
- signed URL query parameters

If a support packet fails this check, the builder returns failed status and stops. It still performs no external action.

## QA Evidence Review

For a usability or fake-pilot rehearsal, inspect these generated files:

- `NON_TECHNICAL_SUMMARY.md` for plain-language status and ask-for-help cues
- `OPERATOR_HANDOFF.md` for blockers, next action, stop points, and owner handoff
- `NEXT_ACTIONS.md` for safe follow-up instructions
- `PACKAGE_FILE_INVENTORY.md` for file names only and `Source files copied: false`
- `BUILDER_PACKAGE_SUMMARY.md` for builder counts, validation status, and hard stops
- `support-packet.json` for structured status and boundary confirmation
- form recipient references in the builder summary and support packet, verifying they are reference IDs rather than raw emails

Do not paste raw answers into tickets by default. The `.tmp` package path is local evidence, not proof that anything was deployed or imported.

## Current Scope

The support packet describes validation findings, package inventory, generated package summary, stop points, operator handoff, and non-technical next steps. It does not copy source files, upload files, create tickets, send email, notify owners, or make external calls.
