# Next Cloudflare Execution Prompt

Use this only after direct Azure Blob public URLs return `200` for all 9 approved media files.

```text
Approve Option A Cloudflare execution for Ice media only: configure media.iceskatingrinkrentals.com in Cloudflare, route/rewrite /ice-rink-rentals/assets/* to the Azure Blob origin path including /ice-rink-rentals-media/, configure media cache behavior for checksum-versioned images, and validate the 9 target public media URLs. No CMS writes, no MediaAsset writes, no deployment, no email/M365, and Roller remains paused.
```

