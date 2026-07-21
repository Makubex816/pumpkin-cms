# Atlas authority and precedence matrix

## Immutable resource identity and historical protection

| Precedence | Source | A03 classification |
| ---: | --- | --- |
| 1 | Recovered original V2.8.61K package | authoritative historical resource-map baseline |
| 2 | Owner-supplied V2.8.61K analysis | secondary corroborating summary |
| 3 | Later committed resource-specific evidence | superseding only when explicit and scoped |
| 4 | Live readback | current existence/state evidence, not historical authorship |

## Mutable current operational state

| Precedence | Source | A03 use |
| ---: | --- | --- |
| 1 | Current live read-only Azure metadata | controls current existence/capacity where checked |
| 2 | Committed CRSTUR closeout | controls current identity/deployment carryforward |
| 3 | Committed CUR-20 evidence | controls A01/A02 discovery history |
| 4 | V2.8.61K historical state | valid at the time, superseded where later evidence exists |

## Artifact authority chain

| Sequence | Artifact | Type | Authority |
| ---: | --- | --- | --- |
| 1 | V2.8.61K | `PLATFORM_RESOURCE_ATLAS` | `AUTHORITATIVE_RESOURCE_MAP_BASELINE_AS_OF_61K` |
| 2 | Supplied v3 package | `COMPREHENSIVE_BUILD_ATLAS_BRIDGE` | `PROPOSED` |
| 3 | Working-memory v0.9 | `PRECLOSEOUT_WORKING_MEMORY` | `INPUT` |
| 4 | A04 successor | `COMPREHENSIVE_BUILD_ATLAS` | prospective only; not backdated |

## Bridge decision

A03 does not establish or activate the comprehensive Build Atlas. The supplied v3 bridge is preserved unchanged as a proposed structural input. A04 may establish the first canonical comprehensive Build Atlas prospectively and must import V2.8.61K as historical Platform Resource Atlas lineage.

## Conflict review

No unresolved V2.8.61K resource identity conflict was found. Historical B1 capacity is superseded by current S2/capacity-2 readback and CRSTUR carryforward; this is a normal temporal supersession, not an authority conflict.
