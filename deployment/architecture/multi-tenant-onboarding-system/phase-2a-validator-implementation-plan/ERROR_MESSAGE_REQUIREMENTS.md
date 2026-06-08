# Error Message Requirements

## Principles

Messages must be:

- specific
- calm
- actionable
- safe for non-technical users
- useful for operators
- stable enough for snapshot tests
- free of secret values

## Required Message Parts

Every blocking finding should include:

- what is wrong
- where it is wrong
- why it matters
- how to fix it
- whether an owner or operator must decide

## Example Messages

Bad:

```text
Invalid route.
```

Good:

```text
pages/contact.json uses /contact-us/, but routes.json approves /contact/. Change the page route or update approvedRoutes before import.
```

Secret finding:

```text
tenant.json appears to contain a secret-like value in tenantApiKeyPlaceholder. Remove the value and use TENANT_API_KEY_RUNTIME_ONLY. The secret value was not printed.
```

## Snapshot Testing

Phase 2A tests should snapshot representative non-technical messages for:

- missing required field
- bad route
- missing media reference
- unknown form reference
- forbidden local URL
- staging URL in production canonical
- cross-tenant reference
- secret-looking value

