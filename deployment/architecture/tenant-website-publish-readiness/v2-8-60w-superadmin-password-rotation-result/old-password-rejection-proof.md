# Old Password Rejection Proof

Status: not run.

Reason:

Password rotation did not occur because the single approved Pumpkin API deploy attempt failed. Running old-password rejection proof before a successful rotation would be invalid.

Current-password check after deploy failure:

- Current password still logs in.
- Role returned: `SuperAdmin`.
- This confirms rotation did not occur.
