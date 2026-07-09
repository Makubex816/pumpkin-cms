# Package Shape Summary

Source ZIP:

`pp_next_pumpkin_ready_2026-07-08 1.zip`

Analyzer uploaded root:

`pp_next_pumpkin_ready_2026-07-08`

Inventory:

- Files: 1902.
- Directories: 91.
- `.next/` output present: yes.
- `.next/` file count: 1242.
- Source app files detected: 5.
- Static/generated `.html` files: 391.
- `.next/server/app` HTML files: 389.

Framework shape:

- Framework: Next.js.
- Router: App Router.
- Rendering mode candidate: `hybrid_next_server_required`.
- Source catch-all route: `party-pros-frontend/src/app/[...slug]/page.tsx`.
- Generated catch-all output also appears under `.next/server/app/[...slug]/`.
- Source and generated output both exist, so the compiler must distinguish source routes from generated static passthrough candidates.

Deployment and manifest artifacts observed:

- `party-pros-frontend/_redirects`
- `party-pros-frontend/.htaccess`
- `party-pros-frontend/.next/routes-manifest.json`
- `party-pros-frontend/.next/prerender-manifest.json`
- `party-pros-frontend/.next/server/app-paths-manifest.json`

Readiness interpretation:

The package is not a pure static export. It includes substantial prebuilt static HTML, but the catch-all App Router route and hybrid classification require compiler/runtime handling before launch approval.

