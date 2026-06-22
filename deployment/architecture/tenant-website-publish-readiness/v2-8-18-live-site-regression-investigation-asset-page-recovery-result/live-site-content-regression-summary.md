# Live Site Content Regression Summary

Owner-facing issue: the live public website does not match the intended image-rich customer-facing experience.

Observed from local and deployment evidence, without production crawling in this phase:

- production-bound target has real custom domains attached
- production deploy evidence points to a sanitized/static build
- current deployable output has only three public routes
- current deployable output contains no image files
- current seed source has empty `backgroundImage`, `mainImage`, card `image`, Open Graph image, and Twitter image fields
- `apps/ice-rink-web/public` is missing
- Git history search did not find an older image-heavy page/source candidate

Result: the regression is content completeness, visual richness, and publishing-gate coverage. The route set may be technically valid, but it is not owner-complete as a public customer-facing website.

