# User Flow Overview

## Flow Summary

1. Start a new tenant package or resume an existing draft.
2. Confirm what the user needs before starting.
3. Enter tenant identity and business basics.
4. Choose deployment profile.
5. Enter business/domain intake.
6. Set approved routes and forbidden routes.
7. Add page outlines and content placeholders.
8. Add media and image metadata.
9. Configure form/email intake using public references only.
10. Set SEO, canonical, robots, and sitemap policy.
11. Record legal, privacy, analytics, monitoring, rollback, and owner decisions.
12. Review generated package preview.
13. Run the offline validator.
14. Fix issues with inline guidance.
15. Export the import package when allowed.
16. Export the support packet.
17. Hand off to an operator for manual review.

## User Mental Model

The builder should feel like filling out a guided intake form. The user should not need to know what `tenant.json`, `routes.json`, or `seo.json` are, but every answer must map to those files predictably.

## Stop-And-Ask Pattern

Every step should include a simple stop condition:

- stop if another tenant name appears
- stop if a secret, token, password, private URL, or connection string appears
- stop if DNS, deployment, email, Search Console, or indexing work is requested
- stop if the user is unsure who owns content, legal/privacy, forms, monitoring, or rollback

## Search Console And Indexing

Search Console/indexing is not part of package generation. The builder may collect the intended indexing owner and show the final hard stop, but it must not submit a property, sitemap, URL inspection request, or indexing request.
