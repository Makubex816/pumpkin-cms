# V2.8.61ON Carryforward

Commit readback:

```text
d395f4bb Add V2.8.61ON Party Pros Azure DNS zone packet
```

Carryforward:

- Azure DNS zone `partyrentalphiladelphia.com` exists in `rg-pumpkin-api-prod-centralus`.
- Azure target nameservers are known and documented.
- Public nameservers remained Afternic.
- TXT `asuid`, CNAME `www`, and TXT `asuid.www` were staged.
- Apex A was pending in ON.
- No Bluehost/client registrar login, registrar DNS mutation, nameserver change, App Service hostname binding, TLS, deploy, publish, POST, Ice mutation, or Airstrip action occurred.

OO resolved the apex A record only.
