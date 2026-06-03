# PPEC Persistence Verification

```json
{
  "ok": true,
  "failedChecks": [],
  "checks": {
    "homepagePartnerBrand": true,
    "homepagePartnerTitle": true,
    "homepagePartnerCta": true,
    "homepagePartnerUrl": true,
    "contactPartnerBrand": true,
    "contactPartnerTitle": true,
    "contactPartnerCta": true,
    "contactPartnerUrl": true,
    "contactFaq": true,
    "noGenericEastCoastHome": true,
    "noGenericEastCoastContact": true
  }
}
```

Production-field persistence:

```json
{
  "homepage": {
    "ok": true,
    "checkedCount": 60,
    "missingCount": 0,
    "missing": []
  },
  "contact": {
    "ok": true,
    "checkedCount": 67,
    "missingCount": 0,
    "missing": []
  }
}
```

MediaAsset persistence:

```json
{
  "homepage": {
    "ok": true,
    "candidateIds": [
      "ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd",
      "ice-rink-rentals-holidayicerink-973ce7691377",
      "ice-rink-rentals-icerinkrentalssetup-113d218572e4",
      "ice-rink-rentals-iceskatingrinkrentalslogo-0d1f970f0411",
      "ice-rink-rentals-winterfesticerinkrentals-324b1b89777d"
    ],
    "readbackIds": [
      "ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd",
      "ice-rink-rentals-holidayicerink-973ce7691377",
      "ice-rink-rentals-icerinkrentalssetup-113d218572e4",
      "ice-rink-rentals-iceskatingrinkrentalslogo-0d1f970f0411",
      "ice-rink-rentals-winterfesticerinkrentals-324b1b89777d"
    ],
    "missing": [],
    "tenantPrefixed": true,
    "officialRecordCheckAvailable": true,
    "officialMissing": []
  },
  "contact": {
    "ok": true,
    "candidateIds": [
      "ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd",
      "ice-rink-rentals-holidayicerink-973ce7691377",
      "ice-rink-rentals-icerinkrentalssetup-113d218572e4",
      "ice-rink-rentals-iceskatingrinkrentalslogo-0d1f970f0411",
      "ice-rink-rentals-winterfesticerinkrentals-324b1b89777d"
    ],
    "readbackIds": [
      "ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd",
      "ice-rink-rentals-holidayicerink-973ce7691377",
      "ice-rink-rentals-icerinkrentalssetup-113d218572e4",
      "ice-rink-rentals-iceskatingrinkrentalslogo-0d1f970f0411",
      "ice-rink-rentals-winterfesticerinkrentals-324b1b89777d"
    ],
    "missing": [],
    "tenantPrefixed": true,
    "officialRecordCheckAvailable": true,
    "officialMissing": []
  }
}
```

Contact formBlock:

```json
{
  "ok": true,
  "checks": {
    "formBlockExists": true,
    "formKey": true,
    "sourcePage": true,
    "staticEndpointRef": true,
    "leadRecipientRef": true,
    "selectedMailboxMetadata": true,
    "emailSendingDisabled": true,
    "noCf7Runtime": true
  },
  "failedChecks": []
}
```
