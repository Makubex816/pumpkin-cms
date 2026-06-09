# Provider Discovery Model Result

## Model

Implemented `provider-discovery-model.mjs` with:

- provider metadata contract version `0.1.0`;
- provider types including `cosmos`, `mongo`, `azure-sql`, `file-backed`, `local-provider`, `api-backed`, `unknown`, `unsupported`, and `missing`;
- provider statuses including `configured`, `discovered`, `missing`, `unknown`, `blocked`, `future-target`, `unsupported`, and `mismatch`;
- validation for non-secret contract fields;
- readiness mapping for missing, future-target, configured Cosmos, local-provider, and blocked states.

## Required Fields Covered

- tenant key;
- site key;
- environment;
- profile;
- provider type/status;
- account/resource/database/container metadata;
- backup policy mode;
- portable export support;
- platform evidence support;
- redaction status;
- secrets-included flag.

## Export Rule

The model never allows live database export in this foundation. Missing and future-target states explicitly block export.
