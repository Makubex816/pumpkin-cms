# V2.8.61B Carryforward

V2.8.61B completed the Airstrip backup restore dry-run proof.

- Restore dry-run result: passed with documented gaps.
- Backup checksum entries validated: 61.
- Restore order plan steps: 15.
- Runtime no-regression: 17/17 GET-only.
- No live restore, deploy, DNS, contact POST, form submission, media upload/delete, or live mutation occurred.

V2.8.61C builds on this by adding the upstream intake/analyze layer for raw tenant package uploads.
