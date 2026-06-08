# Support Packet Export

Support packet export is delegated to the existing offline validator.

Run:

```powershell
node src/builder-cli.mjs --answers fixtures/example-event-rentals.answers.json --out .tmp/generated-example --validate --support-packet
```

The builder generates the package, then asks the validator to write support files into the generated package folder.

## Files

| File | Audience |
| --- | --- |
| `support-packet.json` | Developers and support tooling. |
| `OPERATOR_HANDOFF.md` | Operators reviewing package readiness. |
| `NON_TECHNICAL_SUMMARY.md` | Non-technical reviewers. |
| `NEXT_ACTIONS.md` | Owners of follow-up remediation. |
| `PACKAGE_FILE_INVENTORY.md` | Reviewers checking package contents. |

## Current Scope

The support packet describes validation findings and package inventory. It does not copy source files, upload files, create tickets, send email, notify owners, or make external calls.
