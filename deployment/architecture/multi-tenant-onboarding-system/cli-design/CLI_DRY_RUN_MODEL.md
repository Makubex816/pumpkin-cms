# CLI Dry Run Model

Dry-run commands must:

- perform local validation only
- avoid external mutations
- use read-only public checks only when explicitly requested
- never write CMS records
- never deploy
- never submit Search Console/indexing
- never send email
- never change DNS or cloud resources

Dry run is the default behavior.

