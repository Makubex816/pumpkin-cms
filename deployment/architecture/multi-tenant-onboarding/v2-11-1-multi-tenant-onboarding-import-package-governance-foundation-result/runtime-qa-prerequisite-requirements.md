# Runtime QA Prerequisite Requirements

Runtime QA refs must include:

- Runtime QA package/run ref;
- relevant tenant/site scope;
- validation status;
- unresolved warnings/blockers;
- operator decision ref.

Rules:

- Runtime QA prerequisite missing is no-go.
- Runtime QA readiness does not authorize import execution.
- Future live/staging Runtime QA may require separate approval if it touches live services.

Carryforward:

- V2.6 Runtime QA operationalized.
- V2.7 Admin/API Runtime QA signoff complete.
- V2.8 and V2.9 validations carry forward into V2.11 governance.
