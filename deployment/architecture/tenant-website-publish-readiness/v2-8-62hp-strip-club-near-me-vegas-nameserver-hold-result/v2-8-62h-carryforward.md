# V2.8.62H Carryforward

V2.8.62H is committed at `9dd72fb3f52eb017616f566620f38ca17e1bccf7` with message `Preprovision Vegas Azure DNS zone`.

Fresh HPR readback confirmed:

- subscription `ff887def-fd83-4a19-9298-13d4b1687873`;
- exactly one `stripclubnearmevegas.com` Azure DNS zone in `rg-pumpkin-api-prod-centralus`;
- resource ID and all eight tenant/domain/role/delegation tags unchanged;
- all four Azure-assigned nameservers unchanged;
- apex A `20.118.48.17`, `www` CNAME to the starter host, and both verification TXT records present at TTL 300;
- the two TXT values were not printed and matched by safe SHA-256;
- public delegation remains on DomainControl;
- zero Vegas hostname bindings and zero Vegas certificates.

No H historical evidence was modified.
