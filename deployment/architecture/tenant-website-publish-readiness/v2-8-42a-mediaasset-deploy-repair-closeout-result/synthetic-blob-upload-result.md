# Synthetic Blob Upload Result

Result: partial, consumed.

- Trace ID: `v2-8-42a-20260629185450-e6dd9366`.
- Upload command invoked: once.
- Matching uploaded blob observed before continuation: yes.
- Second upload attempted: no.

The first proof harness uploaded the blob but failed locally before it recorded the upload status in the safe summary. A read-only continuation check found exactly one matching proof blob. Because the upload was already consumed, V2.8.42A did not attempt another upload.

