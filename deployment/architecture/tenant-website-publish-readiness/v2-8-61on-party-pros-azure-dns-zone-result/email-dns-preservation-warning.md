# Email DNS Preservation Warning

## Status

Email DNS preservation is unresolved.

No owner/client DNS export was provided in ON.

No MX, SPF, DKIM, or DMARC records were created in the Azure DNS zone.

## Risk

If the owner/client changes nameservers to Azure before email records are migrated, email delivery and domain verification can break.

Current public TXT readback under Afternic shows `v=spf1 -all`, but public DNS readback cannot enumerate private Bluehost/client dashboard records or prove the complete email setup.

## Required Before Nameserver Switch

Before any registrar nameserver change:

- obtain complete client DNS export or screenshots;
- identify all MX records;
- identify SPF TXT records;
- identify DKIM TXT/CNAME records;
- identify DMARC TXT records;
- identify any third-party verification TXT/CNAME records;
- create exact matching records in Azure DNS;
- validate against Azure DNS before delegation.

Do not claim email is preserved until those records are migrated and validated.
