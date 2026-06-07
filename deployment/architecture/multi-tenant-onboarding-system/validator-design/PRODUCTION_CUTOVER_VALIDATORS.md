# Production Cutover Validators

Pre-cutover validation:

- staging passed
- rollback plan exists
- DNS owner assigned
- hosting owner assigned
- media and form gates passed
- production smoke plan ready
- records that must not change are documented

Post-cutover validation:

- apex/primary approved routes return 200
- `www` behavior matches decision
- forbidden routes are absent
- media loads
- form preflight works
- sitemap/robots/canonical/noindex are correct
- no hidden review payloads

Production cutover validators must not perform DNS or hosting changes.

