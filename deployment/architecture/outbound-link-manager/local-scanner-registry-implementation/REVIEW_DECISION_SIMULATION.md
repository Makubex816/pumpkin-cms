# Review Decision Simulation

Review decision fixtures use `approve_review`, `block_review`, or `ignore_review`.

The simulator selects a link by stable target data such as domain or normalized URL, records the review decision, updates link status in the sandbox copy, writes a local audit entry, and computes affected instances and pages.

Decision mapping:

- `approve_review` sets the link to `active` and records `review_decision: approved`
- `block_review` sets the link to `domain_blocked` and records `review_decision: blocked`
- `ignore_review` keeps the link in `pending_review` and records `review_decision: ignored`

No CMS page, renderer, API, database, or live provider is updated.
