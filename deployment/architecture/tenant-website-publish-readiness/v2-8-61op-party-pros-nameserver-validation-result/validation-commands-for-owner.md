# Validation Commands For Owner

## Nameservers

```powershell
Resolve-DnsName -Name partyrentalphiladelphia.com -Type NS -Server 1.1.1.1
Resolve-DnsName -Name partyrentalphiladelphia.com -Type NS -Server 8.8.8.8
Resolve-DnsName -Name partyrentalphiladelphia.com -Type NS -Server 9.9.9.9
```

Expected:

```text
ns1-03.azure-dns.com
ns2-03.azure-dns.net
ns3-03.azure-dns.org
ns4-03.azure-dns.info
```

## Web And Verification

```powershell
Resolve-DnsName -Name partyrentalphiladelphia.com -Type A -Server 1.1.1.1
Resolve-DnsName -Name www.partyrentalphiladelphia.com -Type CNAME -Server 1.1.1.1
Resolve-DnsName -Name asuid.partyrentalphiladelphia.com -Type TXT -Server 1.1.1.1
Resolve-DnsName -Name asuid.www.partyrentalphiladelphia.com -Type TXT -Server 1.1.1.1
```

## No-Email

```powershell
Resolve-DnsName -Name partyrentalphiladelphia.com -Type MX -Server 1.1.1.1
Resolve-DnsName -Name partyrentalphiladelphia.com -Type TXT -Server 1.1.1.1
Resolve-DnsName -Name _dmarc.partyrentalphiladelphia.com -Type TXT -Server 1.1.1.1
```

Expected:

- MX `.` preference `0`;
- TXT `v=spf1 -all`;
- `_dmarc` absent unless owner later approves a DMARC policy.

## Azure Control Plane

```powershell
az network dns record-set list --resource-group rg-pumpkin-api-prod-centralus --zone-name partyrentalphiladelphia.com --query "[].{name:name,type:type,TTL:TTL,ARecords:ARecords,MXRecords:MXRecords,CNAMERecord:CNAMERecord,TXTRecords:TXTRecords}" -o json
```
