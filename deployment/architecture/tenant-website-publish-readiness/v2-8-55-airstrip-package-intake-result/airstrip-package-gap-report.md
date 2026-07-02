# Airstrip Package Gap Report

| gap | severity | packageEvidence | pumpkinImpact | ownerInputNeeded | nextPhaseResolution |
| --- | --- | --- | --- | --- | --- |
| Domain mismatch | high | Source mentions `www.airstriplasvegas.com`; target is `airstripclublasvegas.com` | Domains and canonical metadata cannot be created safely | Confirm target domain remains `airstripclublasvegas.com` and source domain should be replaced | Normalize domain in generated package draft |
| Tenant ID mismatch | high | Theme uses tenant ID `airstrip` | Live tenant IDs and form endpoints need stable identity | Approve final tenant ID | Generate tenant profile/domains/forms using approved ID |
| No static export | high | No HTML/output artifact detected | Exact visual proof cannot be static-passthrough now | Approve isolated source-build proof | V2.8.55A source-build/render proof |
| No V2.8.50 package contract | high | Required package files missing | Validator cannot pass | Approve conversion phase | Generate contract draft from source |
| Booking form not static-contact equivalent | high | `/api/forms/airstrip/submit/airstrip-reservation` | Needs FormDefinition and secure submit support | Confirm reservation fields and routing | Build FormDefinition mapping |
| Protected/config-looking file | medium | `.env.example` present | Secure values must stay outside repo | Provide secure handoff later | Secure handoff phase |
| Admin users missing | medium | No users module detected | Tenant creation cannot seed users | Provide admin user metadata and password source | Secure/public user package split |
| Publish/validation metadata missing | medium | No publish or expected routes files | Creation/publish proof incomplete | Approve expected route list | Generate `publish/static-site.json` and validation routes |
| Service-area/contact baseline mismatch | medium | No `/contact` or `/service-areas` routes | Baseline package contract needs equivalent mapping | Confirm route equivalents | Map `/request-booking`, `/custom-request`, and `/airstrip-the-club` |

