# Media Blob Readback Proof

Fresh readback was run against the existing media container only.

| Field | Value |
| --- | --- |
| Storage account | `iceskatingmedia` |
| Container | `party-pros-philadelphia-media` |
| Prefix | `party-pros-philadelphia/` |
| Blob count | `627` |
| Unique names | `627` |
| Duplicate name groups | `0` |
| Zero-byte blobs | `0` |
| Unknown-size blobs | `0` |
| Total bytes | `108264654` |
| First blob | `party-pros-philadelphia/assets/img/123_1001-300x225.jpeg` |
| Last blob | `party-pros-philadelphia/assets/img/zen-garden-1-285x300.jpg` |

The run used Azure CLI blob listing with Azure AD auth mode. It did not use storage keys, listKeys, or SAS.

