# Runtime QA Evidence Upload Result

Status: blocked before upload.

Reason:

- Azure Identity/RBAC blob list was denied for `runtime-qa-staging`.
- Upload was not attempted.
- No keys/listKeys, connection string, SAS, protected config, or secret export was used.

Local ignored evidence records:

- `.tmp/v2-6-1-runtime-qa-evidence/RUNTIME_QA_UPLOAD_RESULT.json`

The result records `status: blocked`, `uploadedFiles: []`, and confirms the intended auth path would be Azure Identity/RBAC only.
