# Isolated Runtime Proof Result

Target default host:

`https://app-pumpkin-admin-isolated-centralus-001.azurewebsites.net`

Runtime proof:

- `/`: HTTP 200.
- `/login`: HTTP 200.
- Root HTML length: 4,820.
- Login HTML length: 6,589.
- `_next/static` occurrences across sampled HTML: 24.
- Sampled static asset: HTTP 200.
- Sampled static asset length: 45,655.
- Login page contained expected auth text.
- Returned HTML contained no localhost API fallback reference.

Classification:

`isolated_admin_ui_runtime_proven`
