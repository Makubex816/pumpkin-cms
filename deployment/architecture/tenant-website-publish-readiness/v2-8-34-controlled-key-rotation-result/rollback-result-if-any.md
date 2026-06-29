# Rollback Result

Rollback performed: yes.

Reason:

The single isolated verification POST returned HTTP 400 and Admin readback did not find the trace after 5 polls.

Rollback actions:

- Tenant auth record restored: yes.
- Isolated Static Web App key binding restored: yes.
- Production appsettings restored: not applicable, production was not touched.
- Additional isolated POST sent after rollback: no.
- Production POST sent after rollback: no.

Rollback classification:

`isolated_verification_failed_http_400_rollback_complete`
