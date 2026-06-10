# Render Policy Resolution

Decision precedence:

1. Unknown instance or link becomes plain text and fails validation.
2. Domain-blocked links render as `domain_blocked_plain_text`.
3. Pending-review links render as `pending_review_plain_text` unless a local render policy explicitly allows active pending-review links.
4. Hidden instances or hidden fixture mode render no visible markup.
5. Plain-text instances or plain-text fixture mode render escaped text.
6. Fallback instances or fallback fixture mode render `fallback_anchor` only when the fallback URL is safe and normalized.
7. Disabled or stale instances render `disabled_span`.
8. Disabled, archived, stale, or broken-unverified links render `disabled_span`.
9. Active links with enabled instances render `active_anchor`.

Active and fallback anchors include `rel="noopener noreferrer"` and use `target="_blank"` unless a local render policy disables new-tab behavior.
