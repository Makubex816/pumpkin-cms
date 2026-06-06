# Graph Permission Result

Generated: 2026-06-05
Updated: 2026-06-06

## Required Permission Present

| Field | Value |
| --- | --- |
| API | Microsoft Graph |
| API app id | `00000003-0000-0000-c000-000000000000` |
| Permission | `Mail.Send` |
| Permission type | Application role |
| App role id | `b633e1c5-b582-4048-a93e-9f11b44c7e96` |

## Broader Permissions

Not added:

- `Mail.Read`
- `Mail.ReadWrite`
- `Directory.ReadWrite.All`
- delegated mail permissions
- unrelated Graph permissions

## Effective Permission State

The permission is present in required resource access, but no Microsoft Entra app role assignment/admin consent is active:

```text
app role assignment count=0
Mail.Send assignment count=0
```

Admin consent was not granted because broad Entra `Mail.Send` is not mailbox-scoped and Microsoft documents Entra grants and Exchange RBAC assignments as additive.

