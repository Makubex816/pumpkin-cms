# V2.8.17C Carryforward

V2.8.17C established the immediate corrective input for this phase:

- `SWA_CLI_DEPLOY_DRY_RUN` was `false`.
- `DEPLOYMENT_ACTION` was `upload`.
- Deployment id `b20c5b8a-b569-404d-a5b2-e3e3f0a5a946` was emitted.
- Exactly one V2.8.17C corrected deployment attempt was sent.
- The attempt failed because the current directory was identical to or contained within the artifact folder.
- Production route checks were not run in V2.8.17C.

V2.8.17D corrected only that working-directory and artifact-folder relationship. It did not reset the token, run dry-run, deploy from repo root, deploy from the artifact root, list keys, read protected config, or broaden the approved scope.

