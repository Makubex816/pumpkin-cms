# Runtime No-Regression Proof

Fresh GET-only result: 39/39 routes passed.

Coverage:

- Ice apex and `www`: 8 routes;
- Pumpkin API health: 2 routes;
- standalone Admin UI: 4 routes;
- starter default host: 1 route;
- Party Pros apex and `www`: 16 routes;
- Party Pros explicit preview: 8 routes.

Results:

- failures: 0;
- POST requests: 0;
- POST form markers: 0;
- Airstrip routes: 0.

No Ice, Party Pros, API, Admin, starter, form, storage, Cosmos, DNS, or Airstrip state was mutated.
