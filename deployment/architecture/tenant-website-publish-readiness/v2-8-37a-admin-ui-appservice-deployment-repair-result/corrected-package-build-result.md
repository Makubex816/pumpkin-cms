# Corrected Package Build Result

Admin build/type-check result:

- `npm --prefix apps/admin run build`: passed.
- `npm --prefix apps/admin run type-check`: passed when rerun after the build.

Build warnings observed:

- Existing React hook dependency warnings in Admin pages.
- Existing `pumpkin-ts-models` warning involving a server-side module reference.

Corrected package assembly:

- Copied `.next/standalone` to a temporary artifact root.
- Copied `.next/static` into the artifact root.
- Included `public` when present.
- Wrote minimal non-secret start metadata into the temporary artifact root package metadata.
- Created ZIP entries with forward slashes.

Local smoke proof:

- `/`: HTTP 200.
- `/login`: HTTP 200.
- Login page contained expected auth text.
- Static references were present.
