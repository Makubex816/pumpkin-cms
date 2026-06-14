# No-Go Condition Display Plan

No-go display fields:

- code;
- severity;
- display state;
- message;
- blocked action;
- next gate;
- evidence refs;
- blocks future import flag.

Required displays:

- Roller `tenant_paused_no_import`;
- paused resume without approval;
- production mutation requested;
- indexing requested;
- missing owner approval;
- missing Backup Center evidence;
- missing Resource Registry refs;
- missing Runtime QA refs;
- protected config reference;
- secret-like marker.

No-go conditions must be shown as blockers, not buttons.
