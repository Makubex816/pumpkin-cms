# Domain DNS Policy

Status: no nameserver change, no DNS mutation approved.

Domain inputs:

- Apex domain: `partyrentalphiladelphia.com`.
- WWW domain: `www.partyrentalphiladelphia.com`.
- DNS strategy: registrar-managed-records.
- Nameserver change required: false.
- Custom-domain cutover requested: false.

Policy:

- Do not change nameservers.
- Do not mutate DNS records in V2.8.61OC.
- Do not create Azure hostname bindings in V2.8.61OC.
- Do not validate DNS in a way that mutates provider state.
- Future DNS packets may be generated only after explicit approval and must remain non-secret.
- Domain cutover requires separate owner approval after tenant creation, deploy readiness, responsive proof, and form/contact gating.

No DNS or custom-domain action occurred in this phase.

