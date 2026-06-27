# Risk And Open Decisions

## Risks

- Health is now green, but provider/contact bindings are still absent or unverified in this lane.
- Login/admin behavior may still require future JWT secret binding before Admin workflows can be used.
- Contact POST validation remains unapproved and untested against the live API.

## Open Decisions

- Approve the provider/app-setting binding phase.
- Decide exact provider/contact settings to bind and how to validate without exposing secrets.
- Approve a later contact POST validation phase only after provider binding is complete.
