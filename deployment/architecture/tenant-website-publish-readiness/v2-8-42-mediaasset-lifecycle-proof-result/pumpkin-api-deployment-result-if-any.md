# Pumpkin API Deployment Result

Result: failed.

Deployment was required because a MediaAsset cleanup source fix was implemented.

Observed deployment:

- Deployment id: `8fd507e5-f9a8-48a0-a5a6-65065dbf9b16`.
- Deployer message: `OneDeploy`.
- Latest observed status: failed.
- Failure class: `kudu_rsync_invalid_argument_windows_path_entries`.

Safe log summary:

- Kudu attempted to sync 56 files to `/home/site/wwwroot`.
- Parallel rsync returned exit code 23.
- The log showed invalid-argument failures for ZIP entries containing Windows-style backslash paths, including `DataSample\page.json` and runtime library paths.

Hard-stop consequence:

No live MediaAsset record writes were attempted after deployment failed.
