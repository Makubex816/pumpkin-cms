# V2.8.44 PublishRun Static Site Proof Result

Status: `succeeded`.
Classification: `publishrun_static_site_integration_proved`.
Tenant: `ice-rink-rentals`.
Trace: `v2-8-44-publish-20260630003547-ef4cda80`.

This package records the live Pumpkin API PublishRun and static site integration proof. The final lane created one synthetic noindex proof page, included it in an isolated Static Web Apps deployment, read it back publicly with the trace present, wrote and read a PublishRun record, deleted the proof page, deployed an isolated cleanup artifact, and then deployed a clean production artifact with only the three public Ice routes.

No secret values, bearer tokens, cookies, SWA deployment tokens, appsettings, Key Vault secrets, storage keys, SAS values, or connection strings are printed or written here.
