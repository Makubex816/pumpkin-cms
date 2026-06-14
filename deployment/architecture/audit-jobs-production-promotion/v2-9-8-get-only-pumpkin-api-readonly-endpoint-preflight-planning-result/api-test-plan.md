# API Test Plan

Status: planned only.

Future V2.9.9 tests should include:

- contracts compile;
- endpoint group registers only GET routes under `/api/admin/audit-jobs`;
- no POST, PUT, PATCH, DELETE routes exist under the Audit Jobs route family;
- fixture provider loads the V2.9.6 read-only API envelope;
- fixture provider rejects non-read-only or invalid contract data;
- service returns summary counts matching the fixture;
- list routes support filters, sort, pagination where planned;
- authorization rejects unauthenticated request;
- authorization rejects disallowed role;
- authorization rejects wrong tenant;
- authorization rejects wrong site;
- success envelopes include `requestId`, `correlationId`, `providerMode`, `readOnly`, `warnings`, `errors`, `securityBoundary`, `source`, `tenantKey`, and `siteKey`;
- error envelopes preserve read-only shape;
- security boundary remains closed;
- trace route returns bounded trace entries;
- Google indexing remains deferred;
- Admin contract adapter accepts future provider mode only after explicit adapter update and tests.

Recommended test runner style:

- mirror `apps/pumpkin-api.Tests/OutboundLinkApiReadOnlyTestRunner.cs`;
- add a separate Audit Jobs read-only test runner;
- keep tests local and fixture-backed;
- do not require live API serving, protected config, Azure, provider writes, CMS writes, or deployment.

