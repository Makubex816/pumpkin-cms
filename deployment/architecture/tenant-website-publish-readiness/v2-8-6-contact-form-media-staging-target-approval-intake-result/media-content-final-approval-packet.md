# Media Content Final Approval Packet

Status: blocked; final owner approval required.

## Pages Requiring Approval

| Route | Source file | Approval needed |
| --- | --- | --- |
| `/` | `home.json` | Hero, trust bar, card grid, how-it-works, FAQ, primary CTA, SEO metadata |
| `/service-areas` | `service-areas.json` | Service-area copy, card grid, FAQ, CTA, schema metadata |
| `/contact` | `contact.json` | Contact copy, form fields, planning prompts, FAQ, CTA, SEO metadata |

## Media State

The safe source review did not find production media asset URL fields in the three Ice page files. The validators still enforce:

- no local `/media/ice-rink-rentals/` URLs in output
- no base64 image payloads
- no placeholder/fake media URLs
- image URLs must use `https://media.iceskatingrinkrentals.com/` when present

## Required Approval

Owner must approve:

- final page copy
- form copy and fields
- CTA wording
- SEO metadata and canonical route model
- absence or presence of media assets for this staging candidate
- exclusion of obsolete routes `/ice-rink-rentals` and `/events-holiday-activations`
