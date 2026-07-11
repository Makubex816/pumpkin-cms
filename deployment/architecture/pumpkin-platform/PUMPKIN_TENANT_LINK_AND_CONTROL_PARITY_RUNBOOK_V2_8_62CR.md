# Tenant Link And Control Parity Runbook V2.8.62CR

1. Parse every HTML file independently before projecting redirects.
2. Inventory every anchor/area href and every visible control, including button-styled anchors, form fields, summaries, and role buttons.
3. Preserve raw href, query, fragment, label, target, rel, download state, and source context.
4. Resolve internal targets and fragments against physical source paths and normalized routes. A 200 response on the wrong page is a failure; compare title and H1.
5. Preserve intentional external hrefs. Browser proof must block navigation when external requests are not approved.
6. Map every control to one action class and one allowed disposition.
7. Exercise active local interactions with pointer/state proof. Where submission is prohibited, prove the no-POST adapter without invoking submission.
8. Count redirect-effective controls separately from physical controls.
9. Fail closed for any missing target, anchor, action, browser proof, unaccepted blocked item, or generic fallback.

Airstrip-specific rule: retain source hrefs statically and record zero clicks, probes, and requests unless a future owner phase explicitly approves otherwise.
