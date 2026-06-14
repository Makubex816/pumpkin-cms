# Risk And Open Decisions

Open decisions:

- Whether Admin should consume the generated API envelope fixture directly or import the shared contract builder.
- Whether the future Pumpkin API endpoint should serve one aggregate viewer summary route first or split detail routes first.
- How Electron should cache the contract without storing protected config or secret material.
- How to remediate the local Next dev-server timeout before browser/runtime QA signoff.

Risks:

- Admin still has duplicate viewer transform logic until a future adapter phase.
- API and Electron are only contract planned; runtime implementation remains gated.
- Runtime HTTP warning remains unresolved from V2.9.5.
