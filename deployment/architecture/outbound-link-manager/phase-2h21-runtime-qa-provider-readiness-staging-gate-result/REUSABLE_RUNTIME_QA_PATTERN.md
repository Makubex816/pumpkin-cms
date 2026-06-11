# Reusable Runtime QA Pattern

Reusable helper:

```text
apps/admin/scripts/runtime-qa-harness.mjs
```

Module plug-in contract:

- define target route/surface/service
- define marker groups for route wiring, UI affordances, provider-state messaging, and type contracts
- define local source roots to scan
- write evidence to ignored `.tmp`
- keep local/offline and fake-provider modes as defaults
- keep live-readonly and future live-write-approved behavior explicit
- fail on uncontrolled write-call or protected config patterns

The Outbound Link Manager Phase 2H-21 check is the first consumer of this reusable pattern.

