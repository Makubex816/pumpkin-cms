# Active Build Atlas Authority Pointer

- Active Atlas version: 3.6.0
- Status: blocked_pub20_a02_token_at_rest_security_contract_not_met
- Authority phase: PUB-20-A02
- Atlas package SHA-256: dea117fad213d23c5de1d6934684b4ed329a0e89218362ed7df2f51d1ab195c6
- Atlas manifest SHA-256: a975934f3eefddc3acff5f923927fc892c2c27ee3124cf7d0c07471bf1e3667b
- Working-memory version: 1.3.0
- Working-memory package SHA-256: 55cfa4a685fd5767ef3df5131ea28002af1f23d6e6b0fe4e07415a559aa2eb64

PUB-20-A02 preserved A01, proved the deterministic successor and public form contract, and retained one Free noindex fixture. One logical submission created one FormEntry; replay returned it and conflict was rejected. Closeout was later blocked because the required pre-commit approval file was absent, the deployment token remained plaintext at rest, and a safe no-post rollback artifact was not proven.

GhostDevStack, customers, Airstrip, indexing, email, payments, paid plans, and capacity are unchanged. Next gate: PUB-20-A03 security reconciliation.
