# Media Asset Metadata Manifest

The backup contains 12 MediaAsset metadata records. The 9 records with expected blob inventory are the recovery-critical binaries.

| Safe file name | Title | Size bytes | License | Status | Usage status | Blob copied |
| --- | --- | ---: | --- | --- | --- | --- |
| `chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7.png` | Contact Quote Planning Review | 2253456 | `ai_generated` | `draft` | `needs_review` | false |
| `chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d.png` | Contact Setup Logistics Review | 2105292 | `ai_generated` | `draft` | `needs_review` | false |
| `chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd.png` | Contact Quote Planning Hero | 1923827 | `ai_generated` | `draft` | `needs_review` | false |
| `corporateicerinkrentalevent-18e985ca59bd.png` | Corporate Ice Rink Rental Event | 3685341 | `owned` | `draft` | `needs_review` | false |
| `holidayicerink-973ce7691377.png` | Holiday Ice Rink Rental | 3866376 | `owned` | `draft` | `needs_review` | false |
| `icerinkrentalssetup-113d218572e4.png` | Portable Ice Rink Setup | 3545952 | `owned` | `draft` | `needs_review` | false |
| `iceskatingrinkrentalslogo-0d1f970f0411.png` | Ice Rink Rentals Logo | 1627660 | `owned` | `draft` | `needs_review` | false |
| `partyproseastcoastlogo-cfd1fc9f60ae.png` | Party Pros East Coast Logo | 24434 | `partner_provided` | `draft` | `needs_review` | false |
| `winterfesticerinkrentals-324b1b89777d.png` | Winter Festival Ice Rink Rental | 3607110 | `owned` | `draft` | `needs_review` | false |

Additional metadata-only records:

| Record | Note |
| --- | --- |
| Phase 6K Test Asset | no recovery binary in expected 9-blob inventory |
| Phase 6L Test Media Asset | no recovery binary in expected 9-blob inventory |
| `ppec-wordmark-card-d28c10b570d1.png` | metadata exists, but not present in the 9-blob inventory |

Recovery result: media metadata is strong enough to rebuild references and owner review checklists. It is not enough to render images without binary recovery.

