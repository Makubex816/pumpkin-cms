# Risk And Open Decisions

Open decisions after V2.9 closeout:

- Google/Search Console/indexing remains deferred by hard stop.
- Live provider integration remains unapproved.
- CMS/provider writes remain unapproved.
- Electron runtime remains a future separate boundary.
- Future deployment/redeployment, DNS, and custom-domain actions remain unapproved.
- Full hydrated browser-executed API-backed Admin mode with a live Admin auth browser session was not run; local HTTP and scoped harness verification passed.
- The next platform lane is a recommendation only until the owner approves it.

Residual risks:

- Browser automation coverage for the API-backed Admin mode would provide additional confidence if a future safe browser-auth harness is approved.
- The current API-backed data source remains fixture-backed, so future live provider work must introduce separate write/read boundaries and tests.

No V2.9 closeout blocker remains inside the approved local/read-only scope.
