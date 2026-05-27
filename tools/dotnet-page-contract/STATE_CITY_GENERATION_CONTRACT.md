# Future State-City Page Generation Contract

No targeted city/location page is created in Phase 8C.11C.

Future generated location pages must use this route pattern:

- `/state-city`

Examples:

- `/fl-orlando`
- `/ny-new-york`
- `/pa-philadelphia`

Rules:

- State comes first, city second.
- Routes are lowercase and hyphen-separated.
- Do not use nested `/city/`, `/locations/`, or `/service-areas/` city routes unless a later approved architecture phase changes the rule.
- Generated city pages must be created through .NET `Page` and block classes or normalized through the .NET contract tool before CMS import.
- Generated city pages must pass TypeScript/admin/public-renderer compatibility, media/form/design validation, static validation, staging validation, and import preflight.
- Future 250+ page workflows must fail if they bypass `.NET Page -> block classes -> contract validation`.

This contract is architecture only. It does not approve city targeting, local claims, schema, media, or indexability.
