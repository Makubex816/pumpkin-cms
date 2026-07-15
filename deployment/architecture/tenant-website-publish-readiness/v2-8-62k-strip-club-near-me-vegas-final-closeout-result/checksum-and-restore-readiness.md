# Checksums and Restore Readiness

All 28 JSON files parse and all 329 checksum entries verify with zero mismatch. Backup manifest SHA-256 is `7938D38654AF138E34003DCAE063225EBB8BC9FA673BF1E15382CB080D782C5B`; checksum manifest SHA-256 is `F05EFB4DAD0343167DFE361988A085C1CE15CE7632F0B0BA79A8251A22CCEDD8`.

Restore in the prescribed 16-stage order. Preserve FormEntry/submission/correlation/idempotency identifiers and re-establish duplicate protection before writes. Runtime-key material must be restored or rotated separately. No live restore occurred.
