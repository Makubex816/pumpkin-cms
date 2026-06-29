# Current State Summary

V2.8.37 is blocked after isolated deployment failure.

Current live state:

- Pumpkin API: live and healthy.
- Admin API read-only proof: passed.
- Isolated Admin App Service: created and running at Azure resource level.
- Isolated Admin deployment: failed in OneDeploy/Kudu.
- Isolated Admin runtime: default host returns 503.
- Production Admin target/deployment: not attempted due hard stop.

The Admin UI is no longer merely unknown/local-only from an inventory standpoint: it has a buildable standalone artifact and an isolated Azure target, but it is not live-serving yet.
