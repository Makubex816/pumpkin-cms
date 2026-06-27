# Dependency Config Analysis

The runtime 500 did not come from the health handler or provider dependencies.

Findings:

- Health source does not resolve `IDatabaseService`.
- Health source does not inspect database/provider settings.
- Health source does not read appsettings, local settings, connection strings, secrets, or tokens.
- The exception occurred before the health handler completed, inside JWT bearer option initialization.
- The missing dependency was protected JWT config, specifically `Jwt:SecretKey`.

Correction strategy:

- Do not bind or inspect secret app settings in this phase.
- Make missing JWT config non-fatal for unauthenticated health requests.
- Keep protected endpoints protected by returning no auth result when JWT config is absent.
