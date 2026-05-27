# Next Action Checklist

Complete this list before requesting CMS import.

## 1. Supply Business Values

- [ ] Final public phone or approved no-public-phone decision
- [ ] Phone display policy
- [ ] Final public email or approved no-public-email decision
- [ ] Email display policy
- [ ] Legal/business display name
- [ ] Primary service area wording
- [ ] Primary region wording
- [ ] Final quote CTA wording
- [ ] Approval for `/service-areas` as canonical
- [ ] Confirmation that future city pages use `/state-city`

## 2. Supply Raw Homepage Media

Place files in:

```text
content-review/ice-homepage-media-input/
```

- [ ] `CorporateIceRinkRentalEvent.png`
- [ ] `HolidayIceRink.png`
- [ ] `IceRinkRentalsSetup.png`
- [ ] `IceSkatingRinkRentalsLogo.png`
- [ ] `WinterFestIceRinkRentals.png`

## 3. Approve Media Assignments

- [ ] Site logo assignment and alt text
- [ ] Homepage hero assignment and alt text
- [ ] Corporate/event image assignment and alt text
- [ ] Holiday/shopping-center assignment and alt text
- [ ] Setup/logistics assignment and alt text
- [ ] Winter festival/community assignment and alt text
- [ ] Open Graph image/crop assignment and alt text
- [ ] Approval to create local MediaAsset records

## 4. Resolve Contact And Service Areas Media

- [ ] Provide contact page media or approve deferral/removal
- [ ] Provide service areas page media or approve deferral/removal
- [ ] Confirm no targeted city page is being created yet

## 5. Record Human Approvals

- [ ] Homepage copy
- [ ] Homepage design
- [ ] Contact page form
- [ ] Contact page copy
- [ ] Service areas copy
- [ ] SEO/meta
- [ ] Schema
- [ ] Media
- [ ] Phone/email policy

## 6. Request Technical Execution

After the checklist above is complete:

- [ ] Run MediaAsset upload/selection execution
- [ ] Bind real MediaAsset IDs into the candidate package
- [ ] Run .NET contract validation
- [ ] Run design/media/form/Tailwind/navigation validators
- [ ] Run unsafe scan and targeted secret scan
- [ ] Run admin import/export preflight
- [ ] Request explicit CMS import authorization only after preflight passes

