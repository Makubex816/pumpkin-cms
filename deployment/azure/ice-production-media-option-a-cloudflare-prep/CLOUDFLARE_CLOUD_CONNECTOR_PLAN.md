# Cloudflare Cloud Connector Plan

## Candidate

Cloudflare Cloud Connector is a candidate for routing `media.iceskatingrinkrentals.com` traffic to Azure Blob Storage.

## Azure Host

```text
iceskatingmedia.blob.core.windows.net
```

## Required Condition

The Azure Blob container must be publicly readable before Cloud Connector can serve the content.

Current Phase 1 result:

```text
account allowBlobPublicAccess: true
container publicAccess: null
direct public URL status for all 9 files: 404
```

## Future Rule Intent

Match:

```text
https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/*
```

Route to:

```text
https://iceskatingmedia.blob.core.windows.net/ice-rink-rentals-media/ice-rink-rentals/assets/*
```

## Not Done

No Cloud Connector rule was created.

