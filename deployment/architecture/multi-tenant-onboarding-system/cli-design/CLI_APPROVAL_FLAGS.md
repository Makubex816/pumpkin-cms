# CLI Approval Flags

Future mutation commands should require explicit flags such as:

```text
--approve-gate staging-deployment
--tenant example-rink-rentals
--profile static-azure-cloudflare-worker-graph
--approval-file approvals/staging.md
```

The CLI should reject mutation commands without an approval file and matching gate.

