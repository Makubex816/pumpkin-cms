# Config Redaction Result

Date: 2026-06-09

The backup includes a redacted presence-only config inventory.

## Status

| Item | Result |
| --- | --- |
| Config variable names included | Yes |
| Presence markers included | Yes |
| Config values included | No |
| Protected config files read | No |
| Real secret export | No |
| Encrypted escrow payload | No |

## Bundle Files

- `config-inventory/env-inventory.redacted.json`
- `config-inventory/CONFIG_VALUES_REDACTED.md`

## Recorded Presence Markers

| Variable | Presence |
| --- | --- |
| `PUMPKIN_API_URL` | PRESENT |
| `PUMPKIN_ADMIN_JWT` | PRESENT |
| `ICE_RINK_RENTALS_API_KEY` | MISSING |
| `ICE_RINK_RENTALS_TENANT_ID` | MISSING |
| Database/media Azure variables | EXCLUDED |

No actual values were written. The standard backup includes `escrow/ESCROW_NOT_INCLUDED.md` to make the absence of encrypted escrow explicit.

