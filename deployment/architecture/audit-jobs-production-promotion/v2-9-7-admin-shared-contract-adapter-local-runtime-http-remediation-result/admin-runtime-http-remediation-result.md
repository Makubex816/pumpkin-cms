# Admin Runtime HTTP Remediation Result

Status: remediated.

V2.9.5 warning:

`local_next_dev_server_listened_but_timed_out`

Remediation performed:

- inspected local listeners on ports `3000`, `3001`, `3002`, and `3003`;
- found stale repo-local Admin Next listeners on ports `3000` and `3001`;
- stopped only repo-local Admin/Next processes whose command lines pointed at `apps/admin/node_modules/next/dist/server/lib/start-server.js`;
- verified `apps/admin/.next` resolved under the Admin app root;
- removed only generated `apps/admin/.next`;
- started a fresh repo-local Admin dev server with `npm run dev -- -H 127.0.0.1 -p 3000`;
- verified `http://127.0.0.1:3000/dashboard/audit-jobs` returned HTTP `200`;
- stopped the started dev-server process tree;
- verified no local port 3000 owner remained.

No external URL was checked. No protected config was read.

