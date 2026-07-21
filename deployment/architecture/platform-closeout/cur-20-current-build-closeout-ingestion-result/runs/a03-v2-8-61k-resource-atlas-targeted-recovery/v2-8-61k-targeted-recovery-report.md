# V2.8.61K targeted recovery report

## Search boundary

A03 did not repeat the broad A02 parent-workspace audit. It ran a bounded recovery pass using exact owner-provided identifiers:

- `V2.8.61K`
- `V2_8_61K`
- `post_integration_platform_resource_atlas_plain_text_resource_map_no_mutation`
- `Platform Resource Atlas`
- `current resource map baseline`
- `app-pumpkin-api-prod-centralus-001`
- `swa-ice-static-staging`
- `cosmos-pumpkin-prod-eastus`
- `rg-pumpkincms-stg-eastus-olm`

## Original package recovered

The original V2.8.61K package was recovered from the active Git repository.

| Evidence | Value |
| --- | --- |
| Result package path | `deployment/architecture/tenant-website-publish-readiness/v2-8-61k-platform-resource-atlas-result/` |
| Root report | `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_61K_PLATFORM_RESOURCE_ATLAS_REPORT.md` |
| Commit | `61357bee8dea1c0c9d07b52e16389975d7b764be` |
| Parent | `0431a211c37350468f11336a70132c5a7ab9916b` |
| Commit date | `2026-07-07T19:40:18-04:00` |
| Commit subject | `Add V2.8.61K platform resource atlas` |
| Git state | tracked in current branch |
| Result package files | 21 |
| Durable platform docs | 4 |
| Result manifest SHA-256 | `3068c2a69c20857c2ac9fcb316f252fa430501923a9f3eb59ef9ca1e1c7c73d1` |
| Result package file-list digest | `ef9625b0d63b1b66b557bb42a2e7435c0be05e9c05ead361a17703ff4935f4a6` |

## Original manifest facts

The recovered `result-manifest.json` records:

- phase: `V2.8.61K`
- status: `completed`
- classification: `post_integration_platform_resource_atlas_plain_text_resource_map_no_mutation`
- Azure read-only resource count: 29
- resource group count: 8
- runtime no-regression: `passed_13_of_13_get_only_non_airstrip`
- Airstrip frozen: true
- live mutation occurred: false
- deploy occurred: false
- raw secrets written: false

## Recovered file checksums

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_61K_PLATFORM_RESOURCE_ATLAS_REPORT.md` | 5,965 | `3d3a06dd190d30c967ef99584dd02d59701c3029bb831ee8928c4b8a4184ea3c` |
| `PUMPKIN_PLATFORM_RESOURCE_ATLAS_V2_8_61K.md` | 4,909 | `f6ecb0906c4da529ba4d3f406415b6079cd597e784f4c4538da691e6675f5eab` |
| `PUMPKIN_DO_NOT_DELETE_RESOURCE_REGISTER_V2_8_61K.md` | 3,208 | `b394bce10e29e50c9b31834c2cb25d5b1dc5891e951d7749c22160b10caad2d5` |
| `PUMPKIN_RESOURCE_BINDING_LEDGER_V2_8_61K.md` | 9,840 | `6610e13461750589646a2a1b678409b995fb7387480f3cae1a01e06ceef3d115` |
| `PUMPKIN_TOP_DOWN_RESOURCE_MAP_V2_8_61K.md` | 1,972 | `8059968b08de5f964a3318d5450e3189688a226777abc175856535561e93455e` |
| `PLAIN_TEXT_RESOURCE_MAP_V2_8_61K.txt` | 8,784 | `8a42b8bf2c00806fbd29cd7320c7201112bb7b36e6b80cb9b1af815fc1ae8b2b` |

## Other search legs

| Leg | Result |
| --- | --- |
| Git refs/history | recovered tracked paths and adding commit |
| Reflog | matched the adding commit twice |
| Safe unreachable commit metadata | 3 sampled unreachable commits, no V2.8.61K matches |
| Archive central directories | 134 archives inspected, 0 targeted V2.8.61K matches |
| Secure handoff metadata filename pass | 0 targeted matches |
| Owner-supplied analysis | verified as secondary summary, not original |

## Recovery conclusion

`originalV2_8_61KPackage`: `recovered_from_git`

The original package is not an archive; it is a committed repo result package plus durable resource docs. It is preserved unchanged.
