# Isolated Staging Preview Readiness

Status: ready for separate approval, not executed in V2.8.19F.

V2.8.19F produced locally validated source that is ready to be considered for an isolated staging preview phase.

Allowed next target after approval:

`swa-ice-static-isolated-staging`

Still not approved:

- Deploy to `swa-ice-static-staging`.
- Deploy to production-bound custom domains.
- DNS/custom-domain mutation.
- Search Console/indexing.
- Azure media upload or mutation.
- Contact-form POST.
- Production crawling.
- Live outbound URL checks.

The next isolated staging phase should use the exact approval prompt in `next-phase-prompt.md`.
