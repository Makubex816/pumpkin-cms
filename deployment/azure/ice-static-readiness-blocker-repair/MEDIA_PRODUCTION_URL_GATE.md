# Media Production URL Gate

## Required Production Media Domain

Future production media URLs must use:

```text
https://media.iceskatingrinkrentals.com
```

## Local Preview Policy

Local runtime preview may continue to use `/media/ice-rink-rentals/...` while local CMS/media serving is active.

Static production readiness is different: deployable static packages must not contain local-dev `/media/...` URLs.

## Validator Behavior

Static snapshot/publish validation now fails for approved production Ice pages if:

- local `/media/...` URLs remain
- base64 image payloads are present
- placeholder/fake media URLs are present
- unapproved external image URLs are present
- a MediaAsset reference has no production public URL

Static output and staging package validators also scan generated text/HTML artifacts for local media URLs, base64 images, placeholder URLs, and unapproved image URLs.

## Remaining Gate

Production media readiness remains no until approved media binaries are published to Blob/Cloudflare URLs and MediaAsset records are updated in a separately authorized task.

