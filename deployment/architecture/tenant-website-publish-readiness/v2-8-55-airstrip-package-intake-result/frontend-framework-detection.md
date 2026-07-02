# Frontend Framework Detection

Classification: Next.js source app with bundled Pumpkin helper packages.

Detected app:

- Path: `pumpkinairstrip/apps/airstrip-frontend`
- Package name: `airstrip-frontend`
- Framework: Next.js with App Router
- React present: yes
- TypeScript present: yes
- Tailwind present: yes
- Package manager evidence: npm through `package-lock.json`

Detected scripts:

- `dev`: `next dev --port 3001`
- `build`: `next build`
- `start`: `next start --port 3001`
- `lint`: `next lint`
- `type-check`: `tsc --noEmit`
- `seed`: `node scripts/seed-airstrip.js`

Runtime/env names referenced by source:

- `NEXT_PUBLIC_API_URL`
- `PUMPKIN_API_KEY`
- `PUMPKIN_TENANT_ID`

Static output status:

- No static HTML files detected.
- No app-level `out/` static export detected.
- Next config did not show static export mode in the inspected metadata.

No dependency install or script execution was run.

