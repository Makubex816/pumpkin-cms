# OneDeploy 400 Diagnosis

V2.8.37 failure:

- Isolated Admin UI deployment failed with OneDeploy/Kudu HTTP 400.
- Deployment record from V2.8.37: `45998942-bc56-47ff-a3a0-976e76c1a3ed`.
- Deployment record status was `3` and not active.

Kudu detailed deployment logs showed the deployment running Linux rsync against extracted ZIP content. The failing paths contained Windows backslashes in ZIP entry names, such as `.next\...`, and rsync reported `Invalid argument`.

Diagnosis:

`zip_entry_backslash_paths_caused_linux_rsync_invalid_argument`

The package was not missing the main standalone artifacts. The failure was caused by path-entry shape, not by missing `server.js`, `.next/static`, or `node_modules`.
