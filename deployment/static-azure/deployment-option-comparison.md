# Deployment Option Comparison

This compares the first real hosting decision for the Option C static-first workflow.

## Summary Recommendation

Recommended first path: **Azure Static Web Apps, staging first**.

Reason: it is the simplest controlled path for the current Next static export output, has cleaner custom-domain and HTTPS handling than raw Storage static website hosting, fits future GitHub automation, and keeps each public site isolated.

## Option 1: Azure Static Web Apps

Best use case:

- First real static deployment for Ice Skating Rink Rentals and Roller Rink Rentals.
- Teams that want managed TLS, custom domains, preview/staging workflow, and a direct path to GitHub-based deployment automation.

Pros:

- Good fit for prebuilt static site artifacts.
- Managed HTTPS and custom domain support are straightforward.
- One Static Web App per domain gives clean isolation.
- Easier rollback than mixed shared hosting.
- Pairs well with the existing dry-run artifact folders.
- Future GitHub Actions deployment can use guarded workflow templates and secret storage.

Cons:

- Requires an Azure Static Web Apps resource per site for clean separation.
- Deployment token management is still needed later.
- Advanced CDN/WAF rules may still live in Cloudflare.
- Static form endpoint remains separate.

Cost considerations:

- Usually approachable for small static sites, but final pricing depends on selected plan, bandwidth, environments, and Azure account terms.

Complexity:

- Low to medium.

Custom domain handling:

- Built into Static Web Apps.
- Configure apex and `www` decisions per domain.

SSL/HTTPS handling:

- Managed by Azure Static Web Apps for configured custom domains.
- Cloudflare can sit in front if desired after origin TLS is verified.

Cloudflare fit:

- Good.
- Use Cloudflare for DNS, WAF, cache rules, and future purge once Azure origin is stable.

GitHub Actions fit:

- Strong.
- Later automation can upload the dry-run artifact with placeholder-secret templates converted into real workflows.

Rollback simplicity:

- Good.
- Re-upload previous validated artifact or use deployment history where available.

Form endpoint implications:

- No built-in Next API route in static output.
- Use separate Azure Function or public form endpoint.

Recommendation score:

- `9/10`

## Option 2: Azure Storage Static Website + Cloudflare

Best use case:

- Lowest-level static file hosting when the team wants Storage-backed `$web` containers and plans to rely on Cloudflare for public HTTPS/CDN behavior.

Pros:

- Simple static file storage model.
- `$web` container maps naturally to the dry-run upload folder.
- Cloudflare can provide CDN/WAF/cache behavior in front.
- Storage artifact replacement is easy to reason about when isolated by account/site.

Cons:

- Custom-domain HTTPS is less direct than Static Web Apps.
- Usually needs Cloudflare, Azure CDN, or Front Door for polished public HTTPS.
- Upload/sync scripts must be careful not to delete or mix tenant files.
- Less native app-style deployment ergonomics than Static Web Apps.

Cost considerations:

- Storage costs can be low for small sites, but bandwidth, operations, Cloudflare plan, CDN/Front Door, and HTTPS architecture can change the total cost.

Complexity:

- Medium.

Custom domain handling:

- DNS points to Storage/CDN/Front Door/Cloudflare path.
- Apex and `www` handling require more planning.

SSL/HTTPS handling:

- Raw Storage static website custom-domain HTTPS is the main caution.
- Use Cloudflare, Azure CDN, or Azure Front Door to terminate HTTPS.

Cloudflare fit:

- Very strong if Cloudflare is intended to be the public edge.

GitHub Actions fit:

- Good, but deployment scripts need Azure Storage credentials and careful upload behavior.

Rollback simplicity:

- Medium.
- Re-upload previous artifact or restore prior `$web` contents.
- Versioned artifact retention is important.

Form endpoint implications:

- Same as Static Web Apps.
- Static forms need Azure Function, Pumpkin public endpoint, CRM endpoint, or another external service.

Recommendation score:

- `7/10`

## Option 3: Hold Deployment And Keep Building

Best use case:

- Content, forms, admin publishing UX, or tenant launch details are not ready enough to expose a public staging host.

Pros:

- Avoids early infrastructure decisions.
- Gives time to improve admin publishing, content review, form endpoint, and deployment automation.
- Avoids public confusion from local-proof copy or noindex/canonical mistakes.

Cons:

- Delays real infrastructure learning.
- Staging feedback remains hypothetical.
- Cloudflare/Azure DNS details remain untested.
- Stakeholders cannot inspect real hosted static output.

Cost considerations:

- Lowest immediate cloud cost.
- Higher schedule risk if deployment issues are discovered late.

Complexity:

- Low now, higher later.

Custom domain handling:

- Deferred.

SSL/HTTPS handling:

- Deferred.

Cloudflare fit:

- Deferred.

GitHub Actions fit:

- Deferred.

Rollback simplicity:

- Not applicable until deployment exists.

Form endpoint implications:

- Gives time to implement Azure Function or another form path before public staging.

Recommendation score:

- `6/10`

## Decision Matrix

| Criterion | Static Web Apps | Storage + Cloudflare | Hold Deployment |
| --- | ---: | ---: | ---: |
| Fastest safe staging path | 9 | 7 | 4 |
| Custom-domain simplicity | 9 | 6 | 0 |
| HTTPS simplicity | 9 | 5 | 0 |
| Cloudflare compatibility | 8 | 9 | 0 |
| GitHub automation fit | 9 | 7 | 5 |
| Rollback clarity | 8 | 7 | 0 |
| Form endpoint readiness | 6 | 6 | 8 |
| Overall | 9 | 7 | 6 |

## Final Recommendation

Choose **Azure Static Web Apps, staging first** unless Timothy decides the remaining Roller local-proof copy and static form endpoint gap should block all public staging.
