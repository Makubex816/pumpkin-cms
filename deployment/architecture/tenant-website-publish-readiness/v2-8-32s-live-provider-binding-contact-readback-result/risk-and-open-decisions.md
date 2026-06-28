# Risk And Open Decisions

Open blocker:

- `provider_binding_not_active`: after the approved appsetting mutation and restart, health still reported `providerConfigured:false`.

Risks:

- Local source shows the health response is dependency-light and hardcodes `providerConfigured:false`, so health cannot currently prove provider readiness without a code change or a different approved provider probe.
- The FormEntry container name is hardcoded as `FormEntry`; source exposes no appsetting for the secure file Forms container field.
- The contact Admin persistence gate remains open because login/readback/POST were not allowed past the health gate.

Open decisions:

- Decide whether the next phase should approve an authenticated login/readback attempt despite the dependency-light health flag, or first deploy a provider-aware readiness endpoint.
- Decide how to handle the secure-file Forms container field now that source does not expose a container-name appsetting.
- Keep the one production contact POST gate closed until authenticated Admin FormEntry readback preflight returns 2xx.

