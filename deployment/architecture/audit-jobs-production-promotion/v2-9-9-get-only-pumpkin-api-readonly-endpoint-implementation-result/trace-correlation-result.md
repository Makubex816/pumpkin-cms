# Trace And Correlation Result

Implemented:

- route-level request IDs using `ajapi_...`;
- response correlation IDs preserved from the V2.9.6 fixture;
- service-level route responses preserve trace entries from `data.traceIds.entries`;
- trace route supports field, audit event ID, correlation ID, and search filters;
- trace route defaults to a bounded page size of 250 and returns all 107 fixture traces by default.

No trace value is loaded from protected config or live provider data.

