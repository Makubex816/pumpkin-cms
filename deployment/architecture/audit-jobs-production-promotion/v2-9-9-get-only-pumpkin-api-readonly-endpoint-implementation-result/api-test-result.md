# API Test Result

Implemented scoped test runner:

`apps/pumpkin-api.Tests/AuditJobApiReadOnlyTestRunner.cs`

Runner flag:

`--v2-9-9`

Covered:

- all 8 route service methods;
- read-only envelope and provider mode;
- counts: events `11`, job runs `9`, gates `11`, evidence `13`, traces `107`, warnings `1`, blockers `0`, next gates `2`;
- event, gate, and trace filters;
- wrong tenant fixture scope;
- allowed and denied authorization cases;
- endpoint handler JSON serialization;
- missing fixture read-only error envelope;
- no mutation route registrations;
- no high-confidence secret-like values in responses;
- deferred Google indexing visibility.

