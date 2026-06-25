# Azure Upload Target Requirements

Expected future provider/container:

```text
ice-rink-rentals-media
```

Expected future public base:

```text
https://media.iceskatingrinkrentals.com/
```

V2.8.19C did not upload to Azure.

Future upload/readback requirements:

- Explicit Azure media upload execution approval must be granted in a later phase.
- `ownerAllowsAzureMediaUploadNextPhase` is currently false, so upload execution remains blocked.
- Do not print keys, connection strings, SAS, deployment tokens, or protected config.
- Upload only approved rows from the final upload manifest.
- Contact replacement rows must remain excluded unless owner approval changes.
- Read back blob names, content type, size, and metadata after upload.
- Do not deploy SWA as part of media upload/readback.
