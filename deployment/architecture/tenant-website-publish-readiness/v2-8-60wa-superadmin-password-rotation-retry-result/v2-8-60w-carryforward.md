# V2.8.60W Carryforward

V2.8.60W carryforward:

- Password route source repair succeeded.
- Minimal SuperAdmin-only self password route was added at `POST /api/admin/users/{tenantId}/{userId}/password`.
- Route verifies current password with BCrypt.
- Route hashes new password with BCrypt.
- Route is self-targeting.
- Route returns no password or hash.
- Focused tests passed.
- Pumpkin API Release build passed.
- Previous deploy failed in Kudu/OneDeploy parallel rsync with deployment id `0d230f3b-019f-4f41-8d9c-04434a9c34fd`.
- Live route probe previously returned HTTP 404.
- Password rotation was not attempted in V2.8.60W.
- Current Spectre Dev password still worked.
- New hardcopy folder existed outside repo but was empty.
- Secure retry file remained retained and ignored.

V2.8.60W-A resolved the deploy blocker with a POSIX ZIP, but stopped after the live route rejected the new password under source policy.
