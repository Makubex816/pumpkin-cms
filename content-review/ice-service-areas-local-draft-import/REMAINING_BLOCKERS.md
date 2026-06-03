# Remaining Blockers

## Before CMS/Live Approval

- Manual browser review of /service-areas is required.
- Human approval must be recorded before any live/published state change.
- productionApproved and publishApproved remain false.

## Before Static Regeneration

- Static generation is not authorized in this run.
- Azure Blob/Cloudflare media path is not verified for production/static media.
- staticPublishing.staticEligible remains false.

## Before Production/Indexing

- Deployment, DNS, provider, and email changes are not authorized.
- Public contact/phone/email display policy remains under review.
- Production/indexing requires separate explicit approval after static output and deployment checks.
