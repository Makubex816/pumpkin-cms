# Pumpkin Tenant Domain Azure DNS Association Standard V2.8.62H

Every tenant public DNS zone must be unambiguously associated with one Pumpkin tenant and one primary domain before Azure mutation.

## Required Identity

Record and reconcile:

- tenant display name and immutable tenant ID;
- primary and WWW domains;
- Azure DNS zone name and resource group;
- a deterministic tenant/domain association ID;
- source-supported Pumpkin held-domain metadata;
- registrar and delegation state.

The Azure public zone name is the primary domain, not merely the tenant ID.

## Required Tags

Each tenant public zone carries:

- `managed-by`;
- `environment`;
- `pumpkin-tenant-id`;
- `pumpkin-primary-domain`;
- `pumpkin-www-domain`;
- `pumpkin-resource-role`;
- `pumpkin-association-id`;
- `delegation-state`.

Tags must contain no secrets. Conflicting ownership tags are a hard stop. Unrelated tags are preserved during safe adoption.

## Adoption And Creation

Search every visible approved subscription before mutation.

- zero matching zones: create one approved public zone;
- one matching zone: inspect identity, tags, SOA, NS, and all records before reconciling approved tags;
- multiple matching zones: stop without mutation.

Never delete a newly created or safely adopted zone automatically after a later failure. Preserve its assigned nameservers and document partial state.

## Result Contract

Repo-safe output records the zone resource ID, exact tags, creation/adoption state, four assigned nameservers, staged records, authoritative proof, public delegation state, and all held actions. Credentials, tokens, appsetting values, and registrar access material never enter the result.
