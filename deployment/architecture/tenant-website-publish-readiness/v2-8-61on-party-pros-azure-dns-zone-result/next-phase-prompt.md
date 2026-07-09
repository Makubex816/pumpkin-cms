# Next Phase Prompt

Approve V2.8.61OO Party Pros DNS Delegation Readiness Completion and Custom-Domain Binding Preflight only.

Use V2.8.61ON carryforward:

- Azure DNS zone `partyrentalphiladelphia.com` exists in `rg-pumpkin-api-prod-centralus`.
- Target Azure nameservers are `ns1-03.azure-dns.com.`, `ns2-03.azure-dns.net.`, `ns3-03.azure-dns.org.`, and `ns4-03.azure-dns.info.`.
- TXT `asuid`, CNAME `www`, and TXT `asuid.www` are staged.
- Apex A remains pending because starter App Service inbound IP metadata was unavailable.
- No registrar nameserver change, hostname binding, TLS, deploy, publish, contact POST, form submission, Ice mutation, or Airstrip action occurred.

Before any manual nameserver switch, provide the complete client DNS export or screenshots so MX, SPF, DKIM, DMARC, and verification records can be migrated to Azure DNS. Separately approve any registrar nameserver change, App Service custom-domain binding, managed TLS, Party Pros publish, and form/contact POST proof.

Do not log into Bluehost, mutate registrar DNS, change nameservers, bind Azure hostnames, create managed TLS, deploy/redeploy, publish Party Pros pages, submit forms, run contact POST, mutate Airstrip, mutate Ice, use storage keys/listKeys/SAS, read or print secrets/cookies/credentials, or stage generated artifacts unless explicitly approved in the next packet.
