# Next Phase Prompt

Approve the next Airstrip domain cutover or post-repair review phase only after reviewing V2.8.60X.

Carryforward:

- Airstrip production default host: `https://app-airstrip-prod-centralus-001.azurewebsites.net`
- `/airstrip-the-club` responsive overflow blocker is repaired.
- Production responsive replay passed 28/28 with zero overflow.
- Production default-host routes `/`, `/request-booking`, `/packages`, and `/airstrip-the-club` return HTTP 200.
- Ice/platform GET-only no-regression passed 17/17.
- Visual artifacts exist outside repo under `C:\Users\User\Desktop\PumpkinCMS\visual-review\v2-8-60x-airstrip-club-info-responsive-repair\`.

Allowed only with separate approval:

- Bluehost DNS mutation.
- Azure custom-domain binding.
- Nameserver changes.
- Azure DNS zone creation.
- Google Workspace email DNS activation.
- CDN/Front Door.
- Search indexing action.
- Contact POST, form submission, or customer-facing POST proof.

Do not read password hardcopy content or secure handoff secrets.
