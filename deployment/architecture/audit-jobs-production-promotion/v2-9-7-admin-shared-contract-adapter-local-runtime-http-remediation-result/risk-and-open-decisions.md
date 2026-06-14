# Risk And Open Decisions

Residual risks:

- The Admin adapter currently consumes a local fixture, not a live API endpoint.
- The V2.9.6 fixture still contains the historical runtime warning value for trace continuity even though V2.9.7 resolved local route serving.
- Future GET-only API work must prove authentication, tenant/site scoping, response envelope compatibility, and write-method rejection before any runtime endpoint can be considered ready.
- Electron remains unimplemented and should not be coupled to Admin route work until the API/read-only runtime boundary is explicitly approved.

Open decisions:

- exact future Pumpkin API route names and controller boundaries;
- authorization and tenant/site context source for future GET-only endpoints;
- whether Admin should keep fixture fallback after a future API endpoint exists;
- whether the V2.9.6 fixture should be regenerated in a later phase with runtime warning marked resolved, or preserved as historical contract evidence.

