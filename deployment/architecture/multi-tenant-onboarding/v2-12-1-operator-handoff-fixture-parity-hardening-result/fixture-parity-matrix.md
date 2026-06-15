# Fixture Parity Matrix

| Parity check | Ice result | Roller result |
| --- | --- | --- |
| Required handoff fields present | Pass, 26 fields | Pass, 26 fields |
| Package hash matches canonical evidence | Pass, V2.11.7A/V2.11.8 hash | Pass, paused package hash |
| Approval manifest ID | Pass | Pass, intentionally null |
| Execution run ID | Pass | Pass, intentionally null |
| Target mode | Pass, `local_scoped_import_execution` | Pass, `blocked_no_import_no_resume` |
| Entity mappings | Pass, `10` | Pass, `0` |
| Readback route count | Pass, `3/3` | Pass, not executed |
| Readback content count | Pass, `4/4` | Pass, not executed |
| Readback media count | Pass, `1/1` | Pass, not executed |
| Readback form config count | Pass, `1/1` | Pass, not executed |
| Tenant state | Pass, scoped local import/readback | Pass, paused/no-import/no-resume |
| Google indexing | Pass, deferred hard stop | Pass, deferred hard stop |
| OLM 2H-23A | Pass, separate carryforward only | Pass, separate carryforward only |
| Protected config references | Pass, none | Pass, none |
| Secret-like values | Pass, none | Pass, none |
| Compressed archive request | Pass, none | Pass, none |

Invalid fixtures prove the validator catches package hash mismatch, readback mismatch, Roller resume requested, secret-like marker, protected-config marker, archive request, and indexing request.
