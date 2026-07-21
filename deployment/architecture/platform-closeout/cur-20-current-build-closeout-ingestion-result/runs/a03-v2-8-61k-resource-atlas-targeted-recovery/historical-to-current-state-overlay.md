# Historical-to-current state overlay

V2.8.61K statements are preserved as valid historical resource-map evidence. They are not automatically current operational state.

## Overlay statuses

| Statement | A03 overlay | Reason |
| --- | --- | --- |
| V2.8.61K mapped one Azure subscription, eight resource groups, and 29 Azure resources | `valid_at_time` | Recovered manifest and root report agree. |
| V2.8.61K classification was `post_integration_platform_resource_atlas_plain_text_resource_map_no_mutation` | `still_current_as_historical_classification` | Recovered result manifest confirms it. |
| V2.8.61K directed do-not-delete protection for named platform resources | `still_current` | A03 found no later decommission approval; live readback found required resources. |
| V2.8.61K App Service plan value was Basic B1 | `superseded_by` | Current readback and CRSTUR carryforward show S2 / two workers. |
| V2.8.61K non-Airstrip runtime proof passed 13/13 | `valid_at_time` | Manifest records `passed_13_of_13_get_only_non_airstrip`. |
| V2.8.61K Airstrip was frozen/not route-probed | `still_current_as_protection_boundary` | A03 did not probe Airstrip runtime and preserved frozen protection. |
| V2.8.61K starter app state did not include current CRSTUR starter deployment | `superseded_by` | CRSTUR/A01 carryforward records starter deployment `ecd75861-5600-4394-a20b-76202bead5c3`. |
| V2.8.61K did not establish the comprehensive Build Atlas | `still_current` | A03 classifies comprehensive Build Atlas inception as deferred to A04. |
| A02 said no complete active comprehensive Build Atlas was found | `still_current` | Correct for comprehensive operating Atlas; incomplete for Platform Resource Atlas distinction. |

## Current operational evidence

Read-only Azure metadata on `2026-07-21T02:09Z` found the required named resources and confirmed:

- App Service plan: `asp-pumpkin-api-prod-centralus-001`
- Current SKU: S2
- Current capacity: 2
- `rg-pumpkincms-stg-eastus-olm`: exists with 7 resources

CRSTUR/A01 deployment carryforward remains current documentary authority for:

- API deployment `c9451f4b-0b2e-44bc-9d08-ac9b767a6c05`
- rollback slot deployment `f6bdf0d7-ca60-4e7f-818c-f4c74a710a86`
- Admin deployment `8c960132-3521-45c7-9a16-d5265ddbb640`
- starter deployment `ecd75861-5600-4394-a20b-76202bead5c3`

No historical value was restored. No live value was changed.
