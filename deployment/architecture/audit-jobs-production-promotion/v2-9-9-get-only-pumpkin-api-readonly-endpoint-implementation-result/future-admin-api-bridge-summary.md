# Future Admin API Bridge Summary

Recommended next boundary:

V2.9.10 Admin-to-Pumpkin-API Read-Only Bridge Planning.

Future bridge should:

- keep Admin fixture mode as default until explicitly switched;
- add an Admin API provider behind a feature/config boundary that does not read protected config during tests;
- reuse the V2.9.9 envelope and route matrix;
- add Admin adapter tests for `api-local-fixture-readonly`;
- preserve disabled future actions and read-only UI behavior;
- avoid Electron, live provider, deployment, indexing, CMS/provider writes, and Azure mutation.

