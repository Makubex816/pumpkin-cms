# Risk Register

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Secrets leak into standard backup | credential exposure | fail-closed scans; standard backup schema forbids escrow payloads |
| Escrow treated as optional add-on | recovery flow unsafe later | implement escrow request/recipient models in the main build path |
| Backup artifact written to public/static directory | public data exposure | private storage policy and path validation |
| Browser request times out during large export | incomplete artifact | queued worker architecture |
| Database export inconsistent | restore mismatch | consistent export mode and validation |
| Restore goes directly to production | production damage | sandbox-first restore validation hard stop |
| Escrow recipient private key mishandled | recovery compromise | store only public-key metadata; custody outside git |
| Audit logs contain secret values | secondary exposure | structured log allowlist and redaction tests |
| Retention cleanup misses escrow artifacts | prolonged exposure window | shorter escrow retention and cleanup audit |
| Support packet includes escrow payload | secret exposure | support-packet compatibility explicitly excludes escrow |

## Current Risk Level

Architecture risk is low after Phase 2F-1. Execution risk remains high until implementation, validation, and owner approval are complete.
