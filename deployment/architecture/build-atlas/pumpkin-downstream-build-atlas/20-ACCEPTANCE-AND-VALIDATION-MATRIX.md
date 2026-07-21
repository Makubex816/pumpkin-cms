# Acceptance and Validation Matrix

## Upstream intake

- exact head, tree, parents, and ancestry captured;
- immutable references protected;
- source archive/bundle hashes match;
- clean-room build and explicit tests pass;
- no deploy ZIP, secrets, or private control-plane source in package.

## CAPTCHA

- public resolution exposes only public configuration;
- server verification mandatory when required;
- action and production hostname match;
- expired/replayed tokens rejected and client reset;
- provider/network failures classified and recoverable;
- raw tokens/secrets absent from storage and logs;
- duplicate browser/network attempts create no duplicate FormEntry;
- multi-instance limits/idempotency hold;
- every tenant receives independent configuration/proof status.

## Visual editor

- all known and unknown blocks serialize without loss;
- missing IDs are backfilled deterministically once;
- edit/insert/move/duplicate/delete/save/reload works;
- disabled-block behavior is explicit;
- draft/publish and nested slugs preserve routing;
- navigation nesting/order/visibility and logo media persist;
- optimistic conflict prevents silent lost updates;
- revalidation is checked and public runtime read back;
- preview cannot perform live writes or unauthorized navigation;
- TenantAdmin/SuperAdmin tenant scopes are proven;
- rollback preserves content.

## Universal forms/leads

- every live form maps to an active FormDefinition;
- successful logical submission creates exactly one FormEntry;
- entry is tenant scoped and cross-tenant inaccessible;
- TenantAdmin and SuperAdmin inbox behavior matches roles;
- export/status audit works;
- notification failure leaves persistence intact;
- status dimensions remain independent.

## Package/chat migration

- current build closeout ingested without contradiction;
- live Atlas bridged rather than replaced;
- evidence references resolve;
- schemas and cross-references validate;
- CHAT-PACK and ZIP match manifest/checksum;
- receiving chat identifies authority, current state, blockers, budgets, and first safe gate.
