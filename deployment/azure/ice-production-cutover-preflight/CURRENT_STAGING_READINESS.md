# Current Staging Readiness

Generated: 2026-06-06

## Summary

Ice Azure default-host staging is ready for the approved staging boundary.

| Gate | Status |
| --- | --- |
| official fresh CMS-backed export verified | yes |
| static route output ready | yes |
| media production URL readiness | yes |
| contact form production readiness | yes |
| static output quality gates | yes |
| Azure staging resource readiness | yes |
| Azure staging deployment completed | yes |
| staging form browser-origin readiness | yes |
| Azure staging smoke test passed | yes |
| Azure staging readiness | yes for default-host staging |
| DNS cutover readiness | no, pending explicit approval |
| production/indexing readiness | not live-ready |
| Roller | paused |

## Staging Host

```text
https://happy-mud-0b375e20f.7.azurestaticapps.net
```

Passing staging checks from prior result docs:

- `/` returned 200
- `/contact` returned 200
- `/service-areas` returned 200
- `/sitemap.xml` returned 200
- `/robots.txt` returned 200
- obsolete routes returned 404
- static assets passed
- 9 media URLs passed
- strict snapshot/static/staging validators passed
- contact form endpoint URL is present
- staging-origin OPTIONS now passes after approved CORS enablement

No valid form lead was submitted in the CORS enablement pass, and no email was sent.
