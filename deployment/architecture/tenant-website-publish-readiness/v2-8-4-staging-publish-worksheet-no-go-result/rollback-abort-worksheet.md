# Rollback And Abort Worksheet

Status: worksheet prepared; rollback execution not approved.

Abort immediately if:

- protected config or secret material is required
- exact staging target is ambiguous
- sanitized build proof is missing
- static validation fails
- owner form approval is missing
- media/content approval is missing
- deployment token handling is unclear
- DNS target or record type is unclear
- any command would touch production domains
- any command would perform CMS/provider writes

Rollback preparation required before staging execution:

- identify previous known-good artifact or confirm no previous staging artifact exists
- record artifact run ID and commit SHA
- record staging target and default hostname
- record DNS changes, if any are separately approved
- record cache purge owner, if any purge is separately approved
- define route verification list: `/`, `/service-areas`, `/contact`, `/sitemap.xml`, `/robots.txt`

No destructive rollback deletion was performed.

