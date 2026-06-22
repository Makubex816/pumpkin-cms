# Root Cause Evidence

## Proven

1. `swa-ice-static-staging` is production-bound.

Azure hostname metadata lists `iceskatingrinkrentals.com` and `www.iceskatingrinkrentals.com` as `Ready` custom domains on `swa-ice-static-staging`.

2. A minimal sanitized/static artifact was deployed to the production-bound target.

V2.8.17D records deployment id `96fd744f-5589-4ac3-bebb-cfa99048dc0e`, artifact run `sanitized_20260613174033`, and target `swa-ice-static-staging`.

3. The discovered source/output is not image-rich.

Current source has empty image fields, `apps/ice-rink-web/public` is missing, and current deployable output contains no image files.

4. Isolated staging was used, but content-completeness gates were insufficient.

V2.8.14C and V2.8.15 show isolated staging deployment and verification. Those gates verified route availability and technical readiness, not owner-level visual/content completeness against the older image-rich public site.

## Likely But Unproven

The older image-heavy site was either never captured in this repository, existed on the prior hosting target, existed in CMS/media/backups not inspected here, or existed as external owner/design assets.

The exact disappearance point is not proven by this phase because production crawling, live URL checks, DNS mutation, and old-host inspection were not approved.

