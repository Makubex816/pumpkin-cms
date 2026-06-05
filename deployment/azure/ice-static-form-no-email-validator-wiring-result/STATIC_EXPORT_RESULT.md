# Static Export Result

Generated: 2026-06-05

## Command

Run from:

```text
apps/ice-rink-web
```

Command:

```text
npm run export:static:ice:cms
```

Result:

```text
exit 0
```

## Snapshot Result

Snapshot command result:

```text
ok=true
pageCount=3
publishedCount=3
unpublishedCount=0
themeSnapshot=true
```

Snapshot slugs:

```text
contact
home
service-areas
```

Excluded non-approved slugs:

```text
events-holiday-activations
ice-rink-rentals
phase-5a-csv-import-54754949
```

## Static Generate Result

Static publish generate result:

```text
ok=true
pageCount=3
publishedCount=3
sitemapCount=3
redirectCount=0
warningCount=7
```

Output artifact directory:

```text
apps/ice-rink-web/.static-artifacts/ice-rink-rentals
```

## Route Result

Approved content routes in `apps/ice-rink-web/out`:

```text
/
/contact
/service-areas
```

Approved content routes in copied artifact output:

```text
/
/contact
/service-areas
```

Next.js also emitted the expected `404` artifact.

Preview/obsolete deployable paths:

```text
0
```

## Warnings

The export completed with existing non-form warnings:

- `staticPublishing.needsRebuild is true`
- missing fulfillment metadata on `contact` and `home`
- non-direct fulfillment disclosure warning on `service-areas`
- preview route output was removed from copied static artifacts
- existing Next/ESLint build warnings for hook dependency, `<img>` usage, rewrites, and `fs` resolution warning in an imported package build

The previous static form endpoint blocker warnings were cleared in this local no-email validation context.

## Failed Guarded Attempt

An initial guarded run with admin token access intentionally blocked failed before export because published/sitemap discovery returned no Ice pages and theme returned 401. The final successful run used the normal active CMS read environment with a clean temporary directory so the local temp admin token file was not read. No CMS writes occurred.
