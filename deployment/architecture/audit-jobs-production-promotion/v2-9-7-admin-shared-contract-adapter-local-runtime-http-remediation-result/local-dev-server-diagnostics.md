# Local Dev-Server Diagnostics

Status: diagnostic evidence captured.

Before remediation:

- port `3000`: repo-local Admin Next listener command line `apps/admin/node_modules/next/dist/server/lib/start-server.js`;
- port `3001`: repo-local Admin Next listener command line `apps/admin/node_modules/next/dist/server/lib/start-server.js`;
- GET `http://127.0.0.1:3000/dashboard/audit-jobs` timed out.

First fresh probe after clearing `.next` exceeded the outer command timeout while only logging `Starting...`; its surviving repo-local child Next process was stopped.

Final deterministic Node harness:

- command: `npm run dev -- -H 127.0.0.1 -p 3000`;
- local URL: `http://127.0.0.1:3000/dashboard/audit-jobs`;
- stdout evidence:
  - `Next.js 14.2.35`;
  - `Ready in 1311ms`;
  - `Compiled /dashboard/audit-jobs in 4s`;
  - `GET /dashboard/audit-jobs 200 in 4208ms`;
- stderr evidence: none;
- process tree stopped after the check;
- remaining port 3000 owners: none.

The V2.9.5 warning is resolved for local route serving.

