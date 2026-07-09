# Backup Tooling Generalization

The V2.8.61OF exporter is tenant-parameterized through secure configuration rather than hardcoded Party Pros record values.

Generalized inputs:

- API base URL and login endpoint
- Tenant ID/name/business metadata
- Expected page/media/form/theme counts
- Shared media account/container/prefix mapping
- Source ZIP and compiled package artifact paths
- Outside backup output folder
- Approval flags

The proof wrapper still enforces the approved V2.8.61OF backup output folder to prevent accidental writes outside the authorized handoff root.

Existing Ice/Airstrip backup proof paths were kept intact; V2.8.61OF added a separate exporter path.
