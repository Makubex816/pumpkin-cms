# Outbound Link Entity Model

An outbound link is the managed canonical representation of an external URL.

## Normalization Rules

Normalization is for comparison and policy matching. It must be deterministic and must not call the external URL.

Proposed rules:

- Parse only absolute `http` and `https` URLs.
- Lowercase scheme and host.
- Remove default ports.
- Preserve path case unless a later tenant policy says otherwise.
- Remove fragment by default for registry matching, while preserving original URL on instances.
- Sort query parameters only if a future policy enables it.
- Reject URLs with embedded credentials.
- Store `original_url` separately from `normalized_url`.

## Domain Extraction

The `domain` field is the lowercase hostname from `normalized_url`. It is used for search, filtering, policies, and bulk actions.

Domain matching should support exact domains first. Wildcard or suffix rules require a later explicit design because they can create overbroad disables.

## Status Semantics

`active`: link may render if the instance is enabled.

`disabled`: link should not render as a clickable anchor unless an explicit privileged preview mode is used.

`pending_review`: link discovered but not approved according to tenant policy.

`domain_blocked`: link is disabled by a blocked-domain policy.

`stale`: registry entry has no currently detected active instance.

`broken_unverified`: non-crawling signal suggests the URL may be broken. The system has not crawled the target.

`archived`: hidden from default operator views but retained for audit and restore history.

## Ownership

`created_by`, `disabled_by`, and audit records must use non-secret actor identifiers. Do not store tokens, auth headers, cookies, or session identifiers.
