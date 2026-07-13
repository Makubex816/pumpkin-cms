# Live Preview Age Gate Proof

The live 21+ acknowledgement passed its functional boundary:

- A fresh browser session displayed the gate and made background content inert.
- Initial keyboard focus was placed on the acknowledgement control.
- Acceptance unlocked content and persisted only in session storage.
- Same-session navigation remained unlocked; a new context displayed the gate again.
- Leave Preview returned to the starter root.
- Local-storage entries: 0.
- Application or age-gate cookies: 0.
- Personal data persisted: false.

Azure App Service supplied the secure, HTTP-only platform cookies `ARRAffinity` and `ARRAffinitySameSite`. The proof harness records names only and distinguishes them from application state.
