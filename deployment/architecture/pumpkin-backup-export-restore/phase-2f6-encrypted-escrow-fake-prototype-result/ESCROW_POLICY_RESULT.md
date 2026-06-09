# Escrow Policy Result

Policy validation requires:

- fake-only request, policy, catalog, and recipient metadata;
- recovery escrow mode;
- approval record;
- reason;
- runtime-generated public key metadata;
- allowlisted categories only;
- blocked short-lived/session categories excluded;
- fake values not matching high-risk detector patterns;
- standard backups to remain escrow-free.

Negative tests cover missing approval, invalid recipient metadata, disallowed categories, blocked categories, and detector-matching fake values.
