# V2.9.6 Carryforward

V2.9.6 committed the shared viewer model and read-only API envelope foundation as `8b43f7f Implement V2.9.6 audit ledger shared readonly contract`.

Carried into V2.9.7:

- shared viewer model schema `audit-job-ledger-shared-viewer-model.v1`;
- read-only API envelope schema `audit-job-ledger-readonly-api-envelope.v1`;
- generated local fixture `valid-v2-8-combined-readonly-api-envelope.fixture.json`;
- contract validator CLI commands `api-fixture` and `validate-contract`;
- read-only security boundary and redaction policy;
- Google/Search Console/indexing deferred hard stop;
- runtime HTTP warning value `local_next_dev_server_listened_but_timed_out`.

V2.9.7 consumed the V2.9.6 fixture locally in Admin. It did not implement a live API endpoint, Pumpkin API endpoint, or Electron runtime.

