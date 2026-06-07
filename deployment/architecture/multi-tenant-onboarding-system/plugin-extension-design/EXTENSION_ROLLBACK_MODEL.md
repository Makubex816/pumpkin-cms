# Extension Rollback Model

Rollback must define:

- how to disable the extension for one tenant
- how to revert routes added
- how to hide or remove CMS fields safely
- how to disable API endpoints
- how to handle migrated data
- how to validate after rollback

Rollback must not delete tenant data unless separately approved.

