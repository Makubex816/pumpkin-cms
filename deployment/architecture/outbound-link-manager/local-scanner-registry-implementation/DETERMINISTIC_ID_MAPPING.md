# Deterministic ID Mapping

Production candidate IDs are deterministic so operators can compare repeated dry-runs before any future staging or production provider write is approved.

## Inputs

- entity name
- tenant key
- site key
- source record ID
- migration run ID

## Outputs

- `targetRecordId`: stable production-candidate ID for the future record.
- `migrationRecordId`: stable migration event ID for this source-to-target mapping.
- `migrationRecordHash`: hash of the full candidate record after common fields are assigned.
- `beforeStateHash`: hash of the source local record.
- `afterStateHash`: hash of the target candidate record without the final `migrationRecordHash`.

## Prefixes

Each entity receives a short prefix, for example `olp` for outbound link records and `olip` for outbound link instance records. The prefixes are descriptive only; uniqueness comes from the SHA-256 digest inputs.

Repeated dry-runs over the same input, profile, and migration run ID produce stable target IDs and stable checksum files.
