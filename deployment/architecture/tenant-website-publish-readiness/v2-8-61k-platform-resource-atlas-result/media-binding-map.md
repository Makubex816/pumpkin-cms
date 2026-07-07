# Media Binding Map

Production media account:

| account | container | tenantOrSystem | publicAccess | lastModifiedUtc | purpose | doNotDeleteStatus |
| --- | --- | --- | --- | --- | --- | --- |
| iceskatingmedia | ice-rink-rentals-media | ice-rink-rentals | blob | 2026-06-05T14:11:32Z | Ice production website media | do_not_delete |
| iceskatingmedia | airstrip-club-las-vegas-media | airstrip-club-las-vegas | blob | 2026-07-03T01:31:12Z | Airstrip production/default-host media | do_not_delete_airstrip_frozen |

Storage protection state for `iceskatingmedia`:

- Blob soft delete: enabled, 30 days.
- Container soft delete: enabled, 30 days.
- Blob versioning: enabled.
- Change feed: enabled.

Legacy/support storage containers:

| account | containers | purpose | status |
| --- | --- | --- | --- |
| iceforms20260605 | azure-webjobs-hosts; azure-webjobs-secrets; function-releases; scm-releases | legacy static contact function support | do_not_delete_until_dependency_proof |
| pumpkincmsstgolm01 | backup-center-staging; resource-registry-staging; runtime-qa-staging | older staging support | cleanup_candidate_needs_dependency_proof |

No media upload, delete, copy, or mutation occurred in V2.8.61K.
