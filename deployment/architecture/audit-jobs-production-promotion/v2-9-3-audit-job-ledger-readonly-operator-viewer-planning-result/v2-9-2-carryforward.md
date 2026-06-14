# V2.9.2 Carryforward

V2.9.2 remains the validator foundation for V2.9.3.

## Carried Forward

- Dependency-free local Node ESM validator.
- Safe ledger schema expectations.
- Audit event taxonomy.
- Job run taxonomy.
- Promotion gate validation.
- Evidence binding validation.
- Cross-reference checks.
- Trace ID checks.
- No-write safety boundary checks.
- Valid and invalid fixture coverage.

## Validation Baseline

V2.9.2 validated the combined promotion ledger with:

- 11 audit events.
- 9 job runs.
- 11 promotion gates.
- 13 evidence bindings.

V2.9.3 uses that validated ledger shape as the input contract for the viewer model.

## Safety Baseline

The V2.9.2 no-write restrictions remain active. V2.9.3 does not loosen or bypass them.
