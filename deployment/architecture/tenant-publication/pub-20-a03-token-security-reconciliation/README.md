# PUB-20-A03 token-security reconciliation and PUB-20 closeout

Status: complete_token_rotated_dpapi_protected_rollback_proven_pub20_closed_ready_for_pub30.

PUB-20-A02 remains truthful blocked evidence. PUB-20-A03 records the owner acknowledgement without claiming retroactive approval, corrects the POST accounting, rotates the Azure deployment token, proves restricted DPAPI storage and secure use, proves a no-POST rollback, restores the exact A02 live artifact, and closes PUB-20.

The reconciled sequence is one logical synthetic form submission: three ticket-preflight POSTs, three submission POSTs with statuses 201, 200, and 409, and seven separate denial-matrix POSTs. The changed-payload 409 was a live POST. A03 performed zero additional logical submissions and created zero additional FormEntries.

The exact A02 live artifact 227512fe26000e0fa933da51ec41a83e274cbb38b24bf15624de0b142271b4dd and manifest 80c9db24ab57d537e11eb86bfadb8d4e58f7cef87bf0c59978617c2224d98e54 were restored. Read-only runtime hashes matched, publication remains active and noindex, and exactly one synthetic FormEntry 917cdc0c0b6115108514278e394e141ab13f6ed7be7e50d716bd0c7d5f728cbb remains.

GhostDevStack DNS and control-plane state remained unchanged and held/unbound; current external parked-site HTTP redirects differ from the prior placeholder, are non-attributable drift, and resulted from no A03 action. Customer tenants and payloads, Airstrip, domains, DNS, TLS, indexing, external email, payments, API deployments, and S2/two-worker capacity were unchanged.
