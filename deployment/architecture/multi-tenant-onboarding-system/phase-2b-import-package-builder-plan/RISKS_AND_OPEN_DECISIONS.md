# Risks And Open Decisions

## Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Builder hides too much technical detail | Operators may not understand generated package changes. | Include diff preview and operator detail mode. |
| Low-skill users paste secrets | Secret exposure risk. | Inline detection, immediate redaction, stop-and-ask flow, no secret storage. |
| Generated IDs change unexpectedly | Broken references across pages/media/forms. | Stable ID generation and rename warnings. |
| Manual approvals become stale | Owner approval may no longer match changed package. | Invalidate approval gates when related fields change. |
| Support packet leaks too much data | Privacy/security issue. | Redaction rules and no source-file copying by default. |
| External action confusion | Users may think export means launch. | Repeat hard stops in review, export, handoff, and support packet screens. |
| Deployment profile rules remain too broad | Package may pass general checks but miss profile-specific needs. | Defer profile smoke tests but show profile requirement acknowledgement. |

## Open Decisions

- Should Phase 2B1 be interactive prompts, answer-file driven, or both?
- Should failed draft package export be allowed for operators, or should only support packet export be allowed?
- Which UI framework should own the eventual Admin UI wizard?
- Should builder state live only as local files in Phase 2B1?
- What is the exact approval gate schema for stale approval invalidation?
- How should large page content blocks be represented before block schemas are finalized?
- Should safe media export copy image files, or only media manifest metadata?
- What retention period should apply to wizard audit logs and support packets?
