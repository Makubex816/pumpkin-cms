# Audit Logging Model

## Events To Log

- Backup requested.
- Backup scope and mode selected.
- Escrow requested.
- Escrow approval or rejection.
- Recipient key selected.
- Job started, completed, failed, cancelled, or expired.
- Artifact created.
- Checksum generated.
- Validation completed.
- Artifact download started/completed.
- Restore plan generated.
- Sandbox restore validation event.
- Escrow restore requested.
- Escrow restore approved/rejected.
- Escrow decrypt attempt.
- Cleanup/retention deletion event.

## Required Fields

- event ID;
- timestamp;
- actor;
- role;
- tenant/platform scope;
- job ID;
- artifact ID;
- mode;
- escrow included boolean;
- reason;
- approval IDs;
- checksum;
- status;
- failure class.

## Redaction

Audit logs must not contain secret values, decrypted escrow content, auth headers, cookies, tokens, connection strings, private keys, or protected config contents.

## Retention

Audit records should outlive backup artifact retention so deletion and access history remain reviewable.
