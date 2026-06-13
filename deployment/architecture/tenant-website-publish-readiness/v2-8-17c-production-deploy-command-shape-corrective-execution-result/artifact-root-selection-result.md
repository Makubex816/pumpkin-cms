# Artifact Root Selection Result

Status: passed.

Selected artifact root:

```text
apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260613172317/repo/apps/ice-rink-web/out
```

Root selection basis:

- fresh V2.8.17C sanitized build output;
- build included the approved public static form endpoint environment;
- canonical Ice routes present: `/`, `/service-areas`, `/contact`;
- `index.html`, `service-areas/index.html`, and `contact/index.html` present;
- `sitemap.xml`, `robots.txt`, and `static-publish-manifest.json` present;
- no `routes.json` present in the artifact root;
- no `.env.local` or protected config present in the artifact root.

The V2.8.17C deployment attempt was run from this artifact root as approved. That command shape is now classified as invalid by the deployment client because the current directory was identical to the artifact folder.

