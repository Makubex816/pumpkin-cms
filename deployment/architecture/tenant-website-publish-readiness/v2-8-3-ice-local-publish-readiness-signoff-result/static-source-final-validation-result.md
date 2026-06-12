# Static Source Final Validation Result

Status: passed.

Commands:

```text
npm run validate
npm run validate:static:ice
npm run validate:static:roller
npm run type-check
```

Results:

| Check | Result |
| --- | --- |
| Ice seed validator | passed, 3 page documents |
| Ice static validator | passed, 3 pages, 3 published, 3 sitemap, 34 warnings |
| Roller static validator | passed, 31 warnings; paused tenant not resumed |
| Type-check | passed |
| Obsolete-route source scan | passed |

Scoped source changes in V2.8.3:

- normalized Ice fallback home links to `/service-areas`
- replaced old fallback page map with canonical `service-areas`
- normalized contact relationship metadata to `home`

