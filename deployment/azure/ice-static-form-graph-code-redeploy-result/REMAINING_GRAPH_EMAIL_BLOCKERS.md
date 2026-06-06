# Remaining Graph Email Blockers

Generated: 2026-06-05

Graph-capable code is now deployed, but real email delivery remains blocked.

Still required after explicit approval:

- Microsoft 365 app registration or approved managed identity setup
- Graph/Exchange Online permission grant
- Exchange Online RBAC for Applications scoped to the approved mailbox
- server-side Azure Function app settings or Key Vault references
- `FORM_DELIVERY_MODE=graph` activation after approval
- endpoint verification in Graph mode
- exactly one approved live email test
- receipt verification at the approved recipient
- strict static validators rerun after production email verification

Contact form production readiness remains:

```text
no
```

