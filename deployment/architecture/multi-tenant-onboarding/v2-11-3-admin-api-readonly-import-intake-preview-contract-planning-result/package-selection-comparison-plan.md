# Package Selection Comparison Plan

Package list behavior:

- show package id, tenant, site, domain, lifecycle state, import mode, future readiness, no-go count, warning count, rollback plan id;
- support selecting one package for detail;
- support comparing two package summaries.

Ice comparison state:

- valid package candidate;
- ready for a future explicitly approved import execution gate;
- no no-go conditions.

Roller comparison state:

- paused/no-import candidate only;
- not ready for future import execution;
- no-go condition visible.
