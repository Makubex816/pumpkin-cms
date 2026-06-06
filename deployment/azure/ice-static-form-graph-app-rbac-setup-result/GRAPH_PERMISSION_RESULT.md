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

The required Microsoft Graph `Mail.Send` application permission is now admin-consented for the existing tenant service principal:

```text
app role assignment count=1
Mail.Send assignment count=1
resource=Microsoft Graph
```

Admin consent was granted only after the Exchange mailbox scope verified for `contact@iceskatingrinkrentals.com`.
