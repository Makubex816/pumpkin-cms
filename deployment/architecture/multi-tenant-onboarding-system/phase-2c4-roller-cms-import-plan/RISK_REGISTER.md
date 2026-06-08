# Risk Register

| Risk | Impact | Mitigation | Status |
| --- | --- | --- | --- |
| CMS import accidentally creates live pages | Public exposure before approval | Limit future import to draft/preview scope and hard stop before static/live gates | controlled by gate |
| CMS write happens without explicit approval | Unauthorized mutation | Separate CMS import execution approval with exact tenant/action/systems | hard stop |
| Owner placeholders remain unresolved | Import evidence lacks accountability | Resolve or explicitly accept placeholders before execution | open |
| Media placeholders mistaken for uploaded assets | Missing images or unauthorized MediaAsset writes | Import references/placeholders only; require separate media approval for writes/uploads | controlled by gate |
| Form delivery accidentally enabled | Unapproved email or live submissions | Keep `deliveryMode` as `no-email`; separate future form/email gate | hard stop |
| Search Console/indexing requested early | Premature crawling | Keep final indexing gate blocked | hard stop |
| Rollback owner missing | Failed import cannot be cleaned safely | Require rollback owner before execution | open |
| Package changes after validation | Import mismatches evidence | Re-run validation before execution if package changes | controlled by preflight |
| External systems requested inside CMS gate | Scope creep | Abort and request separate exact approval | hard stop |
| Raw generated output staged accidentally | Generated evidence clutter or leakage | Keep `.tmp` ignored and unstaged | controlled by checks |
| Protected config read requested | Secret exposure | Do not read protected config; abort if requested | hard stop |

## Highest Priority Risks

The highest priority risks are unauthorized CMS writes, accidental live-page publication, and premature Search Console/indexing actions.
