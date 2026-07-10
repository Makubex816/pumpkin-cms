# Pumpkin API Kudu Backslash Path Runbook V2.8.61OSE

When Linux App Service OneDeploy fails with rsync `Invalid argument` on paths containing backslashes:

1. Stop deploy retries.
2. Verify the deployment ZIP entry names.
3. Rebuild the ZIP with forward-slash entry names if any entries contain `\`.
4. Use Kudu VFS/ZIP inventory to inspect `/home/site/wwwroot`.
5. Back up wwwroot outside the repo before cleanup.
6. Delete only confirmed malformed entries under `/home/site/wwwroot` whose names contain literal backslashes.
7. If no malformed runtime entries are confirmed, do not delete anything.
8. Deploy once with the POSIX-safe ZIP.
9. Probe the route without secrets.

V2.8.61OSE outcome:

- Existing wwwroot backup had zero backslash entries.
- No deletion was needed.
- POSIX-safe package deployed successfully.

