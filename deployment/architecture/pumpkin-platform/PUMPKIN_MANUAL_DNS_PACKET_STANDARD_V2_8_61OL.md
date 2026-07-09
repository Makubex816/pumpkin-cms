# Pumpkin Manual DNS Packet Standard V2.8.61OL

Date: 2026-07-09

## Required Sections

Every manual DNS/nameserver packet must include:

- current authoritative nameserver readback;
- selected nameserver strategy;
- target nameservers;
- statement of whether nameservers change or remain unchanged;
- exact DNS records if registrar-managed DNS is selected;
- Azure DNS zone status if Azure delegation is considered;
- validation commands;
- explicit no-mutation boundary for planning packets.

## Nameserver Rules

If registrar-managed DNS is selected and no nameserver change is approved, target nameservers equal current authoritative nameservers.

If Azure DNS delegation is selected, target nameservers must be the actual `nameServers` values from the correct Azure DNS zone.

If no Azure DNS zone exists, the packet must state that target Azure nameservers are unavailable and a separate Azure DNS zone creation/assignment phase is required.

Do not guess nameserver values.

Do not copy nameserver values from another tenant.

## Validation Commands

Use public DNS readback:

```powershell
Resolve-DnsName -Name <domain> -Type NS -Server 1.1.1.1
Resolve-DnsName -Name <domain> -Type A -Server 1.1.1.1
Resolve-DnsName -Name <domain> -Type TXT -Server 1.1.1.1
Resolve-DnsName -Name www.<domain> -Type CNAME -Server 1.1.1.1
```

Use Azure readback only:

```powershell
az resource list --resource-type Microsoft.Network/dnszones --query "[?name=='<domain>'].{name:name, resourceGroup:resourceGroup, id:id}" -o json
```
