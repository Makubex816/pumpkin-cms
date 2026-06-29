# Deferred Secret Rotation Recommendation

Recommendation: run a separate approved key rotation/security follow-up lane.

Reason:

Sensitive tenant/static contact key material was exposed during earlier operator troubleshooting. The public contact gate is now closed, but the key exposure should be cleaned up under a controlled rotation plan.

Recommended follow-up scope:

- Rotate the tenant/static contact API key used by the static contact bridge.
- Update only source-discovered runtime bindings required for the rotated key.
- Validate isolated proof before production proof.
- Use authenticated Admin readback to confirm persistence after rotation.
- Preserve the same hard stops used in this phase until explicit approval is granted.
- Do not print or write old or new secret values.

Not executed in V2.8.33C:

- No key rotation.
- No appsetting mutation.
- No deploy.
- No contact POST.
- No secret query or key generation.

This recommendation is a security hygiene follow-up, not a blocker to the V2.8.33C contact gate closeout.
