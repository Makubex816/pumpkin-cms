# Scoped Write Action Result

The local package now accepts API-shaped write preflight requests and maps them to approved local action simulations.

Supported action families:

- review queue decisions
- link status changes
- instance status changes
- policy updates
- scan-run creation
- bulk domain actions
- bulk page instance actions
- restore prior status

Approved local/fake actions write cloned sandbox output only. Blocked actions still write trace and rollback evidence without mutating a sandbox store.
