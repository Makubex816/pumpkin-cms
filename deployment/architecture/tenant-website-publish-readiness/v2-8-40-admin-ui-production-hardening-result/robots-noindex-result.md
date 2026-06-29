# Robots Noindex Result

Robots/noindex proof passed.

Source changes:

- `apps/admin/src/app/layout.tsx` sets Admin-wide robots metadata: `noindex, nofollow, noarchive`.
- `apps/admin/src/app/robots.ts` generates a crawler disallow-all `robots.txt`.
- `apps/admin/next.config.js` emits `X-Robots-Tag: noindex, nofollow, noarchive`.

Runtime proof:

- Isolated `/robots.txt`: HTTP 200, disallow-all true.
- Production `/robots.txt`: HTTP 200, disallow-all true.
- Isolated `/login`: robots metadata included noindex/noarchive.
- Production `/login`: robots metadata included noindex/noarchive.
- Production `X-Robots-Tag`: `noindex, nofollow, noarchive`.

No indexing tooling was used.

