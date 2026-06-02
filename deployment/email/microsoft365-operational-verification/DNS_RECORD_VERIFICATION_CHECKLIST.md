# DNS Record Verification Checklist

Use this checklist manually in Bluehost and Microsoft 365 admin center. Do not change DNS from code.

## Current Known State

- Microsoft 365 setup screen reported the domain email setup is all set to use email.
- DNS host: Bluehost.
- Verification TXT record added outside code:
  - Host/Name: `@`
  - TXT value: `MS=ms13281863`
  - TTL: `3600 / Bluehost 4 Hours`
  - Status: `added-at-bluehost`

The Microsoft verification TXT value is public DNS setup data, not a credential.

## Records To Verify Manually

- [ ] MX points to Microsoft 365 using the value from Microsoft 365 admin center.
- [ ] SPF TXT includes Microsoft 365.
- [ ] DKIM is enabled for `iceskatingrinkrentals.com`.
- [ ] DKIM records/selectors are published as Microsoft 365 requires.
- [ ] DMARC exists at `_dmarc.iceskatingrinkrentals.com`.
- [ ] Autodiscover CNAME exists if Microsoft asks for it.
- [ ] No accidental website DNS change happened during email setup.
- [ ] Old Bluehost under-construction A records are not treated as part of email verification.
- [ ] Future Azure website DNS can be changed later without changing Microsoft MX records.
- [ ] Other user-managed domains' Bluehost email records remain unchanged.

## Readiness Decision

- Domain verification TXT added: yes.
- MX/DNS production confidence: pending manual verification.
- Ready for production DNS changes by Pumpkin code: no.

Do not document passwords, tokens, Microsoft credentials, DNS-provider credentials, recovery codes, app passwords, or connection strings.
