# Current-system chat migration checklist

Do not load the v3 package into the current system chat as current runtime truth until every item passes.

- [ ] Current build closeout received and schema-valid.
- [ ] Source/deployment/runtime contradictions resolved.
- [ ] Active Atlas located, backed up, and merged.
- [ ] Upstream rechecked and immutable snapshot recorded.
- [ ] Clean-room qualification result attached.
- [ ] CAPTCHA and visual-editor overlap decisions updated against active downstream source.
- [ ] `02-CURRENT-STATE.json` regenerated from evidence.
- [ ] `05-RESUMPTION-CAPSULE.md` identifies the exact next safe gate.
- [ ] `generated/CHAT-PACK.md` regenerated.
- [ ] Package validation, checksums, and ZIP integrity pass.
- [ ] No credentials, FormEntries, private source, customer data, deployment ZIPs, or browser profiles included.

The receiving chat must return `READY`, `READY_WITH_WARNINGS`, or `BLOCKED` and enumerate authority, freshness, budgets, hard stops, and first safe gate before acting.
