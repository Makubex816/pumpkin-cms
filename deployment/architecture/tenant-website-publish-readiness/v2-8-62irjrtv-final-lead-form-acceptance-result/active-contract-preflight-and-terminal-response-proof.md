# Active Contract, Preflight, and Terminal Response Proof

Commits `5f22c82f`, `d2c78068`, and `3fe3bff9` add exact no-write preflight, canonical collision-safe field resolution, and explicit bounded response forwarding.

Exact fidelity-15 payload results: apex 200/5.058s, www 200/4.148s, missing required name 400/3.641s, invalid definition 404/1.671s, and direct API without key 401/1.803s. Every probe returned `createsFormEntry:false`. The contract resolved consent once, honeypot once, and 16 normalized runtime fields without ambiguous aliases.
