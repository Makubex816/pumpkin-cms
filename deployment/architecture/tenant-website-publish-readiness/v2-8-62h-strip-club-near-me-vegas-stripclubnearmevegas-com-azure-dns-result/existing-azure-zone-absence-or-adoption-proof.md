# Existing Azure Zone Absence Or Adoption Proof

At `2026-07-14T00:06:38Z`, the active enabled subscription was searched for public `Microsoft.Network/dnszones` resources named `stripclubnearmevegas.com`.

- matching zone count before mutation: 0;
- target resource group: `rg-pumpkin-api-prod-centralus`, present in `centralus`;
- staged file count immediately before mutation: 0;
- decision: create exactly one approved public zone;
- adoption path: not used;
- conflicting ownership or record state: none.

One initial guarded create invocation stopped locally before Azure mutation because an empty JSON array was counted as a null element. A direct Azure query still returned `[]`; the corrected guard then performed the single zone creation.
