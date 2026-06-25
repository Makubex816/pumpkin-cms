# Risk and Open Decisions

Open decisions:

- Owner visual/content approval is still required.
- Production-bound deployment requires a separate explicit approval.
- DNS, custom domains, Search Console/indexing, and live publication remain out of scope.
- Contact form live submission was not tested and remains out of scope for this phase.

Risks and notes:

- `npm run validate:static:ice` passes but still reports the existing 34 local workflow/static-publishing metadata warnings.
- The current public output renders 8 of 9 mapped Azure media URLs. The mapped site logo URL is not rendered because the current public header/theme does not emit a logo image URL.
- The SWA CLI reported an unrelated legacy generated `routes.json` and ignored it during deployment.
- Owner should visually inspect all image choices before any production-bound approval.

No blocking issue remains for isolated staging owner review.
