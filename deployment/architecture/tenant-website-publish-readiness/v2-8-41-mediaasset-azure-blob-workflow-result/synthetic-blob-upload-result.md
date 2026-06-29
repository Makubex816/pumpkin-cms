# Synthetic Blob Upload Result

Result: pass.

Exactly one synthetic non-PII PNG upload was attempted.

- Trace ID: `v2-8-41-20260629175421-107d7805`.
- Blob: `ice-rink-rentals/assets/__pumpkin-proof/v2-8-41/pumpkin-v2-8-41-20260629175421-107d7805.png`.
- Size: `70` bytes.
- Storage account: `iceskatingmedia`.
- Container: `ice-rink-rentals-media`.
- Auth mode: login-based Azure storage data plane.
- Upload observed after the wrapper interruption: yes.
- Existence after upload: `true`.

The first storage wrapper issue occurred before upload. The second wrapper reached the upload, and the proof blob was observed in the proof prefix. No second upload was sent.
