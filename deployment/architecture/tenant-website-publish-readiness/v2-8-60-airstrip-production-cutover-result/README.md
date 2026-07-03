# V2.8.60 Airstrip Production Cutover Result

Status: `production_default_host_live_bluehost_dns_owner_action_required`.

Airstrip production is live on the App Service default host:

`https://app-airstrip-prod-centralus-001.azurewebsites.net`

Custom-domain binding was not attempted because read-only DNS checks showed the Bluehost-hosted apex and www records do not currently point to the App Service target and ownership TXT records are absent.

The exact Bluehost DNS packet is recorded in `bluehost-dns-record-packet.md`.

Indexing remains excluded. No contact POST, form submission, media upload/delete, storage key/listKeys, SAS, connection string generation, Key Vault query, DNS registrar mutation, nameserver change, Azure DNS zone creation, Google Workspace email DNS activation, CDN/Front Door action, or Ice mutation occurred.
