# Current State Summary

| Area | Current state |
| --- | --- |
| Phase | `partial_preview_deployed_live_fidelity_failed_no_second_deploy` |
| Vegas media ACL | `blob`; exact blob reads allowed, anonymous listing unavailable |
| Vegas media | 302/302 readable, 28,343,976 bytes, 473/473 aliases resolved |
| Vegas fixture | Byte-identical, payload SHA-256 `843606019ed622fe9653c5ea6964c037896b62c0045bf6a11ea2db6f51e11484` |
| Starter deployment | One of one used; `RuntimeSuccessful` |
| Vegas live preview | 43/43 routes and 172/172 viewport renders passed |
| Overall live gate | Failed on one required shared-root CSS 404 and Party Pros regression |
| Party Pros public | 0/16 representative GET checks; all returned 404 |
| Party Pros preview | 0/8 representative GET checks; all returned 404 |
| Other runtime | Ice 8/8, API 2/2, Admin 4/4, starter core 3/3 |
| Forms | No POST and no FormEntry |
| Airstrip | 45 hrefs preserved per viewport; zero requests |
| Launch | Held; no DNS, TLS, publishing, or indexing action |

The latest Party Pros external fixture remains recoverable outside the deployment package with SHA-256 `2e19d8c084a9cbcb6d5897e1ed7da0380274e96ee7e2662e4210a0c28459dd26`. Restoring it requires a separately approved deployment phase.
