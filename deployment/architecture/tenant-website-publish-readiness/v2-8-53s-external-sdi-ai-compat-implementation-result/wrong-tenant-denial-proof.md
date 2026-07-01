# Wrong Tenant Denial Proof

The proof sent one wrong-tenant submit denial attempt using the alias route and the approved Ice tenant API key.

Result:

| Check | Status |
| --- | --- |
| Wrong tenant submit attempt | HTTP 401 |
| Accepted write | no |

This verified that the alias path still enforces tenant/API-key binding before FormEntry persistence.
