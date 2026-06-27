# Risk And Open Decisions

Remaining risks:

- Static health does not report delivery mode, so the mode binding is evidenced by appsetting mutation and source discovery, not by health JSON.
- Pumpkin API health is dependency-light and reports `providerStatus:not_checked`; it does not prove database write readiness.
- The tenant API key can only be proven against the live tenant record by an approved POST.
- Admin readback can only be proven by an approved Admin/FormEntry read phase.
- `PUMPKIN_API_JWT_SECRET_KEY` was absent in the operator environment; no API JWT appsetting was changed in this phase.

Open decision:

- Approve or defer V2.8.32L live contact POST plus Admin FormEntry readback.
