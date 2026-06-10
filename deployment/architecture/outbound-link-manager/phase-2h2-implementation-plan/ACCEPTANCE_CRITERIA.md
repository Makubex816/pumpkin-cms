# Acceptance Criteria

Phase 2H-3 local scanner/registry foundation is accepted only when:

- all local fixtures parse;
- scanner performs no network calls;
- scanner performs no CMS/API calls;
- scanner reads no protected config;
- generated output stays under ignored `.tmp`;
- registry records validate against schema;
- instance records validate against schema;
- policies validate against schema;
- scan run summary validates against schema;
- same URL across pages produces one link and multiple instances;
- duplicate URL placements do not collapse;
- disabled global link and disabled instance remain distinct;
- blocked domain produces expected status;
- stale instance is detected;
- validator rejects malformed records;
- tests pass in local/offline mode.

Phase 2H-3 must not include Admin UI, Pumpkin API, runtime renderer, database migration, or Backup Center production integration.
