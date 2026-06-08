# Candidate Selection Criteria

The first real tenant pilot should use the simplest safe candidate available.

## Required Candidate Traits

- A clear business owner is available for review and signoff.
- The site has a small, well-understood page set.
- Routes are simple and do not depend on custom routing behavior.
- The primary domain and `www` preference are known, or the owner approves a placeholder until DNS planning.
- Media assets are already approved for public use, or placeholders are acceptable.
- The lead recipient owner is known.
- Form routing can be represented with `leadRecipientRef` and, where needed, legacy `recipientGroup` compatibility.
- Legal and privacy review status is known, even if the answer is `pending`.
- Analytics or tracking preference is known, even if the answer is `disabled for pilot`.
- There is no urgent launch deadline.
- There is no required external integration for the dry run.
- The owner accepts that Search Console and indexing remain closed final gates.

## Strongly Preferred Traits

- Five or fewer public content routes.
- One lead form.
- One service area or a small service-area list.
- No ecommerce.
- No login area.
- No customer account data.
- No embedded private calendars or booking tokens.
- No live dependency on third-party quote, payment, or availability systems.
- Content source is owner-supplied text, an existing public site, or an approved draft.
- Images can be represented by local approved filenames, public non-tokenized URLs, or placeholders.

## Exclusion Criteria

Do not choose a candidate for the first pilot if:

- the owner cannot identify who approves content, legal/privacy, forms, monitoring, rollback, and indexing
- the project requires secrets in intake
- the project requires private customer data
- the project has unresolved legal/privacy risk that the owner will not acknowledge
- the site requires live email delivery during the dry run
- the site requires DNS, Cloudflare, Azure, CMS, or deployment changes before validation
- the domain owner is unknown
- content includes regulated claims that need specialist review before drafting
- the tenant is Roller-related unless the user explicitly approves a Roller-specific resumed gate

## First Pilot Recommendation

Choose a low-complexity brochure-style tenant with one clear owner, one lead path, approved placeholder-safe media, and no dependency on live external services.
