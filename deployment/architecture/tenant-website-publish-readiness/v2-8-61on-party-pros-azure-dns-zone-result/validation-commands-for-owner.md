# Validation Commands For Owner

## Current Public Delegation

```powershell
Resolve-DnsName -Name partyrentalphiladelphia.com -Type NS -Server 1.1.1.1
```

Expected before manual nameserver change:

```text
ns1.afternic.com
ns2.afternic.com
```

Expected after manual nameserver change:

```text
ns1-03.azure-dns.com.
ns2-03.azure-dns.net.
ns3-03.azure-dns.org.
ns4-03.azure-dns.info.
```

## Azure DNS Control-Plane Readback

```powershell
az network dns zone show --resource-group rg-pumpkin-api-prod-centralus --name partyrentalphiladelphia.com --query "{name:name, resourceGroup:resourceGroup, nameServers:nameServers, numberOfRecordSets:numberOfRecordSets}" -o json
az network dns record-set txt show --resource-group rg-pumpkin-api-prod-centralus --zone-name partyrentalphiladelphia.com --name asuid -o json
az network dns record-set cname show --resource-group rg-pumpkin-api-prod-centralus --zone-name partyrentalphiladelphia.com --name www -o json
az network dns record-set txt show --resource-group rg-pumpkin-api-prod-centralus --zone-name partyrentalphiladelphia.com --name asuid.www -o json
```

## Public DNS After Delegation

Run after propagation:

```powershell
Resolve-DnsName -Name asuid.partyrentalphiladelphia.com -Type TXT -Server 1.1.1.1
Resolve-DnsName -Name www.partyrentalphiladelphia.com -Type CNAME -Server 1.1.1.1
Resolve-DnsName -Name asuid.www.partyrentalphiladelphia.com -Type TXT -Server 1.1.1.1
```

## Apex A Pending Check

The apex A record is currently pending. After a future safe inbound IP is obtained and the A record is approved/created:

```powershell
Resolve-DnsName -Name partyrentalphiladelphia.com -Type A -Server 1.1.1.1
```

## Email Checks

Run only after email DNS records are provided and migrated:

```powershell
Resolve-DnsName -Name partyrentalphiladelphia.com -Type MX -Server 1.1.1.1
Resolve-DnsName -Name partyrentalphiladelphia.com -Type TXT -Server 1.1.1.1
Resolve-DnsName -Name _dmarc.partyrentalphiladelphia.com -Type TXT -Server 1.1.1.1
```
