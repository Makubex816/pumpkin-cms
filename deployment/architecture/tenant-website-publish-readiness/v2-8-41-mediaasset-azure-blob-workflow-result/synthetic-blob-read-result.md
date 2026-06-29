# Synthetic Blob Read Result

Data-plane read result: pass.

- Proof blob existed after upload: `true`.
- Proof prefix contained the V2.8.41 blob after upload: yes.
- Container public access mode: `blob`.

Public HTTP result: caveat.

The direct public HTTP HEAD check for the synthetic blob was not captured before cleanup because the runner built the URL from a PowerShell array object. Cleanup had already completed before the issue was recognized, and V2.8.41 did not send a second upload.

Classification: `media_blob_data_plane_verified_public_http_direct_observation_gap`.
