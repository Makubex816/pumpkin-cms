# Next Priority Roadmap

1. Run authenticated Pumpkin API read-only proof using approved Admin/API values: `/api/admin/tenants`, `/api/admin/pages`, content hierarchy, media assets, publish runs, import runs, and public sitemap.
2. Decide whether active `Page` content should be seeded/imported from approved package sources; do not write content without explicit approval.
3. Deploy or stage Admin UI only under a separate approval, then verify tenant switching and read-only page/content workflows.
4. Build a tenant registry/profile source to reduce hardcoded Ice/Roller branching.
5. Prepare Roller tenant activation plan: tenant record, key proof, media binding, static runtime, and read-only Admin proof.
6. Add backup/monitoring hardening for shared multi-tenant resources.
7. Keep Theme and Form Definition implementation out of scope until explicitly approved.
