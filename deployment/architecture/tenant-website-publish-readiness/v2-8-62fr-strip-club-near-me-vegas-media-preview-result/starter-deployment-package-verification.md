# Starter Deployment Package Verification

| Property | Result |
| --- | --- |
| SHA-256 | `6eb668b21fa3c38dbbca10900215ae52aeec98bce968dbd0f678893548483d62` |
| Bytes | 6,263,306 |
| Entries | 1,833 |
| Forward-slash entries | 1,833 |
| Backslash, unsafe, duplicate entries | 0 |
| Protected config entries | 0 |
| Secret-like findings | 0 |
| Embedded Vegas media binaries | 0 |
| Vegas fixture and reference theme | present |

The ZIP was built outside the repository and was not staged. The preflight failed to require the externally carried Party Pros fixture. Because deployment used clean extraction, that omission caused the live Party Pros regression and is a mandatory recovery-phase package gate.
