# Shared Resource Plan

The tenant should use the existing Pumpkin shared-resource model.

| Capability | Planned resource model | V2.8.62A action |
| --- | --- | --- |
| Pumpkin API | existing shared production API | none |
| CMS data | existing shared Cosmos database with tenant-scoped records | none |
| Starter runtime | existing shared starter host | none |
| Admin control plane | existing standalone Admin UI and tenant-scoped authorization | none |
| Media account | existing shared media storage account | none |
| Media container | `strip-club-near-me-vegas-media` | planned, not created |
| Domain | apex and `www` metadata for later binding | recorded only |
| Form pipeline | shared Pumpkin FormDefinition/FormEntry pipeline | local draft only in next phase |

No new App Service, storage account, Cosmos account/database, DNS zone, certificate, or other Azure resource is required for the planned model.

Future tenant/media creation must prove tenant absence immediately before mutation, use tenant-scoped paths, read back every created object, and preserve Ice, Party Pros, and Airstrip boundaries.
