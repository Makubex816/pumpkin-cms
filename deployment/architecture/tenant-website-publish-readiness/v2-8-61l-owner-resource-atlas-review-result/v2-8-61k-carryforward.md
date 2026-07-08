# V2.8.61K Carryforward

Source phase: V2.8.61K Platform Resource Atlas.

Commit: `61357bee Add V2.8.61K platform resource atlas`.

Facts carried forward:

- 1 accessible Azure subscription.
- 8 resource groups.
- 29 Azure resources.
- Production core resources are mapped.
- Ice tenant is live on apex and www custom domains.
- Airstrip tenant resources are mapped but frozen.
- Starter app is local-only and not deployed.
- Production Cosmos, media storage, monitoring, and do-not-delete registers are mapped.
- Non-Airstrip runtime proof passed 13/13 in V2.8.61K.
- No raw secrets were written to the atlas.

Limits carried forward:

- Atlas was read-only.
- Atlas did not prove authenticated CMS workflows.
- Atlas did not prove Airstrip custom-domain cutover.
- Atlas did not prove contact/form/customer-facing POST.
- Atlas did not approve cleanup or deletion.
- Atlas did not prove new deployment readiness.
