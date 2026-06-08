# Error Recovery And Troubleshooting UX

## UX Goals

- Keep errors calm and specific.
- Explain what happened without blame.
- Link each error to the screen and field that can fix it.
- Show the JSON path only as secondary operator detail.
- Make stop points obvious.

## Error Pattern

Each error should show:

- what needs attention
- why it matters
- how to fix it
- who should confirm it
- whether export is blocked

## Common Recovery Flows

| Situation | Builder response | User action |
| --- | --- | --- |
| Missing required field | Highlight field and explain why it matters. | Fill the field or assign an owner. |
| Bad JSON-generation input | Keep the user in the form, not raw JSON. | Fix the form value. |
| Tenant/site mismatch | Show all identity fields together. | Ask operator which ID is correct. |
| Route without page | Offer to create page placeholder or remove route. | Choose one after content owner confirms. |
| Page route not approved | Offer to add route to approved list or change page route. | Confirm with content owner. |
| Unknown media reference | Show affected page and media selector. | Add media item or choose existing media. |
| Unknown form reference | Show affected page and form selector. | Add form item or choose existing form. |
| Local/staging URL | Explain it cannot launch. | Replace with public production URL or remove. |
| Secret-like value | Redact immediately and stop. | Ask operator/security; do not paste the value. |
| SEO noindex conflict | Explain crawl setting mismatch. | Ask SEO/content owner before changing. |

## Troubleshooting Views

- "Fix now" view grouped by screen.
- "Operator detail" view grouped by gate and JSON file.
- "Support packet" view with redacted export.
- "Stop and ask for help" view for dangerous items.

## Hard Stop Copy

Use direct language:

```text
Stop here. This looks like a private credential or token. Remove it from the package and ask an operator for help. Do not paste it into chat, email, tickets, or documentation.
```
