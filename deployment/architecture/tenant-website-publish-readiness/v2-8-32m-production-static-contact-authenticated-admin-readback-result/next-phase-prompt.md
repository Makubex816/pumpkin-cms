# Next Phase Prompt

Approve V2.8.32N Production Static Contact POST and Custom-Header Admin FormEntry Readback only: rerun the bounded V2.8.32M gate after setting `PUMPKIN_FORMENTRY_READBACK_AUTH_MODE=custom-header`, `PUMPKIN_FORMENTRY_READBACK_AUTH_HEADER_NAME`, and the hidden `PUMPKIN_FORMENTRY_READBACK_AUTH_VALUE`; preflight the approved Admin FormEntry read route with exactly that custom header; do not print or write the auth value; submit exactly one synthetic non-PII production POST to `https://iceskatingrinkrentals.com/api/static-contact` only if all preflight gates pass; read back the returned entry ID or trace through the Pumpkin API/Admin FormEntry read route; do not deploy, mutate app settings, mutate Azure resources, mutate DNS/custom domains, run Search Console/indexing, read protected config files, access inbox/provider systems, or submit more than one production contact POST.

Exact carryforward blocker: `readback_custom_header_env_missing`.
