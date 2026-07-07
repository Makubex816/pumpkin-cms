# Resource DomainBinding Restore Plan Proof

Status: passed with documented metadata gap.

Resource metadata present:

- Airstrip production default host.
- Airstrip runtime App Service reference.
- Airstrip media storage/container/public base.
- Pumpkin API host reference.
- Admin UI host reference.
- DomainBinding metadata.

Documented gap:

- Airstrip isolated preview host is not recorded in the V2.8.61A resource metadata.

Restore policy:

- DomainBinding records must restore as pending/non-live.
- DNS, custom-domain binding, hostname binding, nameserver changes, and indexing require separate explicit approval.
- No connection string, key, or SAS is required for dry-run restore planning.
