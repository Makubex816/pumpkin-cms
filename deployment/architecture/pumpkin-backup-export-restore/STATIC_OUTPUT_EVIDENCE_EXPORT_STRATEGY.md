# Static Output Evidence Export Strategy

## Purpose

Static output/evidence export captures what was generated or validated, without making static generation or deployment part of backup creation.

## Included Evidence

- Static generation manifest, if available.
- Route list.
- Sitemap/robots/canonical evidence.
- Public payload hygiene result.
- Asset manifest.
- Validator reports.
- Release/readiness summaries.
- Checksums for evidence files.

## Exclusions

- Generated output staged into git.
- Live deployment artifacts unless a deployment gate separately approves.
- Search Console/indexing evidence unless a final indexing gate has already approved it.
- Secrets, auth headers, cookies, and protected config.

## Restore Use

Static evidence helps compare a restored tenant against the last known safe output. It is not a production deployment artifact by itself.
