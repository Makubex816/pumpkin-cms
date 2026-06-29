# Cleanup Candidate Inventory

No cleanup action was performed.

| Candidate | Classification | Evidence | Required next approval |
| --- | --- | --- | --- |
| `rg-pumpkin-api-prod-eastus` | Safe candidate pending final confirmation | Resource count: 0 | Confirm no hidden dependencies, locks, or role assignments; approve delete |
| `rg-pumpkin-api-prod-eastus2` | Safe candidate pending final confirmation | Resource count: 0 | Confirm no hidden dependencies, locks, or role assignments; approve delete |
| `rg-ice-static-form-endpoint` | Requires confirmation | Running Function App, plan, storage remain | Confirm no traffic/dependency on legacy function stack; approve decommission |
| `func-ice-static-contact-20260605` | Requires confirmation | Running and enabled | Confirm public SWA bridge fully replaced this path |
| `iceforms20260605` | Requires confirmation | Function backing storage | Delete only with function stack decommission |
| `EastUSPlan` | Requires confirmation | Function App plan | Delete only with function stack decommission |
| `rg-pumpkincms-stg-eastus-olm` | Do not delete | Tagged staging OLM resources | Keep for staging lane unless separately retired |
| `DefaultResourceGroup-EUS` | Do not delete without owner confirmation | Default Log Analytics workspace | Owner review required |

Cleanup prompt should be separate from Admin/CMS implementation work.
