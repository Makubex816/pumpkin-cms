# Pumpkin Strip Club Near Me Vegas DNS Resume Runbook V2.8.62HP

Current state: `paused_pending_manual_nameserver_change`.

## Manual Customer Action

The customer or owner, not Codex, must replace the GoDaddy nameservers with all four values:

1. `ns1-03.azure-dns.com`
2. `ns2-03.azure-dns.net`
3. `ns3-03.azure-dns.org`
4. `ns4-03.azure-dns.info`

They must save confirmation screenshots outside the repository and complete the supplied V2.8.62I confirmation template. The template remains `manualChangeConfirmed: false` until that action occurs.

## Resume Gate

Do not resume based on elapsed time. Before V2.8.62I:

- obtain explicit owner/customer confirmation;
- verify all four entered nameservers exactly;
- preserve the `no_domain_email_currently` decision or document a migration decision;
- verify no parent DS/DNSSEC blocker appeared;
- confirm V2.8.62H and V2.8.62FRR remain committed;
- confirm shared runtime health.

## V2.8.62I Order

1. Read public NS and SOA through independent resolvers.
2. Require all four Azure nameservers to be publicly delegated.
3. Verify Azure authoritative A, CNAME, and TXT behavior.
4. Recheck no email or DNSSEC blocker.
5. Recheck shared runtime and tenant scope.
6. Only then evaluate separately approved custom-hostname binding and managed TLS actions.
7. Prove HTTPS after binding/TLS if those actions are approved.

No form POST, publication, indexing, or public-launch approval is implied by successful delegation. Rollback restores `ns49.domaincontrol.com` and `ns50.domaincontrol.com`; do not delete the Azure DNS zone during rollback.
