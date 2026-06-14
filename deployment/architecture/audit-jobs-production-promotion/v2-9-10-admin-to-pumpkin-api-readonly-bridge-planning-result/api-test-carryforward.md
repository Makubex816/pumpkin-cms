# API Test Carryforward

V2.9.10 carries forward the V2.9.9 API test runner:

`dotnet run --project apps/pumpkin-api.Tests/pumpkin-api.Tests.csproj -- --v2-9-9`

Covered API behavior:

- all 8 route service methods;
- read-only envelope and provider mode;
- expected counts;
- event, gate, and trace filters;
- authorization allow/deny cases;
- endpoint handler JSON serialization;
- missing fixture read-only error;
- no mutation route registration;
- no high-confidence secret-like response values;
- deferred Google indexing visibility.

V2.9.11 should keep this runner green and add Admin client parity tests. The bridge implementation should not change V2.9.9 API route behavior.

