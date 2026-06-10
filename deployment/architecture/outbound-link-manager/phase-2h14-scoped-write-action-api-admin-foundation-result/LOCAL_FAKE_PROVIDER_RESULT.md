# Local Fake Provider Result

Local/fake provider support was implemented in both local tooling and Pumpkin API tests.

Local package:

- writes sandbox copies under `.tmp`
- emits API response, trace, action result, publishing impact, audit log, rollback plan, and validation files

Pumpkin API:

- uses an in-memory fake provider for scoped write tests
- returns simulated-only responses
- keeps `liveWriteAllowed` false

Admin:

- creates local fake response objects from fixture data
- displays trace fields without network write calls
