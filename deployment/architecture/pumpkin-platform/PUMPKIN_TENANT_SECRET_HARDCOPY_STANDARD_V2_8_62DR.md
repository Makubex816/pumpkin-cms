# Pumpkin Tenant Secret Hardcopy Standard V2.8.62DR

Create active credential hardcopies only after account creation and successful login. Store JSON and human-readable text outside the repo, restrict files to the current operator where supported, hash both files, and record only paths/checksums in repo reports. Maintain a metadata-only master register with exactly one active entry per tenant and no plaintext password or authentication material. Preserve superseded history. Delete temporary ignored handoff material only after all hardcopy/register gates pass.
