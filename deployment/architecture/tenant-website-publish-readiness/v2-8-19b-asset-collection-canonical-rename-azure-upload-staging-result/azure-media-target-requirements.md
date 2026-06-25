# Azure Media Target Requirements

Expected future provider/container:

```text
ice-rink-rentals-media
```

Expected future CDN/public base:

```text
https://media.iceskatingrinkrentals.com/
```

Required next-phase gates:

- Explicit Azure media upload approval.
- Confirm target storage account/container/provider without printing secrets.
- No keys, connection strings, SAS, or token output.
- Upload only files listed in the Azure media upload manifest.
- Read back uploaded blob metadata and SHA/size where available.
- Confirm `uploadApproved` is explicitly changed by the approved upload phase, not by V2.8.19B.

Production-bound deploy remains blocked after upload until isolated staging and owner validation are separately approved.
