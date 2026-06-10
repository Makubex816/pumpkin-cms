# Security SEO And Accessibility Rules

## Security

- Reject URLs with embedded credentials.
- Do not store tokens, cookies, auth headers, or session identifiers.
- Do not crawl external URLs in this phase.
- Do not read protected config.
- Enforce tenant/site scope on every record and endpoint.
- Bulk actions require preview and reason.
- Audit all status and policy changes.

## SEO

- Link governance must not automatically decide SEO value.
- `nofollow` is a tenant policy decision.
- Disabled links should not emit clickable anchors in public output.
- Publication gates should flag unreviewed domains.
- Search Console/indexing is outside this phase.

## Accessibility

- Plain-text disabled rendering should preserve meaningful visible text.
- Hidden links must not leave confusing punctuation or empty controls.
- Disabled-state rendering must not use focusable anchors with invalid `href`.
- Fallback rendering should clearly preserve user intent where possible.
- Admin screens should expose status in text, not only color.
