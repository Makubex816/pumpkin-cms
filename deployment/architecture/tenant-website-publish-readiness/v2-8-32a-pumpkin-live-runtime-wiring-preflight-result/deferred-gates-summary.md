# Deferred Gates Summary

| Gate | Deferred because | Required trigger |
| --- | --- | --- |
| Production contact persistence binding | No verified live Pumpkin API host | API live resource verified or created |
| Production contact POST | Current phase forbids writes | Separate approved runtime QA or production validation phase |
| Admin live visibility check | Requires approved API target and auth | API host and Admin base URL binding complete |
| Protected app setting verification | Current phase forbids app setting reads | Explicit protected binding workflow |
| Tenant API key binding | Secret/protected value | Operator-approved secret-safe bind |
| Tenant CORS/origin verification | Requires live provider/API read path | API runtime and tenant data source approved |
| Backup Center post-binding proof | Requires runtime-created record | Run after isolated approved write |
| DNS/custom domain changes | Not needed for contact persistence | Keep deferred unless future API exposure requires it |
| Search Console/indexing | Irrelevant to persistence blocker | Keep deferred |
| Media upload checks | Irrelevant to contact persistence blocker | Keep deferred |
