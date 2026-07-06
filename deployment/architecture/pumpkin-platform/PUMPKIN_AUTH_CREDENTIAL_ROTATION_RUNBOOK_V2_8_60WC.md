# Pumpkin Auth Credential Rotation Runbook V2.8.60WC

Date: 2026-07-05

## Current State

The direct operator rotation proof reports success, but repo-safe documentation closeout is blocked by a TXT hardcopy checksum mismatch.

## Reconciliation Steps

1. Do not rotate again from Codex.
2. Do not read hardcopy contents in repo workflows.
3. Owner/operator should determine whether the prompt-provided TXT SHA-256 or computed TXT SHA-256 is authoritative.
4. If computed value is authoritative, approve a new documentation-only closeout with that value.
5. If prompt value is authoritative, regenerate or repair the outside-repo hardcopy outside Codex and provide a new redacted proof.
6. Rerun documentation closeout, then run GET-only runtime no-regression if checksum gates pass.

## Hard Stops

- Any raw password or hash in redacted proof.
- Any mismatch between approved expected checksum and computed hardcopy checksum.
- Any need to read hardcopy content.
- Any deploy, DNS/custom-domain action, contact POST, form submission, media/content mutation, user/role/tenant mutation, key/listKeys, SAS, or Key Vault query.

