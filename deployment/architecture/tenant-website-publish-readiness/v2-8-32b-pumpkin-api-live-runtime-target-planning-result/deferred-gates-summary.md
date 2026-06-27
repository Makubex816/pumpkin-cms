# Deferred Gates Summary

| Gate | Deferred because | Next trigger |
| --- | --- | --- |
| API resource creation | V2.8.32B is planning only | Separate deployment approval |
| API deployment | V2.8.32B forbids deploy | Source health/artifact phase complete |
| App setting binding | Values are protected and app setting actions are forbidden | Secret-safe binding approval |
| Admin live API read | Requires deployed API and approved auth | API health/provider proof |
| Isolated contact POST | Writes are forbidden in V2.8.32B | Isolated binding approval and write approval |
| Production contact binding | Isolated proof missing | Isolated write-read proof complete |
| Production contact POST | Production write forbidden | Separate production validation approval |
| DNS/custom domain | Not needed for first API base URL | Future API branding decision only |
| Search Console/indexing | Irrelevant to contact persistence | Remains deferred |
| Inbox/provider login | Irrelevant to Admin persistence proof | Remains deferred |
