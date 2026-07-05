# Next Phase Prompt

Approve V2.8.60V Airstrip DNS Application Verification and Controlled Custom-Domain Binding Cutover only.

Carry forward V2.8.60U:

- Domain Manager UI is deployed to production.
- SuperAdmin can view Airstrip DomainBinding and DNS packet.
- TenantAdmin is denied.
- Read-only DNS validation is available and currently pending.
- No DNS/custom-domain binding occurred in V2.8.60U.

V2.8.60V scope should remain separate and explicit:

- Confirm owner-applied Bluehost DNS records or separately approve controlled operator DNS changes.
- Run read-only DNS validation.
- Bind Azure custom domain only if DNS validation is correct and approval explicitly allows it.
- Add TLS only if approval explicitly allows it.
- Prove Airstrip production custom domain runtime.
- Do not run indexing/Search Console until a later final indexing gate.

Hard stops:

- No DNS mutation without explicit V2.8.60V DNS approval.
- No custom-domain binding without explicit V2.8.60V binding approval.
- No indexing/Search Console.
- No contact POST or form submission.
- No media/content mutation unless separately approved.
