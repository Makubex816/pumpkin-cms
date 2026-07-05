# Old Password Rejection Proof

Status: not achieved.

Reason:

The live rotation request was rejected by source password policy before changing the credential.

Current state:

- The current Spectre Dev password still logs in.
- Role returned: `SuperAdmin`.
- Tenant returned: `ice-rink-rentals`.

Classification:

`old_password_still_valid_because_rotation_did_not_complete`

This is not a critical post-rotation failure because rotation did not complete.
